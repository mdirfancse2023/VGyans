from pydantic import BaseModel
from typing import List, Optional

class JobDTO(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    category: Optional[str] = "Software Development"
    salary: Optional[str] = ""
    tags: Optional[List[str]] = []
    logo: Optional[str] = ""
    url: str
    postedAt: Optional[str] = ""
    source: str
    remote: bool = True
