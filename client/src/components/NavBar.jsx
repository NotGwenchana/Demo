import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";
import "../Css/NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch cart total from server
  const fetchCartTotal = async () => {
    try {
      const response = await axios.get("/cart", { withCredentials: true });
      console.log("NavBar - Cart response:", response.data);
      if (response.data && Array.isArray(response.data.cart)) {
        const total = response.data.cart.reduce(
          (sum, item) => sum + (item?.quantity ? Number(item.quantity) : 0),
          0
        );
        setTotalItems(total);
      } else {
        setTotalItems(0);
      }
    } catch (error) {
      console.error("NavBar - Error fetching cart:", error);
      setTotalItems(0);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/profile", {
        withCredentials: true,
      });
      
      if (response.data && response.data.username) {
        setUser(response.data);
        // Admins don't need cart badge; avoid calling GET /cart for admin accounts.
        const isAdmin = Boolean(response.data?.isAdmin) || response.data?.role === "admin";
        if (!isAdmin) await fetchCartTotal();
      } else {
        setUser(null);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Auth check error:", error); 
      setUser(null);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await axios.post("/signout", {}, { withCredentials: true });
      setUser(null);
      setTotalItems(0);
      toast.success("Signed out successfully");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  // Initial load only - no dependencies to prevent infinite loop
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        await checkAuthStatus();
      } finally {
        if (isMounted) {
          // no-op
        }
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  // Separate effect for event listeners
  useEffect(() => {

    const handleAuthChange = () => {
      console.log("Auth change detected");
      checkAuthStatus();
    };
    
    const handleCartUpdated = () => {
      console.log("Cart updated event detected");
      // Always fetch cart total regardless of user state
      fetchCartTotal();
    };
    
    // Listen for points updated event (which is dispatched after checkout)
    const handlePointsUpdated = () => {
      console.log("Points updated event detected - refreshing cart");
      fetchCartTotal();
    };
    
    // Listen for order completed event
    const handleOrderCompleted = () => {
      console.log("Order completed event detected - refreshing cart");
      // Small delay to ensure cart is cleared on server
      setTimeout(() => {
        fetchCartTotal();
      }, 300);
    };
    
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("pointsUpdated", handlePointsUpdated);
    window.addEventListener("orderCompleted", handleOrderCompleted);
    
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("pointsUpdated", handlePointsUpdated);
      window.removeEventListener("orderCompleted", handleOrderCompleted);
    };
  }, []); // Remove user dependency to always listen

  // Show loading state
  if (loading) {
    return (
      <div className="nav-page">
        <div className="top-bar">
          <div className="logo-container">
            <a href="/home">
              <img src={logo} alt="logo" className="logo-img" />
            </a>
          </div>
          <div className="nav-container">
            <Link to="/">Home</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/about">About us</Link>
            <Link to="/contacts">Contacts</Link>
            <Link to="/signin">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.isAdmin === true || user?.role === "admin";

  return (
    <div className="nav-page">
      <div className="top-bar">
        <div className="logo-container">
          <a href={isAdmin ? "/admin" : "/home"}>
            <img src={logo} alt="logo" className="logo-img" />
          </a>
        </div>

        <div className="nav-container">
          {isAdmin ? (
            // Admin Navigation
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/orders">Menu</Link>
              
              <Link to="/profile" style={{ color: "#05c515", fontWeight: "bold" }}>
                Profile
              </Link>
              
              <button 
                onClick={handleSignOut}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff4444",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "0 5px"
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            // Regular User Navigation
            <>
              <Link to="/">Home</Link>
              <Link to="/orders">Menu</Link>

              <Link to="/cart" className={totalItems > 0 ? "cart-link" : undefined}>
                Cart
                {totalItems > 0 ? <span className="cart-badge">{totalItems}</span> : null}
              </Link>

              <Link to="/about">About us</Link>
              <Link to="/contacts">Contacts</Link>
              
              {user ? (
                <div className="user-menu" style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                  <Link to="/profile" style={{ color: "#05c515", fontWeight: "bold" }}>
                    {user.username}
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4444",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "0 5px"
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/signin">Sign in</Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;