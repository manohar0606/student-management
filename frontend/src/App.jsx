
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Students from "./Students";
import Courses from "./Courses";
import { apiRequest } from "./api";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState(null);
  const [studentCount, setStudentCount] = useState(null);
  const [courseCount, setCourseCount] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  function handleRegistered() {
    setNotice("Account created successfully. Please sign in.");
    setPage("login");
  }

  async function handleLogin(accessToken) {
    setToken(accessToken);
    setNotice("");
    setDashboardError("");
    setPage("dashboard");

    try {
      const profile = await apiRequest("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(profile);
    } catch {
      setUser(null);
    }

    setLoadingStats(true);

    try {
      const [students, courses] = await Promise.all([
        apiRequest("/students"),
        apiRequest("/courses"),
      ]);

      setStudentCount(Array.isArray(students) ? students.length : 0);
      setCourseCount(Array.isArray(courses) ? courses.length : 0);
    } catch {
      setDashboardError(
        "Unable to load dashboard totals. Please check that all services are running."
      );
    } finally {
      setLoadingStats(false);
    }
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    setStudentCount(null);
    setCourseCount(null);
    setDashboardError("");
    setPage("login");
    setNotice("You have signed out.");
  }

  if (page === "register") {
    return (
      <Register
        onRegistered={handleRegistered}
        onShowLogin={() => {
          setNotice("");
          setPage("login");
        }}
      />
    );
  }

  if (page === "students") {
    return <Students onBack={() => setPage("dashboard")} />;
  }

  if (page === "courses") {
    return <Courses onBack={() => setPage("dashboard")} />;
  }

  if (page === "dashboard") {
    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="brand-mark">S</div>
            <div>
              <strong>Student Management</strong>
              <p>Academic administration portal</p>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </header>

        <section className="dashboard-content">
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>

          <p className="dashboard-welcome">
            Welcome{user?.username ? `, ${user.username}` : ""}! Here's your
            academic overview.
          </p>

          {dashboardError && (
            <p className="error-message" role="alert">
              {dashboardError}
            </p>
          )}

          <div className="dashboard-stats">
            <article className="stat-card">
              <div className="stat-icon students-icon">S</div>
              <p>Total students</p>
              <h2>
                {loadingStats
                  ? "..."
                  : studentCount === null
                    ? "—"
                    : studentCount}
              </h2>
              <span>Student records</span>
            </article>

            <article className="stat-card">
              <div className="stat-icon courses-icon">C</div>
              <p>Available courses</p>
              <h2>
                {loadingStats
                  ? "..."
                  : courseCount === null
                    ? "—"
                    : courseCount}
              </h2>
              <span>Course records</span>
            </article>

            <article className="stat-card">
              <div className="stat-icon account-icon">U</div>
              <p>Account status</p>
              <h2 className="status-value">Active</h2>
              <span>{user?.email || "Signed-in user"}</span>
            </article>
          </div>

          <section className="dashboard-section">
            <h2>Management modules</h2>
            <p>
              Use these modules to manage your institution's academic records.
            </p>

            <div className="module-grid">
              <article
                className="module-card module-card-clickable"
                onClick={() => setPage("students")}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setPage("students");
                  }
                }}
              >
                <div className="module-symbol">01</div>
                <h3>Students</h3>
                <p>Create, view, update, and delete student records.</p>
                <span className="module-status">
                  Manage students →
                </span>
              </article>

              <article
                className="module-card module-card-clickable"
                onClick={() => setPage("courses")}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setPage("courses");
                  }
                }}
              >
                <div className="module-symbol">02</div>
                <h3>Courses</h3>
                <p>Create, view, update, and delete course records.</p>
                <span className="module-status">
                  Manage courses →
                </span>
              </article>

              <article className="module-card">
                <div className="module-symbol">03</div>
                <h3>Authentication</h3>
                <p>
                  Your account is authenticated through the API Gateway.
                </p>
                <span className="module-status">Signed in</span>
              </article>
            </div>
          </section>
        </section>

        <footer className="dashboard-footer">
          Student Management System · Microservices Architecture
        </footer>
      </main>
    );
  }

  return (
    <>
      {notice && (
        <div className="notice-message" role="status">
          {notice}
        </div>
      )}

      <Login
        onLogin={handleLogin}
        onShowRegister={() => {
          setNotice("");
          setPage("register");
        }}
      />
    </>
  );
}
