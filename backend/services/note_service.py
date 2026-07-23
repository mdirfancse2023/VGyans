from typing import List, Optional, Dict, Any

class NoteService:
    def __init__(self):
        self._notes = [
            {
                "id": "note-1",
                "title": "SOLID Design Principles Handbook",
                "subject": "System Design",
                "author": "VGyans Academic Team",
                "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                "description": "Comprehensive reference guide covering SRP, OCP, LSP, ISP, and DIP with real-world enterprise code examples.",
                "chapters": [
                    {
                        "title": "Chapter 1: Single Responsibility Principle (SRP)",
                        "content": "A class or component should have one, and only one, reason to change. Separate business logic from data access and presentation layers.",
                        "code": "class UserRegistration:\n    def register_user(self, email, password):\n        # Save user to DB\n        pass\n\nclass EmailNotifier:\n    def send_welcome_email(self, email):\n        # Send email\n        pass"
                    },
                    {
                        "title": "Chapter 2: Open/Closed Principle (OCP)",
                        "content": "Software entities should be open for extension, but closed for modification. Use interfaces and strategy patterns.",
                        "code": "from abc import ABC, abstractmethod\n\nclass PaymentStrategy(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass CreditCardPayment(PaymentStrategy):\n    def pay(self, amount):\n        print(f'Paying {amount} via Credit Card')"
                    },
                    {
                        "title": "Chapter 3: Liskov Substitution Principle (LSP)",
                        "content": "Objects of a superclass should be replaceable with objects of its subclasses without breaking the application functionality."
                    },
                    {
                        "title": "Chapter 4: Interface Segregation Principle (ISP)",
                        "content": "Clients should not be forced to depend upon interfaces that they do not use. Split large interfaces into smaller specific ones."
                    },
                    {
                        "title": "Chapter 5: Dependency Inversion Principle (DIP)",
                        "content": "High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces)."
                    },
                    {
                        "title": "Chapter 6: System Design High-Level Architecture (HLD)",
                        "content": "High Level System Design covers Load Balancers (Nginx/HAProxy), API Gateways, Microservices, Caching (Redis), and Database Sharding."
                    }
                ]
            },
            {
                "id": "note-2",
                "title": "Spring Boot 4.0 Microservices Architecture",
                "subject": "Backend Development",
                "author": "VGyans Engineering",
                "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                "description": "Production setup for Java 21, Resilience4j circuit breakers, and SLF4J MDC request correlation tracing.",
                "chapters": [
                    {
                        "title": "Chapter 1: Java 21 & Spring Boot 4.0 Core Setup",
                        "content": "Utilize DTO Records, Virtual Threads (Project Loom), and Maven multi-stage container builds.",
                        "code": "public record SongResponseDto(String id, String title, String artist) {}"
                    },
                    {
                        "title": "Chapter 2: Resilience4j Circuit Breakers",
                        "content": "Wrap external REST calls with @CircuitBreaker to handle downstream service degradation gracefully."
                    },
                    {
                        "title": "Chapter 3: SLF4J MDC Distributed Request Tracing",
                        "content": "Pass X-Correlation-ID headers across HTTP boundaries for end-to-end request logging."
                    }
                ]
            }
        ]

        self._resources = [
            {
                "id": "res-1",
                "title": "Data Structures & Algorithms Cheat Sheet",
                "category": "Placement Prep",
                "type": "PDF",
                "link": "https://virtualgyans.me"
            }
        ]

    def get_notes(self) -> List[Dict[str, Any]]:
        return self._notes

    def get_note_by_id(self, note_id: str) -> Optional[Dict[str, Any]]:
        for n in self._notes:
            if n["id"] == note_id or note_id in n["id"]:
                return n
        return self._notes[0] # Return System Design note as default fallback

    def get_resources(self) -> List[Dict[str, Any]]:
        return self._resources
