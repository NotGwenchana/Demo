import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/Profile.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;

const Profile = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    membershipID: '',
    memberPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const navigate = useNavigate();
  
  // Form states
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    checkAuthenticationAndLoadProfile();
    
    // Listen for points updates from other components (like Checkout)
    const handlePointsUpdate = (event) => {
      console.log('Points update event received:', event.detail);
      if (event.detail && event.detail.points !== undefined) {
        setUserData(prev => ({ 
          ...prev, 
          memberPoints: event.detail.points 
        }));
        localStorage.setItem('userPoints', event.detail.points.toString());
      } else {
        // If no detail, refresh from server
        fetchUserData();
      }
    };
    
    const handleOrderCompleted = () => {
      // Refresh points after order completion
      setTimeout(() => {
        fetchUserData();
      }, 500);
    };
    
    // Add event listeners
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    window.addEventListener('orderCompleted', handleOrderCompleted);
    
    // Cleanup
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
      window.removeEventListener('orderCompleted', handleOrderCompleted);
    };
  }, []);

  // Refresh points when component gets focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchUserData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated]);

  // Check localStorage for updated points on mount
  useEffect(() => {
    const storedPoints = localStorage.getItem('userPoints');
    if (storedPoints) {
      const parsedPoints = parseInt(storedPoints);
      if (userData.memberPoints !== parsedPoints) {
        setUserData(prev => ({ ...prev, memberPoints: parsedPoints }));
      }
    }
  }, []);

  const checkAuthenticationAndLoadProfile = async () => {
    try {
      await fetchUserData();
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Authentication check failed:', err);
      setIsAuthenticated(false);
      setError('Please sign in to view your profile');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/profile');
      
      const newUserData = {
        username: response.data.username || '',
        email: response.data.email || '',
        phoneNumber: response.data.phone || '',
        membershipID: response.data.membershipID || '',
        memberPoints: response.data.memberPoints || 0
      };
      
      setUserData(newUserData);
      
      // Update localStorage
      localStorage.setItem('userPoints', (response.data.memberPoints || 0).toString());
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('pointsUpdated', { 
        detail: { points: response.data.memberPoints || 0 }
      }));
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="profile-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render profile if not authenticated (will redirect in useEffect)
  if (isAuthenticated === false) {
    return (
      <div className="profile-loading">
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  const handleChangePhone = async (e) => {
    e.preventDefault();
    
    if (!newPhoneNumber) {
      setFormError('Please enter a phone number');
      return;
    }
    
    if (newPhoneNumber === userData.phoneNumber) {
      setFormError('New phone number is same as current');
      return;
    }
    
    try {
      setLoading(true);
      setFormError('');
      
      await axios.put('/profile/update-phone', 
        { phone: newPhoneNumber },
        { withCredentials: true }
      );
      
      setUserData(prev => ({ ...prev, phoneNumber: newPhoneNumber }));
      setSuccessMessage('Phone number updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowPhoneForm(false);
      setNewPhoneNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update phone number');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setFormError('Please enter current password');
      return;
    }
    
    if (!newPassword) {
      setFormError('Please enter new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match with confirm password');
      return;
    }
    
    if (currentPassword === newPassword) {
      setFormError('New password is same as current');
      return;
    }
    
    try {
      setLoading(true);
      setFormError('');
      
      await axios.put('/profile/update-password',
        { 
          currentPassword: currentPassword,
          newPassword: newPassword 
        },
        { withCredentials: true }
      );
      
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== userData.username) {
      toast.error(`Please type "${userData.username}" to confirm deletion`);
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete('/account', { withCredentials: true });
      
      toast.success('Account deleted successfully');
      
      localStorage.removeItem('cart');
      localStorage.removeItem('userPoints');
      
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('cartUpdated'));
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error(err.response?.data?.error || 'Failed to delete account');
      setShowDeleteConfirm(false);
      setDeleteConfirmationText('');
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      await axios.post('/signout', {}, { withCredentials: true });
      localStorage.removeItem('userPoints');
      window.location.href = '/signin';
    } catch (err) {
      console.error('Signout error:', err);
    }
  };

  const cancelPhoneForm = () => {
    setShowPhoneForm(false);
    setNewPhoneNumber('');
    setFormError('');
  };

  const cancelPasswordForm = () => {
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFormError('');
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmationText('');
  };

  const preventSpace = (event) => {
    if (event.key === ' ') {
      event.preventDefault();
    }
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

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      
      {successMessage && (
        <div className="profile-success-message">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="profile-error-message">
          {error}
        </div>
      )}

      <div className="profile-info-group">
        <p className="profile-info">
          <strong>Username:</strong> {userData.username}
        </p>
      </div>

      <div className="profile-info-group">
        <p className="profile-info">
          <strong>MemberID:</strong> {userData.membershipID || 'N/A'}
        </p>
      </div>

      <div className="profile-info-group">
        <p className="profile-info">
          <strong>Member Points:</strong> {userData.memberPoints || 'N/A'}
        </p>
      </div>
      
      <div className="profile-info-group">
        <p className="profile-info">
          <strong>Email:</strong> {userData.email}
        </p>
      </div>
      
      <div className="profile-info-group">
        <p className="profile-info">
          <strong>Phone number:</strong> {userData.phoneNumber || 'Not set'}
          <button 
            onClick={() => setShowPhoneForm(!showPhoneForm)}
            className="profile-button profile-button-change"
            disabled={loading}
          >
            Change
          </button>
        </p>
        
        {showPhoneForm && (
          <form onSubmit={handleChangePhone} className="profile-form">
            <div className="form-group">
              <label htmlFor="phoneNumber">Enter New Phone Number:</label>
              <input
                type="tel"
                maxLength="8"
                id="phoneNumber"
                inputmode="numeric"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                placeholder="Enter new phone number"
                className="form-input"
                autoFocus
              />
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-actions">
              <button type="submit" className="form-btn save-btn" disabled={loading}>
                Save Changes
              </button>
              <button type="button" onClick={cancelPhoneForm} className="form-btn cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="profile-info-group">
        <p className="profile-info">
          <strong>Password:</strong> ••••••••
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="profile-button profile-button-change"
            disabled={loading}
          >
            Change
          </button>
        </p>
        
        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onKeyDown={preventSpace}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="form-input"
              />
            </div>
            
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="form-actions">
              <button type="submit" className="form-btn save-btn" disabled={loading}>
                Update Password
              </button>
              <button type="button" onClick={cancelPasswordForm} className="form-btn cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Delete Account Section */}
      <div className="profile-info-group delete-account-section">
        <p className="profile-info">
          <strong>Delete Account:</strong> 
          <span className="delete-warning">⚠️ This action cannot be undone</span>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="profile-button profile-button-delete"
            disabled={loading}
          >
            Delete Account
          </button>
        </p>
        
        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
              <h3>Delete Account</h3>
              <p>Are you sure you want to permanently delete your account?</p>
              <p>This will:</p>
              <ul>
                <li>Remove all your personal information</li>
                <li>Delete your order history</li>
                <li>Clear your saved cart items</li>
                <li>This action cannot be undone</li>
              </ul>
              <div className="form-group">
                <label>Type <strong>{userData.username}</strong> to confirm:</label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={`Type "${userData.username}"`}
                  className="form-input"
                  autoFocus
                />
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-actions">
                <button 
                  onClick={handleDeleteAccount}
                  className="form-btn delete-btn"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button 
                  type="button" 
                  onClick={cancelDeleteAccount} 
                  className="form-btn cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="profile-actions">
        <button 
          onClick={handleSignout}
          className="profile-button profile-button-signout"
        >
          Sign Out
        </button>

        <button onClick={() => navigate('/')} className="profile-button profile-button-home">
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Profile;