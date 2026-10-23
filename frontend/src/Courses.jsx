
import { useEffect, useState } from "react";
import { apiRequest } from "./api";

const emptyForm = {
  title: "",
  code: "",
  description: "",
  duration: "",
  department: "",
};

export default function Courses({ onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/courses");
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(course) {
    setForm({
      title: course.title || "",
      code: course.code || "",
      description: course.description || "",
      duration: course.duration || "",
      department: course.department || "",
    });
    setEditingId(course.id);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      department: form.department.trim(),
    };

    try {
      if (editingId !== null) {
        await apiRequest(`/courses/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Course updated successfully.");
      } else {
        await apiRequest("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Course created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}" (${course.code})? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(course.id);

    try {
      await apiRequest(`/courses/${course.id}`, {
        method: "DELETE",
      });

      setSuccess(`${course.title} was deleted successfully.`);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to delete course.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="students-page">
      <header className="students-header">
        <div>
          <p className="eyebrow">ACADEMIC ADMINISTRATION</p>
          <h1>Courses</h1>
          <p>View and manage available courses.</p>
        </div>

        <button
          type="button"
          className="students-back-button"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </header>

      <section className="students-panel">
        <div className="students-panel-heading">
          <div>
            <h2>Course Directory</h2>
            <p>
              {courses.length} course
              {courses.length === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="students-actions">
            <button
              type="button"
              className="students-refresh-button"
              onClick={loadCourses}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              type="button"
              className="students-add-button"
              onClick={openCreateForm}
            >
              + Add Course
            </button>
          </div>
        </div>

        {error && (
          <p className="students-error" role="alert">{error}</p>
        )}

        {success && (
          <p className="students-success" role="status">{success}</p>
        )}

        {showForm && (
          <form className="student-form" onSubmit={handleSubmit}>
            <h2>{editingId !== null ? "Edit Course" : "Add New Course"}</h2>

            <div className="student-form-grid">
              <label>
                Course title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Python Programming"
                  required
                  maxLength={150}
                />
              </label>

              <label>
                Course code
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. CS101"
                  required
                  maxLength={30}
                />
              </label>

              <label>
                Description
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Course description"
                  required
                  maxLength={500}
                />
              </label>

              <label>
                Duration
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 12 weeks"
                  required
                  maxLength={50}
                />
              </label>

              <label>
                Department
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                  maxLength={100}
                />
              </label>
            </div>

            <div className="students-actions">
              <button
                type="submit"
                className="students-add-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Course"
                    : "Save Course"}
              </button>

              <button
                type="button"
                className="students-back-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="students-message">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="students-message">
            No courses found. Click Add Course to create one.
          </p>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Course code</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>#{course.id}</td>
                    <td className="student-name">{course.title}</td>
                    <td>{course.code}</td>
                    <td>{course.description || "—"}</td>
                    <td>{course.duration || "—"}</td>
                    <td>{course.department || "—"}</td>
                    <td>
                      <div className="student-row-actions">
                        <button
                          type="button"
                          className="student-edit-button"
                          onClick={() => openEditForm(course)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="student-delete-button"
                          onClick={() => handleDelete(course)}
                          disabled={deletingId === course.id}
                        >
                          {deletingId === course.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
