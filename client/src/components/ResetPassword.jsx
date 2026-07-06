import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
//import "../Css/ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `/reset-password/${token}`,
        {
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        },
        { withCredentials: true }
      );
      
      setMessage({ type: "success", text: response.data.message });
      toast.success("Password reset successful!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Something went wrong";
      setMessage({ type: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your new password below</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === "success" ? "✓" : "✗"}
            </span>
            <p>{message.text}</p>
          </div>
        )}

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password:</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="reset-btn" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}