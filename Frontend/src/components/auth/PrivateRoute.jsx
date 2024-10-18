import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Snackbar from '../utils/Snackbar';

const PrivateRoute = ({ children }) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [redirect, setRedirect] = useState(false); // New state for redirect
  const token = localStorage.getItem('accessToken');

  // Check if token is absent and show the Snackbar
  useEffect(() => {
    if (!token) {
      setShowSnackbar(true);
      // Set a timeout to redirect after showing the Snackbar
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 2000);

      // Clear the timeout if the component unmounts or if the token changes
      return () => clearTimeout(timer);
    }
  }, [token]);

  // Redirect to login page if token is not present
  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {token ? (
        children
      ) : (
        // Prevent rendering the children if the token is absent and waiting to redirect
        null
      )}
      
      <Snackbar
        message="Please login to access this page"
        show={showSnackbar}
        onClose={() => {
          setShowSnackbar(false);
          setRedirect(true); // Optional: you could redirect immediately if snackbar is closed
        }}
        type="error"
      />
    </>
  );
};

export default PrivateRoute;
