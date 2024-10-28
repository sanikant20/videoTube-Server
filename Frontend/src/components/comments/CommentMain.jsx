import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import URL from '../../ApiConfig';
import { useTheme } from "../context/ThemeContext";
import AddComment from './AddComment';
import DeleteComment from './DeleteComment';
import EditComment from './EditComment';
import CommentLikeToggle from './CommentLikeToggle';

const CommentMain = () => {
    const [commentList, setCommentList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { videoId } = useParams();
    const { theme } = useTheme();

    // Fetch comments from the API
    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/comments/video-comment/${videoId}`);
            if (response.status === 200 && response.data.success) {
                setCommentList(response.data.data.comment); // Set the comments
            } else {
                setError(response.data.message || "Failed to load comments.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred while fetching comments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(); // Fetch comments on component mount
    }, [videoId]);

    // Callback function to refetch comments after adding a new one
    const handleCommentAdded = () => {
        fetchComments(); // Refetch comments after adding a new one
    };

    // Callback to handle comment deletion
    const handleCommentDeleted = (commentId) => {
        setCommentList(prev => prev.filter(comment => comment._id !== commentId));
    };

    // Callback to handle comment update
    const handleCommentUpdated = () => {
        fetchComments(); // Optionally refetch comments after editing
    };

    return (
        <div className={`rounded-3 p-1 w-100 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}>
            <div className="container-fluid text-start">
                {/* Add Comment */}
                <div className="mt-3">
                    <AddComment onCommentAdded={handleCommentAdded} />
                </div>

                {/* Comments Header */}
                <h5 className="mb-2 mt-3">Comments:</h5>
                <hr />

                {/* Loading/Error/Comments Display */}
                {loading ? (
                    <p>Loading comments...</p>
                ) : error ? (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>
                ) : commentList.length > 0 ? (
                    commentList.map((comment) => (
                        <Card key={comment._id} className="mb-3 shadow-lg">
                            <Card.Header className={`rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center
                                ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}>
                                <strong className="mb-1 mb-sm-0">{comment.owner.fullName}</strong>
                                <span className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                <DeleteComment
                                    commentId={comment._id}
                                    onCommentDeleted={handleCommentDeleted}
                                />
                            </Card.Header>
                            <Card.Body className={`rounded-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}>
                                <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-start mb-3`}>
                                    <Card.Text className="flex-grow-1 mb-2 mb-sm-0">{comment.content}</Card.Text>

                                    {/* EditComment is here to allow editing */}
                                    <EditComment
                                        commentId={comment._id}
                                        initialContent={comment.content}
                                        onCommentUpdated={handleCommentUpdated}
                                    />
                                </div>

                                <CommentLikeToggle comment={comment} />

                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <p>There are no comments yet.</p>
                )}
            </div>
        </div>
    );
};

export default CommentMain;
