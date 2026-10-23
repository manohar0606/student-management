from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Course Management Service",
    description="Microservice for managing courses",
    version="1.0.0",
)


@app.get("/")
def home():
    return {"message": "Course Management Service is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post(
    "/courses",
    response_model=schemas.CourseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
):
    existing_course = (
        db.query(models.Course)
        .filter(models.Course.code == course.code)
        .first()
    )

    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A course with this code already exists",
        )

    new_course = models.Course(**course.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


@app.get("/courses", response_model=list[schemas.CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).order_by(models.Course.id).all()


@app.get("/courses/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = (
        db.query(models.Course)
        .filter(models.Course.id == course_id)
        .first()
    )

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    return course


@app.put("/courses/{course_id}", response_model=schemas.CourseResponse)
def update_course(
    course_id: int,
    course_data: schemas.CourseUpdate,
    db: Session = Depends(get_db),
):
    course = (
        db.query(models.Course)
        .filter(models.Course.id == course_id)
        .first()
    )

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    duplicate = (
        db.query(models.Course)
        .filter(
            models.Course.code == course_data.code,
            models.Course.id != course_id,
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Another course already uses this code",
        )

    for field, value in course_data.model_dump().items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

    return course


@app.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = (
        db.query(models.Course)
        .filter(models.Course.id == course_id)
        .first()
    )

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    db.delete(course)
    db.commit()
    return None