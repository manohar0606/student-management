
import { useEffect, useState } from "react";
import { apiRequest } from "./api";

const emptyForm = {
  name: "",
  email: "",
  phone_number: "",
  department: "",
  course: "",
};

export default function Students({ onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deletingId, setDeletingId] = useState(null);

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
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

  function openEditForm(student) {
    setForm({
      name: student.name || "",
      email: student.email || "",
      phone_number: student.phone_number || "",
      department: student.department || "",
      course: student.course || "",
    });
    setEditingId(student.id);
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
      name: form.name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      department: form.department.trim(),
      course: form.course.trim(),
    };

    try {
      if (editingId !== null) {
        await apiRequest(`/students/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Student updated successfully.");
      } else {
        await apiRequest("/students", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Student created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(student.id);

    try {
      await apiRequest(`/students/${student.id}`, {
        method: "DELETE",
      });

      setSuccess(`${student.name} was deleted successfully.`);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to delete student.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="students-page">
      <header className="students-header">
        <div>
          <p className="eyebrow">ACADEMIC ADMINISTRATION</p>
          <h1>Students</h1>
          <p>View and manage student records.</p>
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
            <h2>Student Directory</h2>
            <p>
              {students.length} student
              {students.length === 1 ? "" : "s"} registered
            </p>
          </div>

          <div className="students-actions">
            <button
              type="button"
              className="students-refresh-button"
              onClick={loadStudents}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              type="button"
              className="students-add-button"
              onClick={openCreateForm}
            >
              + Add Student
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
            <h2>{editingId !== null ? "Edit Student" : "Add New Student"}</h2>

            <div className="student-form-grid">
              <label>
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                  maxLength={254}
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  maxLength={20}
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

              <label>
                Course
                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech"
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
                    ? "Update Student"
                    : "Save Student"}
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
          <p className="students-message">Loading student records...</p>
        ) : students.length === 0 ? (
          <p className="students-message">
            No students found. Click Add Student to create one.
          </p>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>#{student.id}</td>
                    <td className="student-name">{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone_number || "—"}</td>
                    <td>{student.department || "—"}</td>
                    <td>{student.course || "—"}</td>
                    <td>
                      <div className="student-row-actions">
                        <button
                          type="button"
                          className="student-edit-button"
                          onClick={() => openEditForm(student)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="student-delete-button"
                          onClick={() => handleDelete(student)}
                          disabled={deletingId === student.id}
                        >
                          {deletingId === student.id ? "Deleting..." : "Delete"}
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
