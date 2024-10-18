import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import Snackbar from '../utils/Snackbar';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import URL from '../../ApiConfig';

const Logout = () => {
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            // Call the logout API
            const response = await axios.post(`${URL}/users/logout`, {}, {
                withCredentials: true,
            });

            // Check if the logout was successful
            if (response.status === 200) {
                setShowSnackbar(true); // Show logout success message
                setTimeout(() => {
                    navigate('/login'); // Redirect to login page after a short delay
                }, 2000);
            } else {
                throw new Error('Failed to log out on the server.');
            }
        } catch (error) {
            const errmsg = error.response?.data?.message || 'Something went wrong. Please try again.';
            setErrorMessage(errmsg);
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    return (
        <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
            <div className="container d-flex justify-content-center align-items-center">
                <Card style={{ width: '500px', zIndex: 1 }} className={`text-center p-4 shadow ${theme === 'light' ? 'text-dark bg-light' : 'text-white bg-dark'}`}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Videotube Logout</h2>
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}

                        <div >
                            <h4>Are you sure you want to logout?</h4>
                            <Button
                                variant="danger"
                                type='button'
                                className="w-100 mt-3"
                                onClick={handleLogout}
                                disabled={loading}
                            >
                                <i className="fas fa-sign-out-alt me-2"></i>
                                {
                                    loading
                                        ? 'Logging out...'
                                        : 'Logout'
                                }
                            </Button>
                        </div>

                    </Card.Body>

                    {/* Snackbar for confirmation message */}
                    <Snackbar
                        message="You have been logged out successfully!"
                        show={showSnackbar}
                        onClose={() => setShowSnackbar(false)}
                        type="success"
                    />
                </Card>
            </div>
        </div>
    );
};

export default Logout;
