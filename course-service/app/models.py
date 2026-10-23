from sqlalchemy import Column, Integer, String, Text
from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    duration = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)