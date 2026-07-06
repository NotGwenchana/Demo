import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getItemById } from '../menu/menuData';
import { calculatePoints, formatPoints, pointsToDollars } from '../utils/pointsUtils';
import '../Css/Checkout.css';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [pointsData, setPointsData] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  
  const { 
    cart = [], 
    pickupLocation = '', 
    pointsUsed = 0, 
    discountAmount = 0, 
    finalTotal = 0 
  } = location.state || {};

  console.log('🔍 Checkout mounted with:', {
    cartItems: cart.length,
    pointsUsed,
    discountAmount,
    finalTotal,
    pickupLocation
  });

  // Calculate original subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0);
  console.log('💰 Subtotal calculated:', subtotal);
  
  // Generate order number (P1, P2, P3, etc.)
  useEffect(() => {
    const generateOrderNumber = async () => {
      console.log('🔄 Generating order number...');
      try {
        const response = await axios.get('/orders/latest-number', { withCredentials: true });
        const lastNumber = response.data.lastNumber || 0;
        const newNumber = lastNumber + 1;
        const newOrderNumber = `P${newNumber}`;
        setOrderNumber(newOrderNumber);
        console.log('✅ Order number generated from server:', newOrderNumber);
      } catch (error) {
        console.warn('⚠️ Failed to get order number from server, using localStorage:', error.message);
        const lastOrder = localStorage.getItem('lastOrderNumber');
        const lastNumber = lastOrder ? parseInt(lastOrder) : 0;
        const newNumber = lastNumber + 1;
        const newOrderNumber = `P${newNumber}`;
        setOrderNumber(newOrderNumber);
        localStorage.setItem('lastOrderNumber', newNumber.toString());
        console.log('✅ Order number generated from localStorage:', newOrderNumber);
      }
    };
    
    generateOrderNumber();
  }, []);

  // Fetch user's current points on mount
  useEffect(() => {
    const fetchUserPoints = async () => {
      console.log('🔄 Fetching user points...');
      try {
        const response = await axios.get('/points', { withCredentials: true });
        const points = response.data.points || 0;
        console.log('✅ User points fetched from backend:', points);
        setUserPoints(points);
        localStorage.setItem('userPoints', points.toString());
      } catch (error) {
        console.error('❌ Error fetching user points:', error.message);
        if (error.response) {
          console.error('❌ Response status:', error.response.status);
          console.error('❌ Response data:', error.response.data);
        }
        // Try to get from localStorage as fallback
        const storedPoints = localStorage.getItem('userPoints');
        if (storedPoints) {
          const points = parseInt(storedPoints);
          console.log('📦 User points loaded from localStorage:', points);
          setUserPoints(points);
        } else {
          console.warn('⚠️ No points found in localStorage');
        }
      }
    };
    fetchUserPoints();
  }, []);

  // Calculate points when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      console.log('🔄 Calculating points for cart...');
      const points = calculatePoints(cart, pointsUsed);
      console.log('📊 Points calculated:', {
        pointsEarned: points.pointsEarned,
        pointsDeducted: points.pointsDeducted,
        netPointsChange: points.netPointsChange,
        breakdown: points.pointsBreakdown
      });
      setPointsData(points);
    } else {
      console.warn('⚠️ Cart is empty, skipping points calculation');
    }
  }, [cart, pointsUsed]);

  // Get current date and time
  const currentDate = new Date();
  const orderDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const orderTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate pickup time (order time + 20 minutes)
  const pickupTimeDate = new Date(currentDate.getTime() + 20 * 60000);
  const pickupTime = pickupTimeDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get pickup location display name
  const getLocationName = (locationValue) => {
    const locations = {
      'causewaybay': 'Causeway Bay',
      'hok': 'HOK',
      'hkust': 'HKUST',
      'kowloonbay': 'Kowloon Bay Amoy',
      'tseungkwano': 'Tseung Kwan O',
      'tsimshatsui': 'Tsim Sha Tsui',
      'tsingyi': 'Tsing Yi'
    };
    return locations[locationValue] || locationValue;
  };

  const getItemDetails = (item) => {
    const details = [];
    
    if (item.id === "party-pack") {
      const chulPanNames = item.selectedChulPan?.map((id) => {
        const menuItem = getItemById(id);
        return menuItem ? menuItem.name : id;
      }).join(", ") || "None";
      
      const wingName = item.selectedChickenWing
        ? getItemById(item.selectedChickenWing)?.name || item.selectedChickenWing
        : "None";
      
      details.push(`Chul Pan: ${chulPanNames}`);
      details.push(`Chicken Wing: ${wingName}`);
      details.push("Original Dduk Bok Gi, Jap Chae, Dumplings, Rice");
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

  // Handle back to orders navigation
  const handleBackToOrders = () => {
    navigate('/orders');
  };

  // If no cart data, redirect to cart
  if (!cart.length) {
    console.warn('⚠️ Cart is empty, showing empty state');
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <p>No items to checkout</p>
          <button onClick={() => navigate('/cart')} className="checkout-back-btn">
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Order Summary</h2>
      
      {/* Order Information */}
      <div className="checkout-section">
        <h3>Order Information</h3>
        <div className="order-info-grid">
          <div className="order-info-item">
            <span className="label">Order Number:</span>
            <span className="value">{orderNumber}</span>
          </div>
          <div className="order-info-item">
            <span className="label">Date:</span>
            <span className="value">{orderDate}</span>
          </div>
          <div className="order-info-item">
            <span className="label">Order Time:</span>
            <span className="value">{orderTime}</span>
          </div>
          <div className="order-info-item">
            <span className="label">Pickup Time:</span>
            <span className="value">{pickupTime}</span>
          </div>
          <div className="order-info-item">
            <span className="label">Pickup Location:</span>
            <span className="value">{getLocationName(pickupLocation)}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="checkout-section">
        <h3>Order Items</h3>
        <div className="order-items-list">
          {cart.map((item, index) => (
            <div key={`${item.id}-${index}`} className="order-item">
              <div className="order-item-header">
                <div className="order-item-name">
                  {item.name}
                  {item.spicy && item.id !== "party-pack" && " 🌶️"}
                </div>
                <div className="order-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              <div className="order-item-quantity">
                Quantity: {item.quantity}
              </div>
              {getItemDetails(item).map((detail, i) => (
                <div key={i} className="order-item-detail">
                  • {detail}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Points Summary */}
      {pointsData && (
        <div className="checkout-section points-section">
          <h3>Points Summary</h3>
          <div className="points-summary">
            {pointsUsed > 0 && (
              <div className="points-row deduction">
                <span>Points Used:</span>
                <span className="points-value negative">
                  -{formatPoints(pointsUsed)}
                </span>
              </div>
            )}
            
            <div className="points-row earning">
              <span>Points Earned:</span>
              <span className="points-value positive">
                +{formatPoints(pointsData.pointsEarned)}
              </span>
            </div>
            
            <div className="points-row net">
              <span>Net Points Change:</span>
              <span className={`points-value ${pointsData.netPointsChange >= 0 ? 'positive' : 'negative'}`}>
                {pointsData.netPointsChange >= 0 ? '+' : ''}{formatPoints(pointsData.netPointsChange)}
              </span>
            </div>
            
            {/* Show current points balance */}
            <div className="points-row balance">
              <span>Your Current Points:</span>
              <span className="points-value">{formatPoints(userPoints)}</span>
            </div>
            
            {/* Optional: Show breakdown */}
            <details className="points-breakdown">
              <summary>View Points Breakdown</summary>
              {pointsData.pointsBreakdown.map((breakdown, index) => (
                <div key={index} className="breakdown-item">
                  <span>{breakdown.reason}</span>
                  <span>{breakdown.quantity} × {breakdown.pointsPerItem} pts = {breakdown.totalPoints} pts</span>
                </div>
              ))}
            </details>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="checkout-section">
        <h3>Payment Summary</h3>
        <div className="payment-summary">
          <div className="payment-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {pointsUsed > 0 && (
            <>
              <div className="payment-row">
                <span>Points Used:</span>
                <span>{pointsUsed} points</span>
              </div>
              <div className="payment-row discount">
                <span>Points Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            </>
          )}
          
          <div className="payment-row total">
            <span>Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Only Back to Orders */}
      <div className="checkout-actions">
        <button 
          onClick={handleBackToOrders} 
          className="checkout-back-btn"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
}