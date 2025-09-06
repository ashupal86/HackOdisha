"""
Text-to-SQL CLI Tool (OpenAI-compatible with Gemini API):
- Uses system prompt instead of LangChain PromptTemplate
- No max token limit specified
- User provides NL query via CLI input
- Returns JSON with SQL + explanation
"""

import os
import json
from typing import Optional

from openai import OpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# -----------------------------
# Configuration
# -----------------------------
API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

if not API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY not set. The code will fail until credentials are configured.")

# OpenAI-compatible Gemini client
client = OpenAI(
    api_key=API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# -----------------------------
# Pydantic response model
# -----------------------------
class SQLResult(BaseModel):
    sql: Optional[str] = Field(None, description="Generated SQL or null if failed")
    explanation: str

# -----------------------------
# Gemini call
# -----------------------------
def generate_sql_from_nl(nl_query: str, schema: str) -> SQLResult:
    response = client.chat.completions.create(
        model=GEMINI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert Text-to-SQL assistant.\n"
                    "Convert natural language questions into valid SQL queries for PostgreSQL.\n"
                    "Always output ONLY JSON with fields:\n"
                    "  - sql: the SQL query\n"
                    "  - explanation: short reasoning.\n"
                    "Do not add extra text outside JSON."
                )
            },
            {
                "role": "user",
                "content": f"Schema:\n{schema}\n\nUser question:\n{nl_query}"
            }
        ]
    )

    raw = response.choices[0].message.content.strip()
    json_text = _extract_json_from_text(raw)
    if not json_text:
        return SQLResult(sql=None, explanation=f"Failed to parse model output. Raw: {raw[:500]}")
    try:
        parsed = json.loads(json_text)
    except Exception as e:
        return SQLResult(sql=None, explanation=f"JSON parse error: {e}. Candidate: {json_text[:500]}")

    return SQLResult(sql=parsed.get("sql"), explanation=parsed.get("explanation", "No explanation provided."))

# -----------------------------
# JSON extractor
# -----------------------------
def _extract_json_from_text(text: str) -> Optional[str]:
    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        try:
            json.loads(text)
            return text
        except Exception:
            pass

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end+1]
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            return None
    return None

# -----------------------------
# CLI Entry Point
# -----------------------------
if __name__ == "__main__":
    schema = """
    users(id INTEGER PRIMARY KEY, username TEXT, email TEXT, created_at TIMESTAMP)
    query_logs(id SERIAL, user_id INTEGER, query TEXT, result_status TEXT, timestamp TIMESTAMP)
    orders(id SERIAL, user_id INTEGER, total NUMERIC, created_at TIMESTAMP)
    """

    user_query = input("Enter your question: ")

    result = generate_sql_from_nl(user_query, schema)

    # Print JSON response only
    print(result.model_dump_json(indent=2))
