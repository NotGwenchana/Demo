import { useEffect, useCallback, useRef, useReducer, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../Css/Cart.css";
import { getItemById } from "../menu/menuData";
import { calculatePoints } from "../utils/pointsUtils";
import {
  getMaxUsablePoints,
  validatePoints,
  calculateDiscount,
  roundToValidPoints,
  getPointSuggestions,
  canUseAnyPoints,
  getPointsStatusMessage,
  formatPoints,
} from "../utils/pointConversion";

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_ALL_DATA":
      return {
        ...state,
        cart: action.payload.cart || [],
        memberPoints: action.payload.memberPoints || 0,
        isAuthenticated: action.payload.isAuthenticated || false,
        isLoading: false,
      };

    case "UPDATE_QUANTITY": {
      const { index, newQuantity } = action.payload;
      if (newQuantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((_, i) => i !== index),
          pointsToUse: 0,
          isUpdating: false,
        };
      }
      const updatedCart = [...state.cart];
      updatedCart[index] = { ...updatedCart[index], quantity: newQuantity };
      return {
        ...state,
        cart: updatedCart,
        pointsToUse: 0,
        isUpdating: false,
      };
    }

    case "REMOVE_ITEM": {
      const { index } = action.payload;
      return {
        ...state,
        cart: state.cart.filter((_, i) => i !== index),
        pointsToUse: 0,
        isUpdating: false,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
        pointsToUse: 0,
        isUpdating: false,
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_UPDATING":
      return { ...state, isUpdating: action.payload };

    case "SET_POINTS_TO_USE":
      return { ...state, pointsToUse: action.payload };

    case "SET_MEMBER_POINTS":
      return { ...state, memberPoints: action.payload };

    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };

    case "SET_SELECTED_LOCATION":
      return { ...state, selectedLocation: action.payload };

    case "SET_APPLYING_POINTS":
      return { ...state, isApplyingPoints: action.payload };

    default:
      return state;
  }
};

const initialState = {
  cart: [],
  isLoading: true,
  isAuthenticated: false,
  selectedLocation: "",
  memberPoints: 0,
  pointsToUse: 0,
  isApplyingPoints: false,
  isUpdating: false,
};

