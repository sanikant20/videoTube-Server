import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import URL from '../../ApiConfig';

const UpdateProfileData = () => {
    const [user, setUser] = useState(null);
    const [fullName, setFullName] = useState('');
    const [userName, setUserName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        // Parse user data from local storage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setFullName(storedUser.fullName);
            setUserName(storedUser.userName);
        }
    }, []);

    const handleCancel = () => {
        navigate('/profile');
    };

    const handleUpdateProfileData = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.patch(`${URL}/users/update-account-details`, {
                fullName,
                userName
            }, {
                withCredentials: true,
            });

            if (response.status === 200) {
                // Update user data in local storage
                localStorage.setItem('user', JSON.stringify(response.data.data));
                navigate('/profile');
            } else {
                setError(response.data.message || 'Failed to update profile data.');
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Failed to update profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
            <div className="container d-flex justify-content-center align-items-center">
                <Card className={`p-4 shadow-lg ${theme === 'light' ? 'text-dark bg-light' : 'text-white bg-dark'}`} style={{ width: '500px' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Update User Data</h2>
                        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                        
                        <Form onSubmit={handleUpdateProfileData}>
                            <Form.Group className="mb-3" controlId="formFullName">
                                <Form.Label>
                                    <i className="fas fa-user me-2"></i>
                                    Full Name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter full name"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formUserName">
                                <Form.Label>
                                    <i className="fas fa-user me-2"></i>
                                    Username
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Enter username"
                                />
                            </Form.Group>

                            <div className="d-flex flex-column flex-md-row justify-content-between">
                                <Button variant="secondary" type="button" className="mb-2 mb-md-0" onClick={handleCancel}>
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin me-2"></i>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="fas fa-save me-2"></i>
                                            Save
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default UpdateProfileData;
