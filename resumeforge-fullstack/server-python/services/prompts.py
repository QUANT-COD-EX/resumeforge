import json

def build_feedback_prompt(resume_data: dict) -> str:
    return f"""You are a strict technical recruiter. Analyze this resume JSON and return ONLY valid JSON:
{{
  "score": <float 1.0 to 10.0>,
  "strengths": ["<point 1>", "<point 2>"],
  "weaknesses": ["<point 1>", "<point 2>"],
  "improvements": ["<fix 1>", "<fix 2>", "<fix 3>"]
}}
Resume JSON:
{json.dumps(resume_data)}
"""

def build_improve_line_prompt(bullet_text: str, role_context: str = "") -> str:
    return f"""Rewrite this resume bullet using the XYZ formula (Action Verb + Task + Measurable Impact, max 25 words).
Context: {role_context}
Original: "{bullet_text}"
Return ONLY valid JSON:
{{
  "improvedBullet": "<rewritten bullet>"
}}
"""

def build_tailor_prompt(resume_data: dict, job_description: str) -> str:
    return f"""Compare the resume against the Job Description and return ONLY valid JSON:
{{
  "matchScore": <int 0 to 100>,
  "tailoredSummary": "<2-3 sentence tailored summary>",
  "missingSkills": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>"],
  "quickWins": ["<win 1>", "<win 2>"]
}}
Job Description:
{job_description}
Resume:
{json.dumps(resume_data)}
"""
