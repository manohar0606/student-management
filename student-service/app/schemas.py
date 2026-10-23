from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StudentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=20)
    department: str = Field(min_length=2, max_length=100)
    course: str = Field(min_length=2, max_length=100)


class StudentUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=20)
    department: str = Field(min_length=2, max_length=100)
    course: str = Field(min_length=2, max_length=100)


class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone_number: str
    department: str
    course: str