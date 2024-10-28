import React, { useState } from 'react';
import axios from 'axios';
import URL from '../../ApiConfig';
import { Alert, Form, Button } from 'react-bootstrap';

const EditComment = ({ commentId, initialContent, onCommentUpdated }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // State to control edit mode
    const [commentContent, setCommentContent] = useState(initialContent || ''); // Initialize with existing content

    const handleEditComment = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.patch(`${URL}/comments/c/${commentId}`, {
                content: commentContent // Send the updated comment content
            }, { withCredentials: true });

            if (response.status === 200) {
                setIsEditing(false); // Hide the form after successful update
                if (onCommentUpdated) {
                    onCommentUpdated(); // Notify parent component
                }
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred while updating the comment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='d-flex flex-column'>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            {!isEditing ? (
                // Render edit icon when not editing
                <i className="fas fa-edit" style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)} />
            ) : (
                <Form onSubmit={handleEditComment}
                    className="d-flex flex-column flex-sm-row w-100 gap-2">
                    <Form.Control
                        type="text"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Edit your comment..."
                        disabled={loading}
                        required
                        className="flex-grow-1 mb-2 mb-sm-0"
                    />
                    <div className="ml-sm-2 d-flex flex-column flex-sm-row w-100 align-items-start">
                        <Button type="submit" className="mb-2 w-100 mb-sm-0" disabled={loading}>
                            {loading ? 'Updating...' : 'Update'}
                        </Button>
                        <Button variant="secondary" className="ms-0 w-100 ms-sm-2" onClick={() => setIsEditing(false)} disabled={loading}>
                            Cancel
                        </Button>
                    </div>

                </Form>
            )}
        </div>
    );
};

export default EditComment;
