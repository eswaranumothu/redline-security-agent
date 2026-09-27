def build_evidence_prompt(
    vulnerability_name: str,
) -> str:
    return f"""
You are a professional VAPT security assessment analyst.

Vulnerability:
{vulnerability_name}

Analyze ONLY the provided screenshot.

Generate a concise evidence description for a professional VAPT report.

Requirements:

- Return exactly 2 sentences.
- Maximum 60 words.
- Sentence 1: describe the testing action visible in the screenshot.
- Sentence 2: describe the result or behavior visibly demonstrated.
- Focus only on what is actually visible in the screenshot.
- Explain what happened, not the general vulnerability definition.
- Do not provide remediation.
- Do not provide severity.
- Do not provide CVSS, CWE, or OWASP mappings.
- Do not discuss information that is not visible.
- Do not invent URLs, parameters, payloads, or application behavior.
- Do not mention Stored XSS or other vulnerability types unless explicitly visible.
- Use professional penetration-testing language.
- Do not use headings.
- Do not use markdown.
- Do not provide reasoning.
- Return ONLY the 2-sentence evidence description.
"""