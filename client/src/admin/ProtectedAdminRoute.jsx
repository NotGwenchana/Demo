import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export function ProtectedAdminRoute({ children }) {

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get('/verify-admin', {
          withCredentials: true,
        });
        setIsAdmin(Boolean(response.data?.isAdmin));
      } catch {
        setIsAdmin(false);
      } finally {

        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/signin" />;
}