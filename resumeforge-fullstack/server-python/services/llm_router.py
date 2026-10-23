import os
import json
import re
from groq import Groq
import google.generativeai as genai

def _extract_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1)
    else:
        brace = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if brace:
            cleaned = brace.group(0)
    return json.loads(cleaned)

def generate_structured_json(prompt: str) -> dict:
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    errors = []

    if groq_key and groq_key != "your_groq_api_key_here":
        try:
            client = Groq(api_key=groq_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "Output strictly valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            parsed = _extract_json(completion.choices[0].message.content)
            parsed["provider"] = "groq-llama-3.3-70b"
            return parsed
        except Exception as exc:
            errors.append(f"Groq: {exc}")

    if gemini_key and gemini_key != "your_gemini_api_key_here":
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                generation_config={"response_mime_type": "application/json", "temperature": 0.3}
            )
            response = model.generate_content(prompt)
            parsed = _extract_json(response.text)
            parsed["provider"] = "google-gemini-2.5-flash"
            return parsed
        except Exception as exc:
            errors.append(f"Gemini: {exc}")

    raise RuntimeError("No valid LLM keys configured or providers failed: " + " | ".join(errors))
