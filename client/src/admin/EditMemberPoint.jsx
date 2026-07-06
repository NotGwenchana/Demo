import React, { useState } from 'react';
import axios from 'axios';
import '../adminCss/EditMemberPoint.css';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

export default function EditMemberPoint() {
  const [memberId, setMemberId] = useState('');
  const [points, setPoints] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const navigate = useNavigate();

  // Validate member ID with backend
  const validateMember = async () => {
    if (!memberId.trim()) {
      setMessage('Please enter a Member ID');
      setMessageType('error');
      return false;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.get(
        `/admin/validate-member?membershipID=${memberId.trim()}`
      );

      const data = response.data;

      if (data.valid) {
        setMemberData(data);
        setMessage(`Member found! Current points: ${data.memberPoints}`);
        setMessageType('success');
        toast.success('Member validated successfully');
        return true;
      } else {
        setMessage('Member not found. Please check the Member ID.');
        setMessageType('error');
        setMemberData(null);
        toast.error('Member not found');
        return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/signin');
      } else {
        setMessage(error.response?.data?.error || error.message || 'Error validating member');
        setMessageType('error');
      }
      setMemberData(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update points via admin endpoint
  const updateMemberPoints = async (pointsEarned, pointsUsed) => {
    if (!memberData) {
      setMessage('Please validate member first');
      setMessageType('error');
      return;
    }

    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setMessage('Please enter a valid positive number');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.patch('/admin/points', {
        membershipID: memberData.membershipID,
        pointsEarned: pointsEarned,
        pointsUsed: pointsUsed,
      });

      const data = response.data;

      setMessage(
        `✅ Points updated successfully!\n` +
        `Old: ${data.oldPoints} → New: ${data.newPoints}\n` +
        `Change: ${data.netChange > 0 ? '+' : ''}${data.netChange}`
      );
      setMessageType('success');
      setMemberData(data);
      setPoints('');
      toast.success('Points updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/signin');
      } else {
        setMessage(error.response?.data?.error || error.message || 'Error updating points');
        setMessageType('error');
        toast.error('Failed to update points');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPoints = () => {
    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setMessage('Please enter a valid positive number');
      setMessageType('error');
      return;
    }
    updateMemberPoints(pointsValue, 0);
  };

  const handleRemovePoints = () => {
    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setMessage('Please enter a valid positive number');
      setMessageType('error');
      return;
    }
    updateMemberPoints(0, pointsValue);
  };

  const handleSave = () => {
    if (memberData) {
      setMessage(`Current points for ${memberData.membershipID}: ${memberData.memberPoints}`);
      setMessageType('success');
      toast.success('Info refreshed');
    } else {
      setMessage('No member data to save. Validate a member first.');
      setMessageType('error');
    }
  };

  const handleMemberIdBlur = () => {
    if (memberId.trim() && !memberData) {
      validateMember();
    }
  };

  return (
    <div className="edit-member-point">
      <h1>Edit Member Points</h1>

      <div className="form-group">
        <label htmlFor="memberId">Member ID</label>
        <div className="input-with-button">
          <input
            id="memberId"
            type="text"
            placeholder="Enter member ID (e.g., 33512345)"
            value={memberId}
            onChange={(e) => {
              setMemberId(e.target.value);
              setMemberData(null);
            }}
            onBlur={handleMemberIdBlur}
            disabled={isLoading}
          />
          <button
            className="btn validate-btn"
            onClick={validateMember}
            disabled={isLoading || !memberId.trim()}
          >
            {isLoading ? 'Checking...' : 'Validate'}
          </button>
        </div>
      </div>

      {memberData && (
        <div className="member-info">
          <p>
            <strong>Member ID:</strong> {memberData.membershipID}
          </p>
          <p>
            <strong>Current Points:</strong> {memberData.memberPoints}
          </p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="points">Points</label>
        <input
          id="points"
          type="number"
          min="1"
          step="1"
          placeholder="Enter points amount"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          disabled={isLoading || !memberData}
        />
      </div>

      <div className="action-buttons">
        <button
          className="btn add-btn"
          onClick={handleAddPoints}
          disabled={isLoading || !memberData || !points}
        >
          {isLoading ? 'Processing...' : 'Add Points'}
        </button>
        <button
          className="btn remove-btn"
          onClick={handleRemovePoints}
          disabled={isLoading || !memberData || !points}
        >
          {isLoading ? 'Processing...' : 'Remove Points'}
        </button>
      </div>

      <button
        className="btn save-btn"
        onClick={handleSave}
        disabled={!memberData}
      >
        Refresh Info
      </button>
      
      <button className="back-btn">
        <Link to="/admin">Back to Admin Dashboard</Link>
      </button>

      {message && (
        <div className={`message ${messageType}`}>
          {message.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}