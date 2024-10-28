import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import URL from '../../ApiConfig';
import axios from 'axios';

const ChangePassword = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/profile');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        try {
            const response = await axios.post(`${URL}/users/update-password`, {
                oldPassword,
                newPassword,
                confirmPassword
            }, {
                withCredentials: true,
            });
            console.log(response.data);

            // Check for a successful response
            if (response.status === 200) {
                navigate('/profile');
            } else {
                setErrorMessage(response.data?.message || 'Failed to update password.');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message );
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
            <div className="container d-flex justify-content-center align-items-center">
                <Card className={`p-4 shadow-lg ${theme === 'light' ? 'text-dark bg-light' : 'text-white bg-dark'}`} style={{ width: '500px' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Change Password</h2>
                        {errorMessage && (
                            <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible >
                                {errorMessage}
                            </Alert>
                        )}
                        <Form onSubmit={handleChangePassword}>
                            <Form.Group className="mb-3" controlId="formOldPassword">
                                <Form.Label>
                                    <i className="fas fa-key me-2"></i>
                                    Old Password
                                </Form.Label>
                                <InputGroup className="mb-3">
                                    <Form.Control
                                        type={showOldPassword ? 'text' : 'password'}
                                        placeholder="Enter old password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formNewPassword">
                                <Form.Label>
                                    <i className="fas fa-key me-2"></i>
                                    New Password
                                </Form.Label>
                                <InputGroup className="mb-3">
                                    <Form.Control
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formConfirmPassword">
                                <Form.Label>
                                    <i className="fas fa-key me-2"></i>
                                    Confirm Password
                                </Form.Label>
                                <InputGroup className="mb-3">
                                    <Form.Control
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <div className="d-flex flex-column flex-md-row justify-content-between">
                                <Button variant="secondary" className="mb-2 mb-md-0" onClick={handleCancel}>
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-pulse me-2"></i>
                                            Updating...
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="fas fa-save me-2"></i>
                                            Update
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

export default ChangePassword;
