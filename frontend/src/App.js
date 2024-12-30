import React, { useState } from "react";
import axios from "axios";
import ProfessorDashboard from "./components/ProfessorDashboard";
import StudentDashboard from "./components/StudentDashboard";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterForm = ({ onBack }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isProfessor, setIsProfessor] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/register", {
        username,
        password,
        isProfessor,
      });
      alert("Registration successful! You can now log in.");
      onBack(); // Navigate back to the login form
    } catch (error) {
      alert("Registration failed: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="App container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="text-center">Register</h1>
              <form onSubmit={handleRegister} className="mt-4">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isProfessor"
                    checked={isProfessor}
                    onChange={(e) => setIsProfessor(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isProfessor">
                    Register as Professor
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Register
                </button>
                <button
                  type="button"
                  className="btn btn-secondary w-100 mt-2"
                  onClick={onBack}
                >
                  Back to Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [role, setRole] = useState(null);
  const [login, setLogin] = useState(false);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isProfessor, setIsProfessor] = useState(false); // Checkbox state for role
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });
      const rl = response.data.role;
      const id = response.data.id;

      if (isProfessor && rl === "professor") {
        setUserId(id);
        setLogin(true);
        setRole("professor");
      } else if (!isProfessor && rl === "student") {
        setUserId(id);
        setLogin(true);
        setRole("student");
      } else {
        alert("Invalid role selected. Please check your role.");
      }
    } catch (error) {
      alert("Login failed: Invalid credentials");
    }
  };

  if (login && role === "professor") {
    return <ProfessorDashboard userId={userId} />;
  }

  if (login && role === "student") {
    return <StudentDashboard userId={userId} />;
  }

  if (isRegistering) {
    return <RegisterForm onBack={() => setIsRegistering(false)} />;
  }

  return (
    <div className="App container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="text-center">College Appointment System</h1>
              <h1 className="text-center">Login</h1>
              <form onSubmit={handleLogin} className="mt-4">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isProfessor"
                    checked={isProfessor}
                    onChange={(e) => setIsProfessor(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isProfessor">
                    Login as Professor
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary w-100 mt-2"
                  onClick={() => setIsRegistering(true)}
                >
                  Register a new user
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
