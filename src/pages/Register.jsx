import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    grade: "7",
    accessCode: "",
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(field, value) {
    setForm(function (previous) {
      return { ...previous, [field]: value };
    });
  }

  function validate() {
    const found = {};

    if (form.name.trim().length < 2) {
      found.name = "Please enter your full name.";
    }
    if (form.username.trim().length < 3) {
      found.username = "Username must be at least 3 characters.";
    }

    if (form.password.length < 6) {
      found.password = "Password must be at least 6 characters.";
    }
    if (form.grade !== "7" && form.grade !== "8") {
      found.grade = "Choose Grade 7 or Grade 8.";
    }
    if (!form.accessCode.trim()) {
      found.accessCode = "Please enter your access code.";
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setBanner("");

    if (!validate()) return;

    setBusy(true);

    register({
      ...form,
      name: form.name.trim(),
      username: form.username.trim(),
      accessCode: form.accessCode.trim(),
    })
      .then(function () {
        navigate("/login", {
          state: {
            message: "Registration successful! Please log in with your username and password.",
          },
        });
      })
      .catch(function (err) {
        setBanner(err.message || "Registration failed. Please try again.");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  return (
    <div className="page auth-page">
      <h1 className="page-title">Create your account</h1>
      <p className="page-subtitle">Solo Mode saves your scores, so you need a quick account.</p>

      <form className="card-surface" onSubmit={handleSubmit} noValidate>
        {banner ? (<p className="form-banner-error">{banner}</p>) : null}

        <div className="form-field">
          <label className="form-label" htmlFor="reg-name">
            Full name
          </label>
          <input
            id="reg-name"
            className={errors.name ? "form-input form-input--invalid" : "form-input"}
            value={form.name}
            onChange={function (e) {
              updateField("name", e.target.value);
            }}
          />
          {errors.name ? <p className="form-error">{errors.name}</p> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reg-username">
            Username
          </label>
          <input
            id="reg-username"
            className={errors.username ? "form-input form-input--invalid" : "form-input"}
            value={form.username}
            onChange={function (e) {
              updateField("username", e.target.value);
            }}
          />
          {errors.username ? <p className="form-error">{errors.username}</p> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reg-password">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            className={errors.password ? "form-input form-input--invalid" : "form-input"}
            value={form.password}
            onChange={function (e) {
              updateField("password", e.target.value);
            }}
          />
          <span className="form-hint">At least 6 characters.</span>
          {errors.password ? <p className="form-error">{errors.password}</p> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reg-grade">
            Grade
          </label>
          <select
            id="reg-grade"
            className="form-select"
            value={form.grade}
            onChange={function (e) {
              updateField("grade", e.target.value);
            }}
          >
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
          </select>
          {errors.grade ? <p className="form-error">{errors.grade}</p> : null}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="reg-access-code">
            Access code
          </label>

          <input
            id="reg-access-code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            className={
              errors.accessCode
                ? "form-input form-input--invalid"
                : "form-input"
            }
            value={form.accessCode}
            onChange={function (e) {
              updateField("accessCode", e.target.value);
            }}
          />

          <span className="form-hint">
            Enter the code provided by your teacher.
          </span>

          {errors.accessCode ? (
            <p className="form-error">{errors.accessCode}</p>
          ) : null}
        </div>

        <Button type="submit" variant="accent" block disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </Button>

        <p className="form-switch-text">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
