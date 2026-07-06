import "../Css/SignIn.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function SignIn() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const preventSpace = (event) => {
    if (event.key === " ") event.preventDefault();
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const SigninUser = async (e) => {
    e.preventDefault();
    const { username, password } = form;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/signin",
        { username, password },
        { withCredentials: true }
      );
      
      toast.success("Sign in successful");
      setForm({ username: "", password: "" });
      
      // Dispatch event to notify NavBar about auth change
      window.dispatchEvent(new Event("authChange"));
      
      // Check if user is admin and redirect accordingly
      if (response.data.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/orders");
      }
    } catch (error) {
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Invalid username or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h1>Welcome</h1>

        <form onSubmit={SigninUser}>
          <div className="form-group">
            <label>Username:</label>
            <div className="password-wrapper">
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                onKeyDown={preventSpace}
                type="text"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password:</label>
            <div className="password-wrapper">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={preventSpace}
                type={showPassword ? "text" : "password"}
                required
              />
              <span className="eye-toggle" onClick={handleTogglePassword}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          <p className='text-blue-500 text-sm'>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <button type="submit" className="signin-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <br/>

        <div className="signin-link">
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;