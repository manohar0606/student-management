from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
import httpx

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

@app.post(
    "/courses/{course_id}/enrollments",
    response_model=schemas.EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def enroll_student(
    course_id: int,
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
):
    # Check that the course exists
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

    # Verify the student through the Student Service
    try:
        response = httpx.get(
            f"http://127.0.0.1:8002/students/{enrollment.student_id}",
            timeout=5.0,
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Student Service is unavailable",
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not verify student with Student Service",
        )

    student = response.json()

    # Prevent duplicate enrollment
    existing = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.student_id == enrollment.student_id,
            models.Enrollment.course_id == course_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student is already enrolled in this course",
        )

    new_enrollment = models.Enrollment(
        student_id=enrollment.student_id,
        course_id=course_id,
        student_name=student["name"],
        student_email=student["email"],
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return new_enrollment


@app.get(
    "/courses/{course_id}/students",
    response_model=list[schemas.EnrollmentResponse],
)
def get_enrolled_students(
    course_id: int,
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

    return (
        db.query(models.Enrollment)
        .filter(models.Enrollment.course_id == course_id)
        .order_by(models.Enrollment.id)
        .all()
    )