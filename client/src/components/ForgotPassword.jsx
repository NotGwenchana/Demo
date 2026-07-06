import { useState } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import "../Css/ForgotPassword.css";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const EMAILJS_SERVICE_ID = "service_9cwe5o9";
  const EMAILJS_TEMPLATE_ID = "template_uwenvld";
  const EMAILJS_PUBLIC_KEY = "6DMdLJxRLms41HAmr";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("1. Sending request to backend with email:", email);
      
      const response = await axios.post(
        "/forgot-password",
        { email },
        { 
          withCredentials: true,
          timeout: 10000
        }
      );
      
      console.log("2. Backend response:", response.data);
      
      const { resetUrl, userEmail, username } = response.data;
      
      // Check if resetUrl exists
      if (!resetUrl) {
        console.error("Reset URL is missing from backend response!");
        throw new Error("Reset URL not generated");
      }
      
      console.log("3. Reset URL:", resetUrl);
      console.log("4. User email:", userEmail);
      
      // Send email using EmailJS
      const emailParams = {
        reset_link: resetUrl,  // Using only reset_link as you updated the template
        email: userEmail
      };
      
      console.log("5. EmailJS params being sent:", emailParams);
      
      const emailjsResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log("6. EmailJS response:", emailjsResponse);
      
      setMessage({ 
        type: "success", 
        text: "Password reset link sent to your email!" 
      });
      setEmail("");
      toast.success("Reset link sent to your email!");
      
    } catch (error) {
      console.error("ERROR DETAILS:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        setMessage({ type: "error", text: error.response.data?.error || "Server error" });
      } else if (error.request) {
        console.error("No response from server");
        setMessage({ type: "error", text: "Cannot connect to server" });
      } else {
        setMessage({ type: "error", text: error.message });
      }
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter your email to receive a password reset link</p>

        {/*{message.text && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === "success" ? "✓" : "✗"}
            </span>
            <p>{message.text}</p>
          </div>
        )}*/}

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="reset-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}