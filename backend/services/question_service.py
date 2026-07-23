from typing import List, Optional
from backend.schemas.question import QuestionDTO, FlashcardDTO

class QuestionService:
    def __init__(self):
        self._questions = [
            QuestionDTO(
                id="q-1",
                title="Two Sum",
                category="Data Structures & Algorithms",
                difficulty="Easy",
                tags=["Array", "Hash Table"],
                description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                solution="Use a hash map to store seen numbers and their indices in O(n) time complexity."
            ),
            QuestionDTO(
                id="q-2",
                title="Longest Substring Without Repeating Characters",
                category="Data Structures & Algorithms",
                difficulty="Medium",
                tags=["Sliding Window", "String", "Hash Table"],
                description="Given a string s, find the length of the longest substring without repeating characters.",
                solution="Maintain a sliding window with dynamic left pointer and a set of active characters."
            )
        ]

        self._flashcards = [
            FlashcardDTO(
                id="fc-1",
                question="What is the difference between Process and Thread?",
                answer="A process is an independent executing program with separate memory. A thread is a lightweight execution path sharing memory within a process.",
                category="Operating Systems",
                difficulty="Medium"
            ),
            FlashcardDTO(
                id="fc-2",
                question="Explain ACID properties in Database Management Systems.",
                answer="Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent execution safety), Durability (persisted transactions).",
                category="DBMS",
                difficulty="Easy"
            )
        ]

    def get_questions(self, category: Optional[str] = None) -> List[QuestionDTO]:
        if category:
            return [q for q in self._questions if q.category.lower() == category.lower()]
        return self._questions

    def get_question_by_id(self, question_id: str) -> Optional[QuestionDTO]:
        for q in self._questions:
            if q.id == question_id:
                return q
        return None

    def get_flashcards(self) -> List[FlashcardDTO]:
        return self._flashcards
