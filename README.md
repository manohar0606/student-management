
# Student Management System Using Microservices

## 1. Project Overview

The Student Management System is a web application built using a microservices architecture. It allows users to register, log in, manage student records, and manage courses through a React frontend and FastAPI backend services.

## 2. Technology Stack

- **Frontend:** React.js with Vite
- **Backend:** Python FastAPI
- **API Gateway:** FastAPI
- **Database:** SQLite
- **Authentication:** JWT
- **API Testing:** Postman
- **API Documentation:** Swagger UI
- **Version Control:** Git and GitHub

## 3. System Architecture

The application uses an API Gateway as the central entry point for frontend requests. The gateway forwards requests to independent backend services.

### Components

- **React Frontend:** Provides the user interface for authentication, students, courses, and the dashboard.
- **API Gateway:** Routes requests to backend services and handles service errors.
- **Authentication Service:** Handles user registration, login, and JWT authentication.
- **Student Service:** Handles student record management.
- **Course Service:** Handles course record management.
- **SQLite Databases:** Store data locally for the respective services.

### Service Ports

| Component | Port |
|---|---:|
| API Gateway | 8000 |
| Authentication Service | 8001 |
| Student Service | 8002 |
| Course Service | 8003 |
| React Frontend | 5173 |

## 4. Main Features

### Authentication
- User registration
- User login
- JWT token generation and validation
- Current-user endpoint
- Frontend logout

### Student Management
- Create student records
- List all students
- Retrieve a student by ID
- Update student details
- Delete student records

Student fields include name, email, phone number, department, and course.

### Course Management
- Create courses
- List all courses
- Retrieve a course by ID
- Update course details
- Delete courses

Course fields include title, code, description, duration, and department.

### Dashboard
- Display student and course totals
- Navigate to student and course management pages

## 5. Project Structure

```text
student-management/
|-- api-gateway/
|-- auth-service/
|-- student-service/
|-- course-service/
|-- frontend/
|-- postman/
|   |-- collection.json
|-- docs/
|-- requirements.txt
|-- .gitignore
|-- README.md
```

## 6. Prerequisites

Install the following software before running the project:

- Python
- Node.js and npm
- Visual Studio Code (recommended)
- Postman
- Git

## 7. Installation and Setup

### Step 1: Open the project directory

Open Command Prompt and navigate to the project root:

```cmd
cd C:\Users\prane\OneDrive\Desktop\student-management
```

### Step 2: Activate the Python virtual environment

```cmd
venv\Scripts\activate
```

If the virtual environment does not exist, create it and activate it:

```cmd
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Python dependencies

```cmd
pip install -r requirements.txt
```

### Step 4: Install frontend dependencies

```cmd
cd frontend
npm install
cd ..
```

## 8. Running the Application

Run each backend service in a separate terminal. Execute backend commands from the project root directory with the virtual environment activated.

### Authentication Service

```cmd
uvicorn app.main:app --reload --port 8001 --app-dir auth-service
```

### Student Service

```cmd
uvicorn app.main:app --reload --port 8002 --app-dir student-service
```

### Course Service

```cmd
uvicorn app.main:app --reload --port 8003 --app-dir course-service
```

### API Gateway

```cmd
uvicorn main:app --reload --port 8000 --app-dir api-gateway
```

### React Frontend

Open another terminal and run:

```cmd
cd C:\Users\prane\OneDrive\Desktop\student-management\frontend
npm run dev
```

Open the local URL displayed by Vite. It is usually:

http://localhost:5173

**Note:** These startup commands are based on the current project structure and must be verified against the actual configuration before submission.

## 9. API Documentation

Once the corresponding services are running, open Swagger UI:

- **API Gateway:** http://127.0.0.1:8000/docs
- **Authentication Service:** http://127.0.0.1:8001/docs
- **Student Service:** http://127.0.0.1:8002/docs
- **Course Service:** http://127.0.0.1:8003/docs

Swagger UI allows you to inspect and test the endpoints exposed by each service.

## 10. API Endpoints

The following routes are expected to be available through the API Gateway, subject to the application's actual route configuration.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Log in |
| GET | `/auth/me` | Retrieve the current user |

### Students

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/students` | Create a student |
| GET | `/students` | List students |
| GET | `/students/{student_id}` | Retrieve a student |
| PUT | `/students/{student_id}` | Update a student |
| DELETE | `/students/{student_id}` | Delete a student |

### Courses

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/courses` | Create a course |
| GET | `/courses` | List courses |
| GET | `/courses/{course_id}` | Retrieve a course |
| PUT | `/courses/{course_id}` | Update a course |
| DELETE | `/courses/{course_id}` | Delete a course |

## 11. Postman API Testing

The Postman collection is stored at:

`postman/collection.json`

### Testing Procedure

1. Open Postman.
2. Import `postman/collection.json`.
3. Start the required backend services.
4. Register a test user or log in with an existing test account.
5. Obtain a fresh JWT access token.
6. Configure the token for protected endpoints where required.
7. Test student and course CRUD operations.
8. Verify HTTP status codes and response bodies.

Do not publish passwords, access tokens, or other sensitive information in the collection or repository.

## 12. Screenshots and Documentation

Save project screenshots and supporting documentation in the `docs/` directory.

Recommended screenshots include:

- Login and registration pages
- Dashboard showing student and course totals
- Student listing and management
- Course listing and management
- Successful Postman requests
- Swagger UI for backend services
- API Gateway health check

Only include screenshots that have actually been captured and saved.

## 13. Security Notes

- Do not commit passwords, access tokens, or other secrets.
- Keep `.env` files excluded from version control.
- Use test accounts for demonstrations.
- Do not commit Python virtual environments or `node_modules`.
- Keep database and environment configuration consistent with the project setup.

## 14. Version Control

Initialize Git from the project root if it has not already been initialized:

```cmd
git init
git status --short
```

Review the files before committing. Confirm that `.gitignore` excludes virtual environments, secrets, local databases, and generated files.

After creating a GitHub repository, connect it using the repository URL supplied by GitHub and push the reviewed project.

## 15. Future Improvements

Potential improvements include:

- Course enrollment and student-course relationships
- Additional role-based access controls
- Automated backend and frontend tests
- Improved API error handling
- Deployment and production configuration
