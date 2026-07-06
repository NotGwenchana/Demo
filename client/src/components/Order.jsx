import "../Css/Order.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { menuData, getItemById } from "../menu/menuData";
import { toast } from "react-hot-toast";
import { 
  isHungryNightActive, 
  getDiscountedPrice, 
  getHungryNightInfo 
} from "../utils/hungryNight";
import { 
  isTeaSetHourActive, 
  getTeaSetHourPrice, 
  getTeaSetHourInfo,
  isExcludedFromTeaSetDiscount
} from "../utils/teaSetHour";

function Order() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedChulPan, setSelectedChulPan] = useState([]);
  const [selectedChickenWing, setSelectedChickenWing] = useState(null);
  const [sizeStates, setSizeStates] = useState({});
  const [user, setUser] = useState(null);
  const [isHungryNight, setIsHungryNight] = useState(false);
  const [isTeaSetHour, setIsTeaSetHour] = useState(false);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await axios.get("/profile", { withCredentials: true });
      if (response.data && response.data.username) {
        setIsAuthenticated(true);
        setUser(response.data);
        return true;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
    return false;
  };

  // Get current cart from server
  const getCurrentCart = async () => {
    try {
      const response = await axios.get("/cart", { withCredentials: true });
      console.log("Current cart from server:", response.data);
      return response.data.cart || [];
    } catch (error) {
      console.error("Error getting cart:", error);
      return [];
    }
  };

  // Save cart to server - sends the entire cart array
  const saveCartToServer = async (cart) => {
    try {
      console.log("Sending cart to server:", cart);
      const response = await axios.post("/cart", { cart }, { withCredentials: true });
      console.log("Server response:", response.data);
      // Dispatch event to update navbar
      window.dispatchEvent(new Event("cartUpdated"));
      return true;
    } catch (error) {
      console.error("Error saving cart:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error("Please sign in to add items to cart");
        navigate("/signin");
      }
      return false;
    }
  };

  const handleChulPanChange = (itemValue) => {
    setSelectedChulPan((prev) => {
      if (prev.includes(itemValue)) {
        return prev.filter((item) => item !== itemValue);
      } else {
        if (prev.length < 2) {
          return [...prev, itemValue];
        }
        toast.error("You can only select up to 2 Chul Pan items");
        return prev;
      }
    });
  };

  const handleChickenWingChange = (itemValue) => {
    if (selectedChickenWing === itemValue) {
      setSelectedChickenWing(null);
    } else {
      setSelectedChickenWing(itemValue);
    }
  };

  // Get the final price for an item considering both promotions
  const getFinalPrice = (item, size = null, variation = null) => {
    let originalPrice = item.price;
    let category = item.category || "Unknown";
    let itemId = item.id;
    
    // Handle items with sizes
    if (size && item.sizes) {
      originalPrice = item.sizes[size];
    }
    
    // Handle Gim Bap variations
    if (variation) {
      // Variations use the variation price
      originalPrice = item.price;
    }
    
    let finalPrice = originalPrice;
    let discountType = null;
    
    // Check Tea Set Hour first (it has specific rules)
    if (isTeaSetHour) {
      const teaSetPrice = getTeaSetHourPrice(originalPrice, itemId, category, true, size);
      if (teaSetPrice !== originalPrice) {
        finalPrice = teaSetPrice;
        discountType = 'teaSetHour';
      }
    }
    
    // Check Hungry Night (30% off) - but don't apply if Tea Set Hour is active and already discounted
    if (isHungryNight && discountType !== 'teaSetHour') {
      const hungryNightPrice = Math.round(originalPrice * 0.7);
      if (hungryNightPrice !== originalPrice) {
        finalPrice = hungryNightPrice;
        discountType = 'hungryNight';
      }
    }
    
    return { finalPrice, originalPrice, discountType };
  };

  const addToCart = async (item, size = null, variation = null) => {
    // Check if user is authenticated
    const isAuth = await checkAuth();
    
    if (!isAuth) {
      toast.error("Please sign in to add items to cart", {
        duration: 3000,
        position: "top-center",
      });
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
      return;
    }

    // For items with size, check if size is selected
    if (item.hasSize && !size) {
      toast.error(`Please select a size for ${item.name}`);
      return;
    }

    let itemName = item.name;
    let originalPrice = item.price;

    // Handle items with sizes
    if (size && item.sizes) {
      originalPrice = item.sizes[size];
      itemName = `${item.name} (${size.charAt(0).toUpperCase() + size.slice(1)})`;
    }

    // Handle Gim Bap variations
    if (variation) {
      itemName = `${item.name} - ${variation}`;
    }

    // Get final price with promotions
    const { finalPrice, discountType } = getFinalPrice(item, size, variation);

    const cartItem = {
      id: item.id,
      name: itemName,
      price: finalPrice,
      quantity: 1,
      category: item.category || "Unknown",
      spicy: item.spicy || false,
      ...(size && { size, originalPrice: originalPrice }),
      ...(variation && { variation }),
    };

    // Add discount information
    if (discountType === 'hungryNight') {
      cartItem.hungryNightDiscount = true;
      cartItem.originalPrice = originalPrice;
      cartItem.discountPercentage = 30;
    } else if (discountType === 'teaSetHour') {
      cartItem.teaSetHourDiscount = true;
      cartItem.originalPrice = originalPrice;
    }

    console.log("Adding item to cart:", cartItem);

    // Get current cart, add new item, and save back
    const currentCart = await getCurrentCart();
    console.log("Current cart before adding:", currentCart);
    
    const existingItemIndex = currentCart.findIndex(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.size === size &&
        cartItem.variation === variation
    );

    let updatedCart;
    if (existingItemIndex !== -1) {
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += 1;
    } else {
      updatedCart = [...currentCart, cartItem];
    }

    console.log("Updated cart to save:", updatedCart);
    
    const success = await saveCartToServer(updatedCart);
    if (success) {
      let discountMessage = "";
      if (discountType === 'hungryNight') {
        discountMessage = " (30% Hungry Night discount applied!)";
      } else if (discountType === 'teaSetHour') {
        discountMessage = " (Tea Set Hour discount applied!)";
      }
      toast.success(`${itemName} added to cart!${discountMessage}`);
    } else {
      toast.error("Failed to add item to cart");
    }
  };

  const addPartyPackToCart = async () => {
    // Check if user is authenticated
    const isAuth = await checkAuth();
    
    if (!isAuth) {
      toast.error("Please sign in to add items to cart", {
        duration: 3000,
        position: "top-center",
      });
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
      return;
    }

    if (selectedChulPan.length !== 2) {
      toast.error("Please select exactly 2 Chul Pan items");
      return;
    }
    if (!selectedChickenWing) {
      toast.error("Please select 1 Chicken Wing item");
      return;
    }

    const originalPartyPrice = menuData.partyPack.price;
    let finalPartyPrice = originalPartyPrice;
    let discountType = null;

    // Check Tea Set Hour for Party Pack
    if (isTeaSetHour) {
      const teaSetPrice = getTeaSetHourPrice(originalPartyPrice, menuData.partyPack.id, "Party Pack", true);
      if (teaSetPrice !== originalPartyPrice) {
        finalPartyPrice = teaSetPrice;
        discountType = 'teaSetHour';
      }
    }

    // Check Hungry Night for Party Pack
    if (isHungryNight && discountType !== 'teaSetHour') {
      const hungryNightPrice = Math.round(originalPartyPrice * 0.7);
      if (hungryNightPrice !== originalPartyPrice) {
        finalPartyPrice = hungryNightPrice;
        discountType = 'hungryNight';
      }
    }

    const partyPackItem = {
      id: menuData.partyPack.id,
      name: menuData.partyPack.name,
      price: finalPartyPrice,
      quantity: 1,
      selectedChulPan: selectedChulPan,
      selectedChickenWing: selectedChickenWing,
      category: "Party Pack",
    };

    // Add discount information
    if (discountType === 'hungryNight') {
      partyPackItem.hungryNightDiscount = true;
      partyPackItem.originalPrice = originalPartyPrice;
      partyPackItem.discountPercentage = 30;
    } else if (discountType === 'teaSetHour') {
      partyPackItem.teaSetHourDiscount = true;
      partyPackItem.originalPrice = originalPartyPrice;
    }

    console.log("Adding party pack:", partyPackItem);

    const currentCart = await getCurrentCart();
    const updatedCart = [...currentCart, partyPackItem];
    
    const success = await saveCartToServer(updatedCart);
    if (success) {
      let discountMessage = "";
      if (discountType === 'hungryNight') {
        discountMessage = " (30% Hungry Night discount applied!)";
      } else if (discountType === 'teaSetHour') {
        discountMessage = " (Tea Set Hour discount applied!)";
      }
      toast.success(`Party Pack added to cart!${discountMessage}`);
      setSelectedChulPan([]);
      setSelectedChickenWing(null);
    } else {
      toast.error("Failed to add party pack to cart");
    }
  };

  // Check auth and promotions on component mount and every minute
  useEffect(() => {
    checkAuth();
    
    // Initial checks
    setIsHungryNight(isHungryNightActive());
    setIsTeaSetHour(isTeaSetHourActive());
    
    // Check every minute for promotion changes
    const interval = setInterval(() => {
      const newHungryNightStatus = isHungryNightActive();
      const newTeaSetHourStatus = isTeaSetHourActive();
      
      // Check Hungry Night changes
      if (newHungryNightStatus !== isHungryNight) {
        setIsHungryNight(newHungryNightStatus);
        if (newHungryNightStatus) {
          toast.success("🌙 Hungry Night started! 30% off all items!", {
            duration: 5000,
            position: "top-center",
          });
        } else {
          toast.info("Hungry Night has ended. Regular prices apply.", {
            duration: 3000,
            position: "top-center",
          });
        }
      }
      
      // Check Tea Set Hour changes
      if (newTeaSetHourStatus !== isTeaSetHour) {
        setIsTeaSetHour(newTeaSetHourStatus);
        if (newTeaSetHourStatus) {
          toast.success("🍵 Tea Set Hour started! Special prices on drinks and more!", {
            duration: 5000,
            position: "top-center",
          });
        } else {
          toast.info("Tea Set Hour has ended. Regular prices apply.", {
            duration: 3000,
            position: "top-center",
          });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isHungryNight, isTeaSetHour]);

  const renderMenuItem = (item) => {
    const { finalPrice, originalPrice, discountType } = getFinalPrice(item);
    const hasDiscount = finalPrice !== originalPrice;
    const isTeaSetDiscount = discountType === 'teaSetHour';
    const isHungryNightDiscount = discountType === 'hungryNight';
    const isExcluded = isTeaSetHour && isExcludedFromTeaSetDiscount(item.id);
    
    return (
      <li key={item.id}>
        {item.image && <img src={item.image} alt={item.name} />}
        <div>
          <span>
            {item.name} {item.spicy && "🌶️"} — 
            {hasDiscount ? (
              <>
                <span className="original-price">${originalPrice}</span>
                <span className="discounted-price"> ${finalPrice}</span>
                {isHungryNightDiscount && <span className="discount-badge hungry-night">30% OFF</span>}
                {isTeaSetDiscount && <span className="discount-badge tea-set">TEA SET</span>}
                {isExcluded && <span className="excluded-badge">Regular Price</span>}
              </>
            ) : (
              <span> ${finalPrice}</span>
            )}
          </span>
          <button onClick={() => addToCart(item)}>+</button>
        </div>
      </li>
    );
  };

  const renderGimBapItem = (variation) => {
    // For Gim Bap variations, we need to handle them differently
    const originalPrice = variation.price;
    let finalPrice = originalPrice;
    let discountType = null;
    
    // Check Tea Set Hour for Gim Bap
    if (isTeaSetHour) {
      const teaSetPrice = getTeaSetHourPrice(originalPrice, variation.id, "Gim Bap", true);
      if (teaSetPrice !== originalPrice) {
        finalPrice = teaSetPrice;
        discountType = 'teaSetHour';
      }
    }
    
    // Check Hungry Night for Gim Bap
    if (isHungryNight && discountType !== 'teaSetHour') {
      const hungryNightPrice = Math.round(originalPrice * 0.7);
      if (hungryNightPrice !== originalPrice) {
        finalPrice = hungryNightPrice;
        discountType = 'hungryNight';
      }
    }
    
    const hasDiscount = finalPrice !== originalPrice;
    const isTeaSetDiscount = discountType === 'teaSetHour';
    const isHungryNightDiscount = discountType === 'hungryNight';
    
    return (
      <li key={variation.id}>
        <div>
          <span>
            {variation.name} {variation.spicy && "🌶️"} — 
            {hasDiscount ? (
              <>
                <span className="original-price">${originalPrice}</span>
                <span className="discounted-price"> ${finalPrice}</span>
                {isHungryNightDiscount && <span className="discount-badge hungry-night">30% OFF</span>}
                {isTeaSetDiscount && <span className="discount-badge tea-set">TEA SET</span>}
              </>
            ) : (
              <span> ${finalPrice}</span>
            )}
          </span>
          <button
            onClick={() =>
              addToCart(
                {
                  id: variation.id,
                  name: "Gim Bap",
                  price: variation.price,
                  category: "Gim Bap",
                  spicy: variation.spicy,
                },
                null,
                variation.name,
              )
            }
          >
            +
          </button>
        </div>
      </li>
    );
  };

  const renderItemWithSize = (item) => {
    const selectedSize = sizeStates[item.id] || "";
    
    return (
      <li key={item.id}>
        {item.image && <img src={item.image} alt={item.name} />}
        <div>
          <label>{item.name}</label>
          <select 
            className="select-size" 
            value={selectedSize}
            onChange={(e) => {
              setSizeStates(prev => ({
                ...prev,
                [item.id]: e.target.value
              }));
            }}
          >
            <option value="">Select size</option>
            {Object.keys(item.sizes).map((size) => {
              const originalPrice = item.sizes[size];
              const { finalPrice, discountType } = getFinalPrice(item, size);
              const hasDiscount = finalPrice !== originalPrice;
              const isExcluded = isTeaSetHour && isExcludedFromTeaSetDiscount(item.id, size);
              
              return (
                <option key={size} value={size}>
                  {size.charAt(0).toUpperCase() + size.slice(1)} - 
                  {hasDiscount ? (
                    <> ${finalPrice} (was ${originalPrice})</>
                  ) : isExcluded ? (
                    <> ${originalPrice} (Regular Price)</>
                  ) : (
                    <> ${originalPrice}</>
                  )}
                </option>
              );
            })}
          </select>
          <button onClick={() => addToCart(item, selectedSize)}>
            +
          </button>
        </div>
      </li>
    );
  };

  return (
    <div style={{ marginBottom: "100px" }}>
      {/* Hungry Night Banner */}
      {isHungryNight && (
        <div className="promotion-banner hungry-night-banner">
          🌙 HUNGRY NIGHT! 30% OFF ALL ITEMS! 🌙
          <br />
          <small>
            Valid until {getHungryNightInfo().endTime}
          </small>
        </div>
      )}

      {/* Tea Set Hour Banner */}
      {isTeaSetHour && (
        <div className="promotion-banner tea-set-banner">
          🍵 TEA SET HOUR! SPECIAL PRICES! 🍵
          <br />
          <small>
            Drinks only ${getTeaSetHourInfo().drinkPrice} | All other items ${getTeaSetHourInfo().discountAmount} off
            <br />
            *Excludes: {getTeaSetHourInfo().excludedItems.join(', ')}
            <br />
            Valid until {getTeaSetHourInfo().endTime}
          </small>
        </div>
      )}

      {/* Chul Pan Section */}
      <h1>Chul Pan</h1>
      <ul>{menuData.chulPan.map((item) => renderMenuItem(item))}</ul>

      {/* Bi Bim Bap Section */}
      <h1>Bi Bim Bap</h1>
      <ul>{menuData.biBimBap.map((item) => renderMenuItem(item))}</ul>

      {/* Soups Section */}
      <h1>Soups</h1>
      <ul>{menuData.soups.map((item) => renderMenuItem(item))}</ul>

      {/* Noodles Section */}
      <h1>Noodles</h1>
      <ul>{menuData.noodles.map((item) => renderMenuItem(item))}</ul>

      {/* Gim Bap Section */}
      <h1>Gim Bap</h1>
      <ul>
        <div className="centered-image">
          <img src={menuData.gimBap.image} alt="Gim Bap" />
        </div>
        {menuData.gimBap.variations.map((variation) =>
          renderGimBapItem(variation),
        )}
      </ul>

      {/* Dduk Bok Gi Section */}
      <h1>Dduk Bok Gi</h1>
      <ul>{menuData.ddukBokGi.map((item) => renderMenuItem(item))}</ul>

      {/* Chicken Wings Section */}
      <h1>Chicken Wings</h1>
      <ul>{menuData.chickenWings.map((item) => renderMenuItem(item))}</ul>

      {/* Snacks Section */}
      <h1>Snacks</h1>
      <ul>
        {menuData.snacks.map((item) => {
          if (item.hasSize) {
            return renderItemWithSize(item);
          }
          return renderMenuItem(item);
        })}
      </ul>

      {/* Drinks Section */}
      <h1>Drinks</h1>
      <ul>
        {menuData.drinks.map((item) => {
          const { finalPrice, originalPrice, discountType } = getFinalPrice(item);
          const hasDiscount = finalPrice !== originalPrice;
          const isTeaSetDiscount = discountType === 'teaSetHour';
          
          return (
            <li key={item.id}>
              <div>
                <span>
                  {item.name} — 
                  {hasDiscount ? (
                    <>
                      <span className="original-price">${originalPrice}</span>
                      <span className="discounted-price"> ${finalPrice}</span>
                      {isTeaSetDiscount && <span className="discount-badge tea-set">TEA SET</span>}
                    </>
                  ) : (
                    <span> ${finalPrice}</span>
                  )}
                </span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Party Pack Section */}
      <h1>
        Party Pack - 
        {(() => {
          const { finalPrice, originalPrice, discountType } = getFinalPrice(menuData.partyPack);
          const hasDiscount = finalPrice !== originalPrice;
          const isTeaSetDiscount = discountType === 'teaSetHour';
          const isHungryNightDiscount = discountType === 'hungryNight';
          
          return hasDiscount ? (
            <>
              <span className="original-price">${originalPrice}</span>
              <span className="discounted-price"> ${finalPrice}</span>
              {isHungryNightDiscount && <span className="discount-badge hungry-night">30% OFF</span>}
              {isTeaSetDiscount && <span className="discount-badge tea-set">TEA SET</span>}
            </>
          ) : (
            <span> ${originalPrice}</span>
          );
        })()}
      </h1>
      <ul>
        <div className="centered-image">
          <img src={menuData.partyPack.image} alt="Party Pack" />
        </div>
        <li className="party-pack-item">
          <div className="selection-text">
            Chul Pan Gu E <br />
            (select up to 2 items)
          </div>
          <div className="checkbox-group">
            {menuData.partyPack.includes.chulPan.options.map((optionId) => {
              const item = getItemById(optionId);
              return (
                item && (
                  <div key={optionId}>
                    <input
                      type="checkbox"
                      id={optionId}
                      name="chulPan"
                      value={optionId}
                      checked={selectedChulPan.includes(optionId)}
                      onChange={() => handleChulPanChange(optionId)}
                    />
                    <label htmlFor={optionId}>
                      {item.name} {item.spicy && "🌶️"}
                    </label>
                  </div>
                )
              );
            })}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            Selected: {selectedChulPan.length}/2
          </div>
        </li>
        <li className="party-pack-item">
          <div className="selection-text">
            Chicken Wing <br />
            (select 1 item)
          </div>
          <div className="checkbox-group">
            {menuData.partyPack.includes.chickenWing.options.map((optionId) => {
              const item = getItemById(optionId);
              return (
                item && (
                  <div key={optionId}>
                    <input
                      type="checkbox"
                      id={optionId}
                      name="chickenWing"
                      value={optionId}
                      checked={selectedChickenWing === optionId}
                      onChange={() => handleChickenWingChange(optionId)}
                    />
                    <label htmlFor={optionId}>
                      {item.name} {item.spicy && "🌶️"}
                    </label>
                  </div>
                )
              );
            })}
          </div>
        </li>
        {menuData.partyPack.includes.fixedItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
        <li>
          <button onClick={addPartyPackToCart}>
            Add Party Pack to Cart
          </button>
        </li>
      </ul>

      {/* Chef Special Section */}
      <h1>Chef Special</h1>
      <ul>{menuData.chefSpecial.map((item) => renderMenuItem(item))}</ul>
    </div>
  );
}

export default Order;