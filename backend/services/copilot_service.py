from typing import List, Dict, Any, Optional

class CopilotService:
    def __init__(self):
        self._guidelines = {
            "placement": "Focus on DSA patterns (Sliding Window, Two Pointers, Trees, DP) and 5-month preparation timeline.",
            "resume": "Highlight ATS keyword optimization, quantifiable metrics, and single-column formatting.",
            "java": "Focus on Java 21 features, Spring Boot 4.0 architecture, Resilience4j, and SLF4J MDC logging.",
            "system_design": "Focus on High Level Architecture (HLD), Low Level Class Diagrams (LLD), and SOLID principles."
        }

    def process_query(self, message: str, topic: Optional[str] = "placement") -> Dict[str, Any]:
        clean_msg = (message or "").lower()
        t = (topic or "placement").lower()

        if "resume" in clean_msg or "ats" in clean_msg:
            reply = "For top ATS resume optimization, ensure your resume highlights quantifiable engineering metrics (e.g., 'Boosted API response time by 40% using Spring Boot caching'). Use single-column standard layout without complex graphics."
            actions = ["Analyze Technical Resume", "Analyze Management Resume", "View ATS Formatting Tips"]
        elif "java" in clean_msg or "spring" in clean_msg:
            reply = "Spring Boot 4.0 with Java 21 leverages record DTOs, virtual threads (Project Loom), and Resilience4j circuit breakers. Always enforce SLF4J MDC correlation filters for distributed tracing."
            actions = ["View Spring Boot Handbook", "Explore Microservices Architecture", "Practice Java Interview Questions"]
        elif "system design" in clean_msg or "solid" in clean_msg:
            reply = "In System Design rounds, always start by clarifying functional vs non-functional requirements (QPS, latency, storage capacity). Apply SOLID principles to keep your low-level classes decoupled."
            actions = ["View SOLID Principles Handbook", "Explore System Design Notes", "Practice Rate Limiter LLD"]
        else:
            reply = f"Gyans Copilot Guidance ({t.title()}): To crack top technical campus placements, maintain a disciplined 5-month roadmap combining LeetCode DSA patterns, CS core fundamentals (OS/DBMS/CN), and production-grade Spring Boot & React projects."
            actions = ["View Placement Roadmap", "Explore Mock Interviews", "Browse Off-Campus Jobs"]

        return {
            "reply": reply,
            "suggested_actions": actions,
            "topic": t,
            "status": "success"
        }
