import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import axios from 'axios';
import URL from '../../ApiConfig';

const CommentLikeToggle = ({ comment }) => {
    const [likeCount, setLikeCount] = useState(comment.likeCount);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleToggleLike = async () => {
        try {
            const response = await axios.post(`${URL}/likes/toggle/comment/${comment._id}`, 
                {}, { withCredentials: true });

            if (response.data.success) {
                if (isLiked) {
                    // If the user is unliking the comment
                    setLikeCount(prevCount => prevCount - 1);
                    setIsLiked(false);
                } else {
                    // If the user is liking the comment
                    setLikeCount(prevCount => prevCount + 1);
                    setIsLiked(true);
                }
            } else {
                setError(response?.data?.message);
            }
        } catch (error) {
            setError(error.response?.data?.message);
        }
    };

    return (
        <div className="d-flex align-items-center mt-2">

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            <i 
                className={`fas fa-thumbs-up me-2 ${isLiked ? 'text-primary' : ''}`} 
                onClick={handleToggleLike} 
                style={{ cursor: 'pointer' }}
            ></i>
            <small>
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
            </small>
        </div>
    );
};

export default CommentLikeToggle;
