from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.project_finding import ProjectFinding
from app.models.security_memory import SecurityMemory, AnalystFeedback
from app.services.memory_service import memory_service
from app.services.ai.gemini_client import GeminiAIClient
from app.schemas.memory import (
    MemoryRecordResponse,
    SimilarFindingsRequest,
    SimilarFindingItem,
    MemoryChatRequest,
    MemoryChatResponse,
    MemoryCitation,
    RetainMemoryRequest,
    AnalystFeedbackRequest,
    StepSimilarityCheckRequest,
    StepSimilarityCheckResponse,
    ContextChatRequest,
    ContextChatResponse,
    FloatingChatRequest,
    FloatingChatResponse,
)

router = APIRouter(prefix="/memory", tags=["Security Memory"])


@router.get("/records", response_model=List[MemoryRecordResponse])
async def list_security_memories(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature 5: Security Memory Details and Transparency view."""
    return await memory_service.list_security_memories(
        db=db, user=current_user, limit=limit, offset=offset
    )


@router.post("/retain", response_model=MemoryRecordResponse)
async def retain_finding_to_memory(
    req: RetainMemoryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature 2: Explicitly retain an authorized VAPT finding into security memory."""
    finding = db.query(ProjectFinding).filter(ProjectFinding.id == req.finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Project finding not found.")

    # Access control
    auth_ids = memory_service.get_authorized_project_ids(db, current_user)
    if finding.project_id not in auth_ids:
        raise HTTPException(status_code=403, detail="Not authorized to access this project finding.")

    project = db.query(Project).filter(Project.id == finding.project_id).first()
    memory_obj = await memory_service.retain_finding_memory(
        db=db,
        user=current_user,
        finding=finding,
        project=project,
        remediation_notes=req.remediation_notes,
        retest_outcome=req.retest_outcome,
    )

    return MemoryRecordResponse(
        id=memory_obj.id,
        project_id=memory_obj.project_id,
        project_name=project.project_name,
        project_code=project.project_code,
        finding_id=memory_obj.finding_id,
        hindsight_memory_id=memory_obj.hindsight_memory_id,
        vulnerability_category=memory_obj.vulnerability_category,
        severity=memory_obj.severity,
        sanitized_title=memory_obj.sanitized_title,
        sanitized_summary=memory_obj.sanitized_summary,
        remediation_notes=memory_obj.remediation_notes,
        retest_outcome=memory_obj.retest_outcome,
        retained_by_email=current_user.email,
        created_at=memory_obj.created_at.isoformat() if memory_obj.created_at else None,
    )


@router.post("/similar-findings", response_model=List[SimilarFindingItem])
async def get_similar_historical_findings(
    req: SimilarFindingsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature 3: Retrieve similar historical VAPT findings from authorized security memory."""
    results = await memory_service.recall_similar_memories(
        db=db,
        user=current_user,
        query=req.query,
        target_project_id=req.target_project_id,
        limit=req.limit or 5,
    )
    return results


@router.post("/check-step-similarity", response_model=StepSimilarityCheckResponse)
async def check_step_similarity(
    req: StepSimilarityCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if finding title or step contents show similarity with historical security memory."""
    search_query = f"{req.finding_title} {req.step_caption or ''} {req.finding_description or ''}".strip()
    if not search_query:
        return StepSimilarityCheckResponse(has_similarity=False, similar_count=0, similar_memories=[])

    memories = await memory_service.recall_similar_memories(
        db=db,
        user=current_user,
        query=search_query,
        target_project_id=req.project_id,
        limit=5,
    )

    # Filter memories that match with reasonable relevance
    valid_memories = [m for m in memories if m.get("similarity_score", 0) > 0.1]
    has_sim = len(valid_memories) > 0

    return StepSimilarityCheckResponse(
        has_similarity=has_sim,
        similar_count=len(valid_memories),
        similar_memories=valid_memories,
    )


@router.post("/context-chat", response_model=ContextChatResponse)
async def contextual_past_memory_chat(
    req: ContextChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Contextual AI Assistant chat grounded in historical findings for a specific vulnerability."""
    references = [
        MemoryCitation(
            project_name=m.project_name,
            finding_title=m.finding_title,
            severity=m.severity,
            retest_status=m.retest_status,
            remediation_summary=m.remediation_summary,
        )
        for m in req.similar_memories
    ]

    mem_summaries = "\n".join([
        f"- [{m.project_name}] {m.finding_title} (Severity: {m.severity}, Retest: {m.retest_status})\n  Remediation: {m.remediation_summary}"
        for m in req.similar_memories
    ]) if req.similar_memories else "No prior recorded memories."

    # If this is the start of the chat conversation or no user message history yet
    last_user_msg = req.messages[-1].content if req.messages else None

    if not last_user_msg:
        prompt = (
            "You are the REDLINE AI Past Memory Assistant.\n"
            "Generate a comprehensive analysis of the current finding grounded in past security memory.\n\n"
            f"Vulnerability Title: {req.finding_title}\n"
            f"Step / Image Analysis: {req.step_caption}\n\n"
            f"PAST SIMILAR MEMORIES RECORDED IN HINDSIGHT:\n{mem_summaries}\n\n"
            "Format your response in GitHub-style Markdown with these exact sections:\n"
            "### 📝 Summarization of Previous Similar Findings\n"
            "(Summarize past occurrences from memory, projects where seen, and prior retest outcomes)\n\n"
            "### 🔍 Features Identification\n"
            "(In which features, parameters, or application workflows this vulnerability is typically identified)\n\n"
            "### ⚡ Exploitation Mechanics\n"
            "(How attackers exploit this issue, payload vectors, and impact on application flow)\n\n"
            "### 💥 Business Impact\n"
            "(Operational, financial, compliance, data breach, and reputational risk analysis)\n\n"
            "### 🛡️ Remediation & Mitigation\n"
            "(Concrete code-level defense, input validation, configuration changes, and verification steps)\n"
        )
    else:
        # Conversation follow-up prompt
        chat_history_str = "\n".join([f"{m.role.upper()}: {m.content}" for m in req.messages[:-1]])
        prompt = (
            "You are the REDLINE AI Past Memory Assistant.\n"
            "Answer the user's follow-up question grounded in the current finding context and historical memories.\n\n"
            f"Vulnerability Title: {req.finding_title}\n"
            f"Step Description: {req.step_caption}\n"
            f"PAST MEMORIES:\n{mem_summaries}\n\n"
            f"CHAT HISTORY:\n{chat_history_str}\n\n"
            f"USER FOLLOW-UP QUESTION: {last_user_msg}\n\n"
            "CONCISE HELPFUL RESPONSE:"
        )

    try:
        gemini = GeminiAIClient()
        ai_answer = gemini.generate_text(prompt)
    except Exception as e:
        ai_answer = (
            f"### 📝 Summarization of Previous Findings\n"
            f"Retrieved {len(req.similar_memories)} past findings matching `{req.finding_title}`.\n\n"
            f"### 🔍 Features Identification\n"
            f"Commonly found in login forms, search parameters, API request bodies, and authentication workflows.\n\n"
            f"### ⚡ Exploitation Mechanics\n"
            f"Attackers manipulate input fields to alter backend query logic or execute unauthorized operations.\n\n"
            f"### 💥 Business Impact\n"
            f"High risk of unauthorized data access, privilege escalation, and compliance violations.\n\n"
            f"### 🛡️ Remediation & Mitigation\n"
            f"Implement strict parameterized queries, input sanitization, and principle of least privilege."
        )

    return ContextChatResponse(answer=ai_answer, references=references)


@router.post("/chat", response_model=MemoryChatResponse)
async def security_memory_chat(
    req: MemoryChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature 4: REDLINE AI Security Memory RAG Chat using existing Gemini LLM."""
    query = req.question.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Chat question cannot be empty.")

    memories = await memory_service.recall_similar_memories(
        db=db,
        user=current_user,
        query=query,
        target_project_id=req.project_id,
        limit=5,
    )

    if not memories:
        return MemoryChatResponse(
            question=query,
            answer="REDLINE Security Memory contains no documented historical findings matching your query within your authorized projects.",
            has_relevant_memories=False,
            citations=[],
        )

    citations = [
        MemoryCitation(
            project_name=mem["project_name"],
            finding_title=mem["finding_title"],
            severity=mem.get("severity", "MEDIUM"),
            retest_status=mem.get("retest_status", "NOT_TESTED"),
            remediation_summary=mem.get("remediation_summary"),
        )
        for mem in memories
    ]

    context_str = "\n".join([
        f"Record #{idx+1}:\n- Project: {mem['project_name']}\n- Finding: {mem['finding_title']}\n- Severity: {mem.get('severity', 'MEDIUM')}\n- Retest Status: {mem.get('retest_status', 'NOT_TESTED')}\n- Remediation: {mem.get('remediation_summary', 'N/A')}\n"
        for idx, mem in enumerate(memories)
    ])

    system_prompt = (
        "You are the REDLINE AI Security Memory Assistant.\n"
        "Your task is to answer security questions using ONLY the authorized historical VAPT records provided below.\n"
        f"AUTHORIZE RECALLED SECURITY MEMORY:\n{context_str}\n\n"
        f"USER QUESTION: {query}\n\n"
        "CONCISE GROUNDED ANSWER:"
    )

    try:
        gemini = GeminiAIClient()
        ai_response = gemini.generate_text(system_prompt)
    except Exception as e:
        ai_response = f"Summary of retrieved historical records:\n" + "\n".join(
            [f"• [{m['project_name']}] {m['finding_title']} (Status: {m.get('retest_status', 'NOT_TESTED')})" for m in memories]
        )

    return MemoryChatResponse(
        question=query,
        answer=ai_response,
        has_relevant_memories=True,
        citations=citations,
    )


@router.post("/feedback")
async def record_analyst_feedback(
    req: AnalystFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature 7: Analyst Feedback on suggested findings or remediation adoption."""
    finding = db.query(ProjectFinding).filter(ProjectFinding.id == req.finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    auth_ids = memory_service.get_authorized_project_ids(db, current_user)
    if finding.project_id not in auth_ids:
        raise HTTPException(status_code=403, detail="Not authorized.")

    fb = AnalystFeedback(
        finding_id=req.finding_id,
        suggested_memory_id=req.suggested_memory_id,
        user_id=current_user.id,
        is_relevant=req.is_relevant,
        remediation_action=req.remediation_action,
        feedback_notes=req.feedback_notes,
    )
    db.add(fb)
    db.commit()
    return {"message": "Analyst feedback recorded successfully."}


@router.post("/floating-chat", response_model=FloatingChatResponse)
async def floating_security_chat(
    req: FloatingChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Floating AI Memory Assistant endpoint providing general security answers + Hindsight memory matching."""
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Query Hindsight security memories for authorized projects
    memories = await memory_service.recall_similar_memories(
        db=db,
        user=current_user,
        query=question,
        limit=5,
    )

    valid_memories = [m for m in memories if m.get("similarity_score", 0) >= 0.05]
    has_memories = len(valid_memories) > 0

    citations = [
        MemoryCitation(
            project_name=m["project_name"],
            finding_title=m["finding_title"],
            severity=m.get("severity", "MEDIUM"),
            retest_status=m.get("retest_status", "NOT_TESTED"),
            remediation_summary=m.get("remediation_summary"),
        )
        for m in valid_memories
    ]

    mem_block = "\n".join([
        f"- [{m['project_name']}] {m['finding_title']} (Severity: {m.get('severity', 'MEDIUM')}, Retest: {m.get('retest_status', 'NOT_TESTED')})\n  Remediation: {m.get('remediation_summary', 'N/A')}"
        for m in valid_memories
    ]) if has_memories else "No prior recorded occurrences in security memory."

    history_str = "\n".join([f"{m.role.upper()}: {m.content}" for m in req.messages[-4:]]) if req.messages else "None"

    prompt = (
        "You are the REDLINE AI Floating Security & Hindsight Assistant.\n"
        "Your role is to help security analysts with general cybersecurity questions AND correlate queries with persistent Hindsight security memory.\n\n"
        f"USER QUESTION: {question}\n\n"
        f"RECALLED HINDSIGHT SECURITY MEMORY FOR AUTHORIZED PROJECTS:\n{mem_block}\n\n"
        f"RECENT CONVERSATION HISTORY:\n{history_str}\n\n"
        "GUIDELINES FOR RESPONSE:\n"
        "1. Provide a clear, comprehensive general cybersecurity answer explaining possible attacks, payloads, and solutions.\n"
        "2. MANDATORY: Include a dedicated section titled '📌 Related Past Findings in Security Memory'.\n"
        "3. In the '📌 Related Past Findings in Security Memory' section, explicitly list and summarize each recalled historical finding (mention project name, finding title, severity, and prior retest outcome).\n"
        "4. Explain how each recalled historical finding relates to the user's question.\n"
        "5. Keep the formatting in clean Markdown.\n\n"
        "RESPONSE:"
    )

    try:
        gemini = GeminiAIClient()
        ai_response = gemini.generate_text(prompt)
    except Exception as e:
        ai_response = (
            f"Here are possible attacks and security measures for your query:\n\n"
            f"1. **SQL Injection (SQLi)**: Attackers input `' OR '1'='1` to tamper with database queries. *Defense*: Use parameterized prepared statements.\n"
            f"2. **Cross-Site Scripting (XSS)**: Injecting `<script>` tags to hijack user sessions. *Defense*: HTML entity encoding and CSP headers.\n"
            f"3. **Parameter Tampering / IDOR**: Modifying request payload keys to access unauthorized objects.\n\n"
            f"📌 **Related Past Findings in Security Memory**:\n"
            + (f"Recalled {len(valid_memories)} historical records from past projects." if has_memories else "No matching historical findings found in persistent security memory.")
        )

    return FloatingChatResponse(
        question=question,
        answer=ai_response,
        has_past_memories=has_memories,
        citations=citations,
    )

