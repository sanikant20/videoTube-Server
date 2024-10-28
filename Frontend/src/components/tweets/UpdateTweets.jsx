import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import URL from '../../ApiConfig';
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateTweets = () => {
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { theme } = useTheme();
    const { tweetId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTweetContent = async () => {
            try {
                const response = await axios.get(`${URL}/tweets/single-tweet/${tweetId}`, { withCredentials: true });
                if (response.status === 200) {
                    setContent(response.data.data.content || '');
                    setSuccessMessage(response?.data?.message);
                } else {
                    setErrorMessage(response?.data?.message || 'Failed to load tweet content.');
                }
            } catch (err) {
                setErrorMessage(err.response?.data?.message || 'Failed to load tweet content.');
            }
        };
        fetchTweetContent();
    }, [tweetId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage('');

        try {
            const response = await axios.patch(`${URL}/tweets/${tweetId}`, { content }, { withCredentials: true });
            if (response.status === 200) {
                setSuccessMessage(response.data.message || 'Tweet updated successfully');
                navigate('/tweets/user-tweets');
            } else {
                setErrorMessage(response?.data?.message || 'An error occurred while updating the tweet.');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred while updating the tweet.');
        } finally {
            setIsLoading(false);
        }
    };

    // Automatically clear messages after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup the timer on unmount
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
            return () => clearTimeout(timer); // Cleanup the timer on unmount
        }
    }, [errorMessage]);

    const handleCancel = () => {
        navigate('/tweets/user-tweets');
    };

    return (
        <Container className={`my-4 rounded ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white    '}`}>
            <h2 className="text-center mb-4">Update Tweet</h2>
            {errorMessage && <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>{errorMessage}</Alert>}
            {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}

            <Form onSubmit={handleUpdate} className={`p-4 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white border border-light rounded'}`}>
                <Form.Group controlId="tweetContent">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Update your tweet content here..."
                        required
                    />
                </Form.Group>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <span>
                                <Spinner animation="border" size="sm" /> Updating...
                            </span>
                        ) : (
                            <span >
                                <i className='fas fa-pen gap-2'></i> Update
                            </span>
                        )}
                    </Button>
                    <Button variant="secondary" type="button" onClick={handleCancel}>
                        <span>
                            <i className='fas fa-times gap-2'></i> Cancel
                        </span>
                    </Button>
                </div>
            </Form>
        </Container>
    )
};

export default UpdateTweets;
