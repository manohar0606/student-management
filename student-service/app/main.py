from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Management Service",
    description="Microservice for managing student records",
    version="1.0.0",
)


@app.get("/")
def home():
    return {
        "service": "student-service",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "service": "student-service",
        "status": "healthy",
    }


@app.post(
    "/students",
    response_model=schemas.StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.Student)
        .filter(models.Student.email == student.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A student with this email already exists",
        )

    new_student = models.Student(**student.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


@app.get("/students", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(models.Student).order_by(models.Student.id).all()


@app.get(
    "/students/{student_id}",
    response_model=schemas.StudentResponse,
)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    return student


@app.put(
    "/students/{student_id}",
    response_model=schemas.StudentResponse,
)
def update_student(
    student_id: int,
    student_data: schemas.StudentUpdate,
    db: Session = Depends(get_db),
):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    duplicate_email = (
        db.query(models.Student)
        .filter(
            models.Student.email == student_data.email,
            models.Student.id != student_id,
        )
        .first()
    )

    if duplicate_email:
        raise HTTPException(
            status_code=409,
            detail="Another student already uses this email",
        )

    for field, value in student_data.model_dump().items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return student


@app.delete(
    "/students/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()