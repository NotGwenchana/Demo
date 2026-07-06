import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Css/SignUp.css";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

function SignUp() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Separate states for password and confirm password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handlePhoneKeyDown = (event) => {
    const isNumber = /^[0-9]$/.test(event.key);
    const isControl = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
    ].includes(event.key);
    const isShortcut =
      event.ctrlKey && ["a", "c", "v", "x"].includes(event.key.toLowerCase());

    if (!isNumber && !isControl && !isShortcut) event.preventDefault();
  };

  const preventSpace = (event) => {
    if (event.key === ' ') {
      event.preventDefault();
    }
  };

  // Simple validation function for phone number
  const isValidPhoneNumber = (phone) => {
    // Check if it's exactly 8 digits and nothing else
    return /^\d{8}$/.test(phone);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, email, password, confirmPassword, phone } = form;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate phone number
    if (!isValidPhoneNumber(phone)) {
      toast.error("Invalid phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/signup",
        {
          username,
          email,
          password,
          confirmPassword,
          phone,
        },
        { withCredentials: true }
      );

      if (response?.data?.error) {
        setError(response.data.error);
        setSuccess("");
        toast.error(response.data.error);
        return;
      }

      console.log(response.data);
      toast.success("Sign up successful!");
      setError("");
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      });

      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      console.error("Error!", err);
      setError(err.response?.data?.error || "Server error");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1>Create Account</h1>
        <p>Join the Hungry Korean family!</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <br />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <div className="password-wrapper">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              onKeyDown={preventSpace}
              required
            />
            </div>
          </div>

          <div className="form-group">
            <label>Email:</label>
            <div className="password-wrapper">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={preventSpace}
              placeholder="example@email.com"
              required
            />
            </div>
          </div>

          <div className="form-group">
            <label>Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={preventSpace}
                required
              />
              <span className="eye-toggle" onClick={handleTogglePassword}> 
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onKeyDown={preventSpace}
                required
              />
              <span className="eye-toggle" onClick={handleToggleConfirmPassword}> 
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number (8 digits only):</label>
            <div className="password-wrapper">
            <input
              type="tel"
              maxLength="8"
              inputMode="numeric"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onKeyDown={handlePhoneKeyDown}
              required
            />
            </div>
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <br />

        <div className="signin-link">
            Already have an account? <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;