import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ADhome() {
  const navigate = useNavigate(); 


  const handleLogout = async () => {
    try {
      await axios.post('/signout', {}, { withCredentials: true });
      toast.success('Logged out successfully');
      window.dispatchEvent(new Event('authChange'));
      navigate('/signin');
  } catch {
      toast.error('Logout failed');
    }


  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      <div className="admin-content-grid" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <button 
          onClick={() => navigate('/admin/totalsales')}
          style={{
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Total Sales
        </button>
        <button 
          onClick={() => navigate('/admin/editmemberpoints')}
          style={{
            padding: '15px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Edit Member Points
        </button>
      </div>
    </div>
  );
}