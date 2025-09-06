# integrated_text_to_sql_safequery.py
import os
import json
import hashlib
import datetime
from typing import Optional
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# -----------------------------
# Config: Gemini/OpenAI
# -----------------------------
API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

if not API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY not set. The code will fail until credentials are configured.")

client = OpenAI(
    api_key=API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# -----------------------------
# Pydantic models
# -----------------------------
class SQLResult(BaseModel):
    sql: Optional[str] = Field(None)
    explanation: str

class User(BaseModel):
    id: int
    username: str
    role: str  # reader, writer, admin, super_admin

class QueryRequest(BaseModel):
    user: User
    query: str

class QueryResult(BaseModel):
    status: str  # pass, fail, request_approval
    explanation: str
    result: Optional[str] = None
    log_hash: Optional[str] = None
    approved_by: Optional[int] = None

# -----------------------------
# Role permissions
# -----------------------------
ROLE_PERMISSIONS = {
    "reader": ["SELECT"],
    "writer": ["SELECT", "INSERT", "UPDATE"],
    "admin": ["SELECT", "INSERT", "UPDATE", "DELETE"],
    "super_admin": ["SELECT", "INSERT", "UPDATE", "DELETE", "DDL"]
}

UNSAFE_KEYWORDS = ["DROP", "ALTER", "TRUNCATE"]
CHAIN = []

# -----------------------------
# Blockchain-style logger
# -----------------------------
def log_query(user_id, query, result_status, approved_by=None):
    prev_hash = CHAIN[-1]["hash"] if CHAIN else "0"*64
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    raw = f"{user_id}{query}{result_status}{approved_by}{timestamp}{prev_hash}"
    log_hash = hashlib.sha256(raw.encode()).hexdigest()
    CHAIN.append({
        "user_id": user_id,
        "query": query,
        "result_status": result_status,
        "approved_by": approved_by,
        "timestamp": timestamp,
        "hash": log_hash
    })
    return log_hash

# -----------------------------
# SafeQuery Agent
# -----------------------------
def safe_query_agent(request: QueryRequest, admin_override: Optional[User]=None) -> QueryResult:
    user = request.user
    query = request.query.strip().upper()

    # Role-based validation
    allowed_ops = ROLE_PERMISSIONS.get(user.role, [])
    op = query.split()[0]
    if op not in allowed_ops:
        return QueryResult(status="request_approval",
                           explanation=f"Operation '{op}' not allowed for role '{user.role}'.")

    # Safety keyword check
    for kw in UNSAFE_KEYWORDS:
        if kw in query and user.role not in ["admin", "super_admin"]:
            return QueryResult(status="request_approval",
                               explanation=f"Query contains unsafe keyword '{kw}'. Requires admin approval.")

    # Stub query execution
    result_data = f"Executed safely: {query[:100]}..."
    approved_by = admin_override.id if admin_override else None
    log_hash = log_query(user.id, query, "pass", approved_by=approved_by)

    return QueryResult(status="pass",
                       explanation="Query passed role and safety checks.",
                       result=result_data,
                       log_hash=log_hash,
                       approved_by=approved_by)

# -----------------------------
# Text-to-SQL with Gemini
# -----------------------------
def generate_sql_from_nl(nl_query: str, schema: str) -> SQLResult:
    response = client.chat.completions.create(
        model=GEMINI_MODEL,
        messages=[
            {"role": "system",
             "content": (
                 "You are an expert Text-to-SQL assistant.\n"
                 "Convert natural language questions into valid SQL queries for PostgreSQL.\n"
                 "Output ONLY JSON with keys 'sql' and 'explanation'."
             )
            },
            {"role": "user",
             "content": f"Schema:\n{schema}\n\nUser question:\n{nl_query}"}
        ]
    )

    raw = response.choices[0].message.content.strip()
    json_text = _extract_json_from_text(raw)
    if not json_text:
        return SQLResult(sql=None, explanation=f"Failed to parse model output. Raw: {raw[:500]}")
    parsed = json.loads(json_text)
    return SQLResult(sql=parsed.get("sql"), explanation=parsed.get("explanation", ""))

def _extract_json_from_text(text: str) -> Optional[str]:
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end+1]
        try:
            json.loads(candidate)
            return candidate
        except:
            return None
    return None

# -----------------------------
# CLI Integration
# -----------------------------
if __name__ == "__main__":
    # Example schema
    schema = """
    users(id INTEGER PRIMARY KEY, username TEXT, email TEXT, created_at TIMESTAMP)
    query_logs(id SERIAL, user_id INTEGER, query TEXT, result_status TEXT, timestamp TIMESTAMP)
    orders(id SERIAL, user_id INTEGER, total NUMERIC, created_at TIMESTAMP)
    """

    # Example user
    user = User(id=1, username="alice", role="reader")

    # 1️⃣ NL Input
    nl_query = input("Enter your question in natural language: ")

    # 2️⃣ Convert to SQL
    sql_result = generate_sql_from_nl(nl_query, schema)
    print("Text-to-SQL output:")
    print(sql_result.model_dump_json(indent=2))

    if sql_result.sql is None:
        print("SQL generation failed. Exiting.")
        exit()

    # 3️⃣ Run through SafeQuery Agent
    request = QueryRequest(user=user, query=sql_result.sql)
    query_result = safe_query_agent(request)
    print("SafeQuery Agent output:")
    print(query_result.model_dump_json(indent=2))