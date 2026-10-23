from pydantic import BaseModel, ConfigDict, Field


class CourseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=20)
    description: str | None = None
    duration: str = Field(min_length=1, max_length=50)
    department: str = Field(min_length=2, max_length=100)


class CourseUpdate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    code: str = Field(min_length=2, max_length=20)
    description: str | None = None
    duration: str = Field(min_length=1, max_length=50)
    department: str = Field(min_length=2, max_length=100)


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    code: str
    description: str | None
    duration: str
    department: str