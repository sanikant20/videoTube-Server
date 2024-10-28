import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import URL from '../../ApiConfig';

const AddComment = ({ onCommentAdded }) => { // Accept onCommentAdded prop
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { theme } = useTheme();
    const { videoId } = useParams();

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post(`${URL}/comments/video-comment/${videoId}`, 
                { content },
                { withCredentials: true }
            );

            if (response.status === 200 && response.data.success) {
                setContent(''); // Reset the input field
                onCommentAdded(); // Call the callback to refetch comments
            } else {
                setError(response.data.message || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="m-0 p-0 d-flex flex-column justify-content-center align-items-center w-100">
            <Card className={`w-100 shadow-lg ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`} style={{ maxWidth: '700px' }}>
                <Card.Header className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                    <h5 className="m-0 p-0">Add Comment</h5>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}
                    <Form onSubmit={handleCommentSubmit}>
                        <Form.Group className="mb-3" controlId="commentInput">
                            <Form.Control
                                type="text"
                                placeholder="Write your comment..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className="w-100"
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AddComment;
