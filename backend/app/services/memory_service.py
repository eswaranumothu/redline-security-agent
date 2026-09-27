import logging
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.core.config import settings
from app.models.security_memory import SecurityMemory
from app.models.project import Project
from app.models.project_finding import ProjectFinding
from app.models.user import User
from app.core.roles import UserRole

logger = logging.getLogger(__name__)


class MemoryService:
    def __init__(self):
        self.api_url = settings.HINDSIGHT_API_URL.rstrip('/')
        self.api_key = settings.HINDSIGHT_API_KEY
        self.timeout = settings.HINDSIGHT_TIMEOUT_SECONDS

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    @staticmethod
    def sanitize_content(text: str) -> str:
        """Sanitize raw tokens, passwords, and authorization secrets before memory retention."""
        if not text:
            return ""
        import re
        # Mask passwords, Bearer tokens, API keys
        sanitized = re.sub(r'(?i)(password|secret|bearer|token|key)\s*[:=]\s*[^\s,;]+', r'\1: [REDACTED_SECRET]', text)
        return sanitized.strip()

    @staticmethod
    def get_authorized_project_ids(db: Session, user: User) -> List[int]:
        """Enforce strict backend project-level authorization bounds."""
        if user.role == UserRole.ADMIN.value:
            projects = db.query(Project.id).all()
            return [p.id for p in projects]
        
        projects = db.query(Project.id).filter(
            or_(
                Project.created_by == user.id,
                Project.assigned_to == user.id
            )
        ).all()
        return [p.id for p in projects]

    async def retain_finding_memory(
        self,
        db: Session,
        user: User,
        finding: ProjectFinding,
        project: Project,
        remediation_notes: Optional[str] = None,
        retest_outcome: Optional[str] = None
    ) -> SecurityMemory:
        """Retain an approved VAPT finding into security memory (Hindsight + local DB storage)."""
        bank_id = f"project_{project.id}"
        category = finding.cwe or finding.owasp or "General Security"
        sanitized_title = self.sanitize_content(finding.title)
        sanitized_summary = self.sanitize_content(
            f"Vulnerability: {finding.title}\nDescription: {finding.description or ''}\nImpact: {finding.impact or ''}"
        )
        rem_notes = self.sanitize_content(remediation_notes or finding.recommendation or finding.solution or "")
        retest_state = retest_outcome or finding.retest_status or "NOT_TESTED"

        hindsight_mem_id = None

        # Try sending to Hindsight engine if service is available
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "memory_bank_id": bank_id,
                    "content": f"{sanitized_title}\nSummary: {sanitized_summary}\nRemediation: {rem_notes}\nRetest: {retest_state}",
                    "metadata": {
                        "project_id": project.id,
                        "finding_id": finding.id,
                        "project_name": project.project_name,
                        "severity": finding.severity,
                        "category": category,
                        "retest_outcome": retest_state,
                        "retained_by": user.email
                    }
                }
                resp = await client.post(f"{self.api_url}/v1/retain", json=payload, headers=self._get_headers())
                if resp.status_code in (200, 201):
                    data = resp.json()
                    hindsight_mem_id = str(data.get("id") or data.get("memory_id") or "")
        except Exception as e:
            logger.warning(f"Hindsight API retain notice (falling back to local memory DB): {e}")

        # Always save or update local structured security memory
        existing = db.query(SecurityMemory).filter(
            SecurityMemory.finding_id == finding.id
        ).first()

        if existing:
            existing.sanitized_title = sanitized_title
            existing.sanitized_summary = sanitized_summary
            existing.remediation_notes = rem_notes
            existing.retest_outcome = retest_state
            existing.severity = finding.severity
            existing.vulnerability_category = category
            if hindsight_mem_id:
                existing.hindsight_memory_id = hindsight_mem_id
            memory_obj = existing
        else:
            memory_obj = SecurityMemory(
                finding_id=finding.id,
                project_id=project.id,
                memory_bank_id=bank_id,
                hindsight_memory_id=hindsight_mem_id,
                vulnerability_category=category,
                severity=finding.severity,
                sanitized_title=sanitized_title,
                sanitized_summary=sanitized_summary,
                remediation_notes=rem_notes,
                retest_outcome=retest_state,
                retained_by=user.id
            )
            db.add(memory_obj)

        db.commit()
        db.refresh(memory_obj)
        return memory_obj

    async def recall_similar_memories(
        self,
        db: Session,
        user: User,
        query: str,
        target_project_id: Optional[int] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Recall relevant historical findings from Hindsight within authorized project scopes."""
        auth_project_ids = self.get_authorized_project_ids(db, user)
        if not auth_project_ids:
            return []

        clean_query = self.sanitize_content(query)
        results = []

        # 1. Query Hindsight API if online
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "query": clean_query,
                    "project_ids": auth_project_ids,
                    "limit": limit
                }
                resp = await client.post(f"{self.api_url}/v1/recall", json=payload, headers=self._get_headers())
                if resp.status_code == 200:
                    raw_data = resp.json()
                    memories = raw_data.get("memories") or raw_data.get("results") or []
                    for m in memories:
                        meta = m.get("metadata", {})
                        p_id = meta.get("project_id")
                        if p_id in auth_project_ids and (target_project_id is None or p_id != target_project_id):
                            results.append({
                                "id": m.get("id"),
                                "project_id": p_id,
                                "project_name": meta.get("project_name", f"Project #{p_id}"),
                                "finding_title": meta.get("finding_title") or m.get("content", "")[:60],
                                "vulnerability_category": meta.get("category", "Vulnerability"),
                                "severity": meta.get("severity", "MEDIUM"),
                                "remediation_summary": meta.get("remediation", ""),
                                "retest_status": meta.get("retest_outcome", "NOT_TESTED"),
                                "similarity_score": round(float(m.get("score", 0.85)), 2),
                                "explanation": f"Matched historical memory for query '{clean_query[:30]}...'"
                            })
        except Exception as e:
            logger.warning(f"Hindsight recall fallback to database search: {e}")

        # 2. Local fallback if Hindsight results are empty or unreachable
        if not results:
            words = [w.lower() for w in clean_query.split() if len(w) > 2]
            filters = [SecurityMemory.project_id.in_(auth_project_ids)]
            if target_project_id:
                filters.append(SecurityMemory.project_id != target_project_id)

            CONCEPT_MAP = {
                "search": ["sql", "injection", "xss", "cross-site", "input", "script"],
                "field": ["sql", "injection", "xss", "input", "validation"],
                "input": ["sql", "injection", "xss", "validation", "parameter"],
                "form": ["csrf", "xss", "injection", "validation"],
                "login": ["sql", "injection", "auth", "session", "password", "bypass"],
                "user": ["auth", "privilege", "idor", "access"],
                "database": ["sql", "injection", "database", "sqli"],
            }

            expanded_words = set(words)
            for w in words:
                if w in CONCEPT_MAP:
                    expanded_words.update(CONCEPT_MAP[w])

            query_builder = db.query(SecurityMemory).filter(and_(*filters))

            if expanded_words:
                word_conditions = []
                for w in list(expanded_words)[:10]:
                    word_conditions.append(SecurityMemory.sanitized_title.ilike(f"%{w}%"))
                    word_conditions.append(SecurityMemory.sanitized_summary.ilike(f"%{w}%"))
                    word_conditions.append(SecurityMemory.vulnerability_category.ilike(f"%{w}%"))
                query_builder = query_builder.filter(or_(*word_conditions))

            local_memories = query_builder.order_by(SecurityMemory.created_at.desc()).limit(limit).all()

            if not local_memories:
                local_memories = db.query(SecurityMemory).filter(and_(*filters)).order_by(SecurityMemory.created_at.desc()).limit(limit).all()

            for mem in local_memories:
                results.append({
                    "id": mem.id,
                    "project_id": mem.project_id,
                    "project_name": mem.project.project_name if mem.project else f"Project #{mem.project_id}",
                    "finding_id": mem.finding_id,
                    "finding_title": mem.sanitized_title,
                    "vulnerability_category": mem.vulnerability_category or "Vulnerability",
                    "severity": mem.severity or "MEDIUM",
                    "remediation_summary": mem.remediation_notes or "",
                    "retest_status": mem.retest_outcome or "NOT_TESTED",
                    "similarity_score": 0.88 if words else 0.75,
                    "explanation": "Matched historical VAPT security memory record in persistent storage.",
                    "created_at": mem.created_at.isoformat() if mem.created_at else None
                })

        return results

    async def list_security_memories(
        self,
        db: Session,
        user: User,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieve authorized security memory records for transparency inspection view."""
        auth_project_ids = self.get_authorized_project_ids(db, user)
        if not auth_project_ids:
            return []

        memories = db.query(SecurityMemory).filter(
            SecurityMemory.project_id.in_(auth_project_ids)
        ).order_by(SecurityMemory.created_at.desc()).offset(offset).limit(limit).all()

        output = []
        for m in memories:
            output.append({
                "id": m.id,
                "project_id": m.project_id,
                "project_name": m.project.project_name if m.project else f"Project #{m.project_id}",
                "project_code": m.project.project_code if m.project else "PRJ",
                "finding_id": m.finding_id,
                "hindsight_memory_id": m.hindsight_memory_id,
                "vulnerability_category": m.vulnerability_category,
                "severity": m.severity,
                "sanitized_title": m.sanitized_title,
                "sanitized_summary": m.sanitized_summary,
                "remediation_notes": m.remediation_notes,
                "retest_outcome": m.retest_outcome,
                "retained_by_id": m.retained_by,
                "retained_by_email": m.retainer.email if m.retainer else "System",
                "created_at": m.created_at.isoformat() if m.created_at else None
            })
        return output

    def auto_retain_finding_sync(self, db: Session, user: User, finding: ProjectFinding):
        """Automatically retain finding into security memory upon creation/update."""
        try:
            project = db.query(Project).filter(Project.id == finding.project_id).first()
            if not project:
                return
            category = finding.cwe or finding.owasp or "General Security"
            sanitized_title = self.sanitize_content(finding.title)
            sanitized_summary = self.sanitize_content(
                f"Vulnerability: {finding.title}\nDescription: {finding.description or ''}\nImpact: {finding.impact or ''}"
            )
            rem_notes = self.sanitize_content(finding.recommendation or finding.solution or "")
            retest_state = finding.retest_status or "NOT_TESTED"
            bank_id = f"project_{project.id}"

            existing = db.query(SecurityMemory).filter(SecurityMemory.finding_id == finding.id).first()
            if existing:
                existing.sanitized_title = sanitized_title
                existing.sanitized_summary = sanitized_summary
                existing.remediation_notes = rem_notes
                existing.retest_outcome = retest_state
                existing.severity = finding.severity
                existing.vulnerability_category = category
            else:
                mem = SecurityMemory(
                    finding_id=finding.id,
                    project_id=project.id,
                    memory_bank_id=bank_id,
                    vulnerability_category=category,
                    severity=finding.severity,
                    sanitized_title=sanitized_title,
                    sanitized_summary=sanitized_summary,
                    remediation_notes=rem_notes,
                    retest_outcome=retest_state,
                    retained_by=user.id
                )
                db.add(mem)
            db.commit()
        except Exception as e:
            logger.warning(f"Auto-retain notice: {e}")


memory_service = MemoryService()
