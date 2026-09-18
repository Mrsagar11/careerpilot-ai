from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class QuestionItem(BaseModel):
    id: int
    category: str # HR, Technical, Behavioral
    question: str
    difficulty: str # Easy, Medium, Hard
    key_points: List[str]
    sample_answer: str

class QuestionsRequest(BaseModel):
    role: Optional[str] = "Software Engineer"
    count: Optional[int] = 5

class MockStartRequest(BaseModel):
    role: Optional[str] = "Software Engineer"
    category: Optional[str] = "Mixed" # Technical, HR, Behavioral, Mixed

class QnAPair(BaseModel):
    question_id: int
    question: str
    category: str
    user_answer: str
    clarity_score: float
    relevance_score: float
    technical_accuracy_score: float
    overall_score: float
    feedback: str
    model_answer_comparison: str

class MockAnswerRequest(BaseModel):
    session_id: Optional[int] = None
    question_id: int
    question: str
    category: str
    user_answer: str

class SessionOut(BaseModel):
    id: int
    user_id: int
    role: str
    mode: str
    overall_score: float
    feedback_summary: str
    qa_pairs: List[Dict[str, Any]]
    created_at: Any

    class Config:
        from_attributes = True
