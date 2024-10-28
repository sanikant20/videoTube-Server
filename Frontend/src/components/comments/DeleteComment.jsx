import React, { useState } from 'react';
import axios from 'axios';
import URL from '../../ApiConfig';
import { Alert } from 'react-bootstrap';

const DeleteComment = ({ commentId, onCommentDeleted, onRestoreComment }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [commentDeleted, setCommentDeleted] = useState(false); // Track if the comment was deleted

    const handleDelete = async () => {
        // Confirm deletion
        const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
        if (!confirmDelete) return; // Exit if user cancels

        setLoading(true);
        setError(null); // Reset error state

        try {
            const response = await axios.delete(`${URL}/comments/c/${commentId}`, { withCredentials: true });
            if (response.status === 200) {
                setCommentDeleted(true); // Mark as deleted
                // Notify parent component that the comment has been deleted
                if (onCommentDeleted) {
                    onCommentDeleted(commentId);
                }
            } else {
                setError(response?.data?.message);
            }
        } catch (err) {
            setError(err.response?.data?.message);
            // Restore the comment if deletion failed
            if (onRestoreComment) {
                onRestoreComment(commentId);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='d-flex'>
            {
                error ? (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>
                ) : (
                    !commentDeleted && (
                        <i
                            className={`fas fa-trash-alt text-danger ${loading ? 'disabled' : 'cursor-pointer'}`}
                            onClick={loading ? null : handleDelete}
                            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                        </i>
                    )
                )
            }
        </div>
    );
};

export default DeleteComment;
