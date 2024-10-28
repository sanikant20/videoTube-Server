import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import URL from '../../ApiConfig';

const UpdateAvatar = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newAvatar, setNewAvatar] = useState(null);

    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/profile');
    };

    const handleUpdateAvatar = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!newAvatar) {
            setError('Please select an avatar to upload.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('avatar', newAvatar);

        try {
            const response = await axios.patch(`${URL}/users/update-avatar-image`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log("Avatar updated successfully", response.data);
                navigate('/profile');
            } else {
                console.log("Failed to update avatar", response.data.message);
                setError(response.data.message || 'Failed to update avatar. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update avatar. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAvatar(file);
        }
    };

    return (
        <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
            <div className="container d-flex justify-content-center align-items-center">
                <Card className={`p-4 shadow-lg ${theme === 'light' ? 'text-dark bg-light' : 'text-white bg-dark'}`} style={{ width: '500px' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Update Avatar</h2>
                        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                        
                        <Form onSubmit={handleUpdateAvatar}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <i className="fas fa-camera me-2"></i>
                                    Choose a new avatar
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    id="formAvatar"
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                />
                            </Form.Group>

                            <div className="d-flex flex-column flex-md-row justify-content-between mt-4 me-md-3 mx-2">
                                <Button variant="secondary" type="button" className="mb-2 mb-md-0" onClick={handleCancel} disabled={loading}>
                                    <i className="fas fa-ban me-2"></i>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin me-2"></i> Updating...
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="fas fa-upload me-2"></i> Update
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

export default UpdateAvatar;
