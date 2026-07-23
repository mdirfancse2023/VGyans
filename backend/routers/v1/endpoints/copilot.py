from fastapi import APIRouter
from backend.schemas.copilot import CopilotChatRequestDTO, CopilotChatResponseDTO
from backend.services.copilot_service import CopilotService

router = APIRouter(prefix="/copilot", tags=["Gyans Copilot AI"])
copilot_service = CopilotService()

@router.post("/chat", response_model=CopilotChatResponseDTO)
def copilot_chat(req: CopilotChatRequestDTO):
    return copilot_service.process_query(req.message, topic=req.topic)
