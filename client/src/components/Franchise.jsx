import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import '../Css/Franchise.css';
import emailjs from "@emailjs/browser";
import { toast } from "react-hot-toast";

export default function Franchise() {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const EMAILJS_SERVICE_ID = "service_9cwe5o9";    
  const EMAILJS_TEMPLATE_ID = "template_btvfxav";  
  const EMAILJS_PUBLIC_KEY = "6DMdLJxRLms41HAmr";      

  // Initialize EmailJS when component mounts
  useEffect(() => {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      setIsInitialized(true);
      console.log("EmailJS initialized successfully");
    } catch (error) {
      console.error("EmailJS initialization failed:", error);
      toast.error("Email service configuration error. Please contact support.");
    }
  }, []);

  // Helper function to get current time in a readable format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    
    if (!isInitialized) {
      toast.error("Email service is not ready. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get form data - note the field names match the HTML form
      const formData = new FormData(form.current);
      const templateParams = {
        user_name: formData.get('name'),
        user_email: formData.get('email'),
        message: formData.get('message'),
        time: getCurrentTime()
      };

      console.log("Sending email with params:", templateParams);

      // Send the email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log("Email sent successfully!", response);
      
      // Show success toast
      toast.success("Message sent successfully! Thank you for your feedback.");
      
      // Reset form
      form.current.reset();
      
    } catch (error) {
      console.error("Failed to send email:", error);
      
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error.text === "Invalid Public Key" || error.status === 403) {
        errorMessage = "Invalid EmailJS credentials. Please check your configuration.";
      } else if (error.status === 412) {
        errorMessage = "Email service not properly configured. Please check your EmailJS service.";
      } else if (error.text?.includes("template")) {
        errorMessage = "Template configuration error. Please check your EmailJS template.";
      }
      
      // Show error toast
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="franchise-page">
      <div className="franchise-container">
        
        {/* Page Title */}
        <h1>Guestbook</h1>
        <p className="tagline">We'd Love to Hear From You!</p>
        
        {/* Description Section */}
        <div className="description-box">
          <p>
            Tell us what you think of Hungry Korean – We want to please you, so your comments are important to us. 
            Let us know what you like or dislike, so we can keep refining our menu and improving our service 
            to give our customers an even more enjoyable experience.
          </p>
        </div>
        
        {/* Feedback Form */}
        <div className="form-container">
          <h2>Share Your Feedback</h2>
          
          <form ref={form} onSubmit={sendEmail}>
            
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Enter your full name"
                required 
                disabled={isSubmitting}
              />
            </div>
            
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email address"
                required 
                disabled={isSubmitting}
              />
            </div>
            
            {/* Message Field */}
            <div className="form-group">
              <label htmlFor="message">Your Message:</label>
              <textarea 
                id="message" 
                name="message" 
                placeholder="Tell us what you think..."
                rows="5"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Feedback ✉️"}
            </button>
            
          </form>
        </div>
        
        {/* Back to Home Button */}
        <div className="back-link">
          <Link to="/">← Back to Home</Link>
        </div>
        
      </div>
    </div>
  );
}