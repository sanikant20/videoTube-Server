import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import URL from '../../ApiConfig';
import axios from 'axios';

const UpdateCoverImage = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newCoverImage, setNewCoverImage] = useState(null);

    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/profile');
    };

    const handleUpdateCoverImage = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!newCoverImage) {
            setError('Please select a cover image to upload.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('coverImage', newCoverImage);

        try {
            const response = await axios.patch(`${URL}/users/update-cover-image`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                navigate('/profile');
            } else {
                setError(response.data.message || 'Failed to update cover image. Please try again.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update cover image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewCoverImage(file);  // Set the selected file
        }
    };

    return (
        <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
            <div className="container d-flex justify-content-center align-items-center">
                <Card className={`p-4 shadow-lg ${theme === 'light' ? 'text-dark bg-light' : 'text-white bg-dark'}`} style={{ width: '500px' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Update Cover Image</h2>
                        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                        
                        <Form onSubmit={handleUpdateCoverImage}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <i className="fas fa-image me-2"></i>
                                    Choose a new cover image
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    id="formCoverImage"
                                    onChange={handleCoverImageChange} 
                                    accept="image/*"
                                />
                            </Form.Group>

                            <div className="d-flex flex-column flex-md-row justify-content-between">
                                <Button variant="secondary" type="button" className="mb-2 mb-md-0" onClick={handleCancel} disabled={loading}>
                                    <i className="fas fa-ban me-2"></i>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {
                                        loading ? (
                                            <span>
                                                <i className="fas fa-spinner fa-spin me-2"></i> Updating...
                                            </span>
                                        ) : (
                                            <span>
                                                <i className="fas fa-upload me-2"></i> Update
                                            </span>
                                        )
                                    }
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default UpdateCoverImage;
