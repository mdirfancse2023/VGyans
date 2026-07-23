from fastapi import APIRouter
from pydantic import BaseModel
import sys
import io

router = APIRouter(prefix="/run", tags=["Code Execution"])

class CodeExecutionRequestDTO(BaseModel):
    language: str = "python"
    code: str

@router.post("")
def execute_code(req: CodeExecutionRequestDTO):
    if req.language.lower() in ["python", "python3"]:
        buffer = io.StringIO()
        sys_stdout = sys.stdout
        sys.stdout = buffer
        try:
            exec(req.code, {"__builtins__": __builtins__})
            sys.stdout = sys_stdout
            return {"success": True, "output": buffer.getvalue()}
        except Exception as e:
            sys.stdout = sys_stdout
            return {"success": False, "error": str(e), "output": buffer.getvalue()}

    return {"success": False, "error": f"Language '{req.language}' execution is supported in Spring Boot 4.0 sandbox."}