const CartItemDisplay = ({ item, index, onUpdateQuantity, onRemove }) => {
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  const getItemDetails = () => {
    const details = [];

    if (item.id === "party-pack") {
      const chulPanNames =
        item.selectedChulPan
          ?.map((id) => {
            const menuItem = getItemById(id);
            return menuItem ? menuItem.name : id;
          })
          .join(", ") || "None";

      const wingName = item.selectedChickenWing
        ? getItemById(item.selectedChickenWing)?.name || item.selectedChickenWing
        : "None";

      details.push(`Chul Pan: ${chulPanNames}`);
      details.push(`Chicken Wing: ${wingName}`);
      details.push("Original Dduk Bok Gi", "Jap Chae", "Dumplings", "Rice");
    }

    if (item.category === "Chul Pan") details.push(`Chul Pan: ${item.name}`);
    if (item.category === "Bi Bim Bap") details.push(`Bi Bim Bap: ${item.name}`);
    if (item.category === "Dduk Bok Gi") details.push(`Dduk Bok Gi: ${item.name}`);
    if (item.category === "Chicken Wings") details.push(`Chicken Wings: ${item.name}`);

    if (item.size) details.push(`Size: ${item.size}`);
    if (item.variation) details.push(item.variation);

    if (item.spicy && item.id !== "party-pack") details.push("🌶️ Spicy");

    return details;
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (isUpdatingItem) return;
    setIsUpdatingItem(true);
    try {
      await onUpdateQuantity(index, newQuantity);
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdatingItem) return;
    setIsUpdatingItem(true);
    try {
      await onRemove(index);
    } finally {
      setIsUpdatingItem(false);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-name">
        {item.name}
        {item.spicy && item.id !== "party-pack" && " 🌶️"}
      </div>

      {getItemDetails().map((detail, i) => (
        <div key={i} className="cart-item-detail">
          • {detail}
        </div>
      ))}

      <div className="cart-item-actions">
        <div>
          <button
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            className="cart-quantity-btn"
            disabled={isUpdatingItem}
          >
            -
          </button>
          <span className="cart-quantity">{item.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            className="cart-quantity-btn"
            disabled={isUpdatingItem}
          >
            +
          </button>
        </div>

        <div>
          <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={handleRemove} className="cart-remove-btn" disabled={isUpdatingItem}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

function Cart() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const dataFetchedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  const {
    cart,
    isLoading,
    isAuthenticated,
    selectedLocation,
    memberPoints,
    pointsToUse,
    isApplyingPoints,
  } = state;

  const isUpdating = state.isUpdating;

  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + (i.quantity || 0), 0), [cart]);
  const totalPrice = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * (i.quantity || 0), 0).toFixed(2),
    [cart]
  );
  const cartTotalValue = parseFloat(totalPrice);

  const maxUsablePoints = getMaxUsablePoints(memberPoints, cartTotalValue);
  const canUsePoints = canUseAnyPoints(memberPoints, cartTotalValue);
  const pointsStatusMessage = getPointsStatusMessage(memberPoints, cartTotalValue);
  const pointSuggestions = getPointSuggestions(cartTotalValue, memberPoints);

  const { discountAmount, newTotal: discountedTotal } = calculateDiscount(pointsToUse, cartTotalValue);
  const showDiscount = pointsToUse >= 100;

  const getLocationName = (locationValue) => {
    const locations = {
      causewaybay: "Causeway Bay",
      hok: "HOK",
      hkust: "HKUST",
      kowloonbay: "Kowloon Bay Amoy",
      tseungkwano: "Tseung Kwan O",
      tsimshatsui: "Tsim Sha Tsui",
      tsingyi: "Tsing Yi",
    };
    return locations[locationValue] || locationValue;
  };

  // Helper function to notify NavBar about cart updates
  const notifyCartUpdated = useCallback(() => {
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  // Stable debounced save (no UI reload/refetch)
  const debouncedSaveCart = useMemo(() => {
    return debounce(async (updatedCart) => {
      try {
        await axios.post("/cart", { cart: updatedCart }, { withCredentials: true });
        // Notify NavBar after successful save
        notifyCartUpdated();
      } catch (error) {
        console.error("Error saving cart:", error);
        if (error.response?.status === 401) {
          toast.error("Please sign in to update your cart");
          navigate("/signin");
        }
      }
    }, 400);
  }, [navigate, notifyCartUpdated]);

  const loadUserData = useCallback(async () => {
    try {
      const response = await axios.get("/profile", { withCredentials: true });

      if (response.data && response.data.username) {
        const cartResponse = await axios.get("/cart", { withCredentials: true });

        dispatch({
          type: "SET_ALL_DATA",
          payload: {
            cart: cartResponse.data?.cart || [],
            memberPoints: response.data.memberPoints || 0,
            isAuthenticated: true,
          },
        });
      } else {
        dispatch({
          type: "SET_ALL_DATA",
          payload: { cart: [], memberPoints: 0, isAuthenticated: false },
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      dispatch({
        type: "SET_ALL_DATA",
        payload: { cart: [], memberPoints: 0, isAuthenticated: false },
      });
    }
  }, []);

  useEffect(() => {
    if (!dataFetchedRef.current) {
      dataFetchedRef.current = true;
      loadUserData();
    }

    const handleAuthChange = () => loadUserData();

    const handlePointsUpdated = () => {
      const loadPointsOnly = async () => {
        try {
          const response = await axios.get("/profile", { withCredentials: true });
          if (response.data && response.data.memberPoints !== undefined) {
            dispatch({ type: "SET_MEMBER_POINTS", payload: response.data.memberPoints });
            dispatch({ type: "SET_POINTS_TO_USE", payload: 0 });
          }
        } catch (error) {
          console.error("Error refreshing points:", error);
        }
      };
      loadPointsOnly();
    };

    const handleCartUpdated = () => {
      // no-op (prevents cart flicker)
    };

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("memberPointsUpdated", handlePointsUpdated);
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("memberPointsUpdated", handlePointsUpdated);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [loadUserData]);

  // Key flicker fix: update local state synchronously and don't refetch/reload from server.
  const updateQuantity = async (index, newQuantity) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    dispatch({ type: "SET_UPDATING", payload: true });

    dispatch({ type: "UPDATE_QUANTITY", payload: { index, newQuantity } });

    const currentCart = [...cart];
    if (newQuantity <= 0) {
      const updatedCart = currentCart.filter((_, i) => i !== index);
      debouncedSaveCart(updatedCart);
      // Immediate notification for UI responsiveness
      notifyCartUpdated();
    } else {
      currentCart[index] = { ...currentCart[index], quantity: newQuantity };
      debouncedSaveCart(currentCart);
      // Immediate notification for UI responsiveness
      notifyCartUpdated();
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
      dispatch({ type: "SET_UPDATING", payload: false });
    }, 120);
  };

  const removeFromCart = async (index) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    dispatch({ type: "SET_UPDATING", payload: true });
    dispatch({ type: "REMOVE_ITEM", payload: { index } });

    try {
      const updatedCart = cart.filter((_, i) => i !== index);
      await axios.post("/cart", { cart: updatedCart }, { withCredentials: true });
      toast.success("Item removed from cart");
      // Notify NavBar about cart update
      notifyCartUpdated();
    } catch (error) {
      console.error("Error removing item:", error);
      loadUserData();
      toast.error("Failed to remove item");
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
        dispatch({ type: "SET_UPDATING", payload: false });
      }, 120);
    }
  };

  const clearCart = async () => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    dispatch({ type: "SET_UPDATING", payload: true });
    dispatch({ type: "CLEAR_CART" });

    try {
      await axios.post("/cart", { cart: [] }, { withCredentials: true });
      toast.success("Cart cleared");
      // Notify NavBar about cart update
      notifyCartUpdated();
    } catch (error) {
      console.error("Error clearing cart:", error);
      loadUserData();
      toast.error("Failed to clear cart");
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
        dispatch({ type: "SET_UPDATING", payload: false });
      }, 120);
    }
  };

  const handleApplyPoints = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to use member points");
      navigate("/signin");
      return;
    }

    const validation = validatePoints(pointsToUse, memberPoints, cartTotalValue);
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    dispatch({ type: "SET_APPLYING_POINTS", payload: true });
    try {
      const newPoints = memberPoints - pointsToUse;
      const response = await axios.put(
        "/profile/update-points",
        { memberPoints: newPoints },
        { withCredentials: true }
      );

      if (response.status === 200) {
        dispatch({ type: "SET_MEMBER_POINTS", payload: newPoints });
        toast.success(
          `Successfully applied ${formatPoints(pointsToUse)}! Discount: $${discountAmount.toFixed(2)}`
        );
        window.dispatchEvent(new Event("memberPointsUpdated"));
      }
    } catch (error) {
      console.error("Error applying points:", error);
      toast.error(error.response?.data?.error || "Failed to apply points");
    } finally {
      dispatch({ type: "SET_APPLYING_POINTS", payload: false });
    }
  };

  const handlePointsInputChange = (e) => {
    let value = parseInt(e.target.value);

    if (isNaN(value)) {
      dispatch({ type: "SET_POINTS_TO_USE", payload: 0 });
      return;
    }

    value = roundToValidPoints(value);

    if (value > 500) {
      value = 500;
      toast.error("Maximum 500 points allowed per transaction");
    }

    if (value < 0) value = 0;

    dispatch({ type: "SET_POINTS_TO_USE", payload: value });
  };

  const handleSuggestionClick = (points) => {
    dispatch({ type: "SET_POINTS_TO_USE", payload: points });
  };

  const checkout = async () => {
    console.log("[Cart] checkout() clicked");
    if (cart.length === 0) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to checkout");
      navigate("/signin");
      return;
    }

    if (!selectedLocation) {
      toast.error("Please select a pickup location");
      return;
    }

    try {
      const pointsInfo = calculatePoints(cart, pointsToUse);

      const currentDate = new Date();
      const orderNumber = `P${currentDate.getTime()}`;

      const orderDateISO = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const orderTimeISO = currentDate.toISOString(); // full iso

      // Admin total sales (checkout-init) record.
      // This is triggered when user clicks checkout from /cart.
      try {
        const payload = {
          orderDateISO,
          orderTimeISO,
          amount: Number(discountedTotal.toFixed(2)),
          items: (cart || []).map((it) => ({
            name: it?.name,
            quantity: it?.quantity || 0,
          })),
        };

        console.log("[Cart] checkout-init payload:", payload);

        const res = await axios.post(
          "/admin/totalsales/checkout-init",
          payload,
          { withCredentials: true }
        );

        console.log("[Cart] checkout-init response:", res.data);
      } catch (e) {
        // don't block order placement; total sales is admin-only feature
        console.error(
          "[Cart] checkout-init FAILED",
          e?.response?.status,
          e?.response?.data,
          e?.message
        );
      }

      const orderData = {
        orderNumber,
        orderDate: currentDate.toISOString(),
        orderTime: currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        pickupTime: new Date(currentDate.getTime() + 20 * 60000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        pickupLocation: getLocationName(selectedLocation),
        items: cart,
        subtotal: totalPrice,
        pointsUsed: pointsToUse,
        discountAmount: discountAmount.toFixed(2),
        finalTotal: discountedTotal.toFixed(2),
        status: "pending",
        pointsEarned: pointsInfo.pointsEarned,
        pointsDeducted: pointsInfo.pointsDeducted,
        netPointsChange: pointsInfo.netPointsChange,
        pointsBreakdown: pointsInfo.pointsBreakdown,
      };

      try {
        await axios.post("/orders", orderData, { withCredentials: true });
      } catch (orderError) {
        console.error("Failed to save order:", orderError);
      }

      if (pointsToUse > 0 || pointsInfo.pointsEarned > 0) {
        try {
          const pointsResponse = await axios.patch(
            "/points",
            { pointsEarned: pointsInfo.pointsEarned, pointsUsed: pointsToUse },
            { withCredentials: true }
          );

          if (pointsResponse.data && pointsResponse.data.newPoints !== undefined) {
            const newPoints = pointsResponse.data.newPoints;
            dispatch({ type: "SET_MEMBER_POINTS", payload: newPoints });
            localStorage.setItem("userPoints", newPoints.toString());
            window.dispatchEvent(
              new CustomEvent("pointsUpdated", {
                detail: { points: newPoints },
              })
            );
            window.dispatchEvent(new Event("orderCompleted"));
            window.dispatchEvent(new Event("memberPointsUpdated"));
          }
        } catch (pointsError) {
          console.error("Failed to update points:", pointsError);
        }
      }

      try {
        await axios.post("/cart", { cart: [] }, { withCredentials: true });
        dispatch({ type: "CLEAR_CART" });
        // Notify NavBar that cart was cleared
        notifyCartUpdated();
      } catch (cartError) {
        console.error("Failed to clear cart:", cartError);
      }

      toast.success("Order placed successfully!");

      navigate("/checkout", {
        state: {
          cart,
          pickupLocation: selectedLocation,
          pointsUsed: pointsToUse,
          discountAmount,
          finalTotal: discountedTotal,
          pointsEarned: pointsInfo.pointsEarned,
          netPointsChange: pointsInfo.netPointsChange,
        },
      });
    } catch (error) {
      console.error("Error in checkout function:", error);
      toast.error(error.response?.data?.error || "Failed to place order. Please try again.");
    }
  };

  const removePoints = () => dispatch({ type: "SET_POINTS_TO_USE", payload: 0 });

  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="cart-empty">Loading your cart...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <h3 className="cart-title">Cart</h3>
        <div className="cart-empty">
          Please sign in to view your cart
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => navigate("/signin")} className="cart-checkout-btn">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h3 className="cart-title">Cart ({totalItems} items)</h3>

      <div className="cart-items-list">
        {cart.length === 0 ? (
          <div className="cart-empty">Your cart is empty</div>
        ) : (
          cart.map((item, index) => (
            <CartItemDisplay
              key={`${item.id}-${index}-${item.size || ""}-${item.variation || ""}`}
              item={item}
              index={index}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))
        )}
      </div>

      <hr className="cart-divider" />

      <div className="cart-footer">
        <div className="points-info">
          <p>
            Available Points: <strong>{memberPoints}</strong> points
          </p>
          <p className="points-hint">{pointsStatusMessage}</p>
          {pointSuggestions?.length ? null : null}
        </div>

        {canUsePoints && (
          <div className="points-input-section">
            <div className="points-suggestions">
              {pointsToUse === 0 ? (
                <button
                  onClick={() => handleSuggestionClick(100)}
                  className="suggestion-btn"
                  disabled={isApplyingPoints}
                >
                  Use Points
                </button>
              ) : pointsToUse + 100 <= maxUsablePoints ? (
                <button
                  onClick={() => handleSuggestionClick(pointsToUse + 100)}
                  className="suggestion-btn"
                  disabled={isApplyingPoints}
                >
                  Use Points
                </button>
              ) : pointsToUse < maxUsablePoints ? (
                <button
                  onClick={() => handleSuggestionClick(maxUsablePoints)}
                  className="suggestion-btn"
                  disabled={isApplyingPoints}
                >
                  Use Points
                </button>
              ) : null}

              <button
                onClick={removePoints}
                className="suggestion-btn"
                disabled={isApplyingPoints || pointsToUse === 0}
              >
                Remove Points
              </button>
            </div>
          </div>
        )}

        <div className="cart-total-section">
          <div className="cart-total-row">
            <span>SubTotal:</span>
            <span>${totalPrice}</span>
          </div>

          {showDiscount && (
            <div className="cart-total-row">
              <span>Points Discount ({pointsToUse} points):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="cart-total-row cart-grand-total">
            <span>Total:</span>
            <span>${showDiscount ? discountedTotal.toFixed(2) : totalPrice}</span>
          </div>
        </div>

        <div className="cart-buttons">
          <button onClick={clearCart} disabled={cart.length === 0 || isUpdating} className="cart-clear-btn">
            Clear Cart
          </button>
          <button
            onClick={checkout}
            disabled={cart.length === 0 || !selectedLocation || isUpdating}
            className="cart-checkout-btn"
          >
            Go to Checkout
          </button>
        </div>

        <form className="cart-location-form">
          <label>Pickup Location:</label>
          <select
            name="order-location"
            required
            value={selectedLocation}
            onChange={(e) => dispatch({ type: "SET_SELECTED_LOCATION", payload: e.target.value })}
          >
            <option value="">Select Pickup location</option>
            <option value="causewaybay">Causeway Bay</option>
            <option value="hok">HOK</option>
            <option value="hkust">HKUST</option>
            <option value="kowloonbay">Kowloon Bay Amoy</option>
            <option value="tseungkwano">Tseung Kwan O</option>
            <option value="tsimshatsui">Tsim Sha Tsui</option>
            <option value="tsingyi">Tsing Yi</option>
          </select>
        </form>
      </div>
    </div>
  );
}

export default Cart;