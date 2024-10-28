import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Spinner, Alert } from 'react-bootstrap'; // Added Spinner and Alert for better UX
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import URL from '../../ApiConfig'; // Import URL

const VideoSuggestion = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [suggestedVideos, setSuggestedVideos] = useState([]);

    useEffect(() => {
        const fetchSuggestedVideos = async () => {
            try {
                setLoading(true); // Start loading
                const response = await axios.get(`${URL}/videos/get-all-videos`, {
                    params: { limit: null, sortBy: 'createdAt', sortType: 'asc' }
                });

                if (response.data && response.data.data && response.data.data.videos) {
                    setSuggestedVideos(response.data.data.videos);
                } else {
                    setError('No suggested videos found.');
                }
            } catch (err) {
                setError('Failed to fetch suggested videos.', err);
            } finally {
                setLoading(false); // Stop loading once the fetch is done
            }
        };

        fetchSuggestedVideos();
    }, []);

    return (
        <div className="container">
            <h2 className="mb-4">Suggested Videos</h2>

            {loading ? (
                <div className="text-center my-5 d-flex justify-content-center">
                <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>
            ) : suggestedVideos.length > 0 ? (
                <Row className="g-3">
                    {suggestedVideos.map((video) => (
                        <Col key={video._id} xs={12} sm={6} md={12}>
                            <Link to={`/description/watch/${video._id}`} className="text-decoration-none">
                                <Card className="h-100 shadow-sm">
                                    <div className="thumbnail-container position-relative" style={{ overflow: 'hidden' }}>
                                        <Card.Img
                                            variant="top"
                                            src={video.thumbnail}
                                            alt={`${video.title} thumbnail`}
                                            style={{ height: '120px', objectFit: 'cover' }}
                                        />
                                        <div
                                            className="video-duration position-absolute bottom-0 end-0 bg-dark text-white p-1 rounded"
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            {video.duration}
                                        </div>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="text-truncate">{video.title}</Card.Title>
                                        <Card.Text className="text-secondary">{video.views.toLocaleString()} views</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p>No suggested videos available.</p>
            )}
        </div>

    );
};

export default VideoSuggestion;
