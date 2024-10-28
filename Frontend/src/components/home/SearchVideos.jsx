import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Form, FormControl, Button, Spinner, Alert } from 'react-bootstrap';
import URL from "../../ApiConfig";

const SearchVideos = () => {
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [videos, setVideos] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setHasSearched(true);

        // If the search text is empty, clear the videos and stop processing
        if (searchText.trim() === "") {
            setVideos([]);
            setLoading(false);
            setHasSearched(false);
            return;
        }

        try {
            const response = await axios.get(`${URL}/videos/search/${searchText}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if the API call was successful and data is present
            if (response.data && response.data.success) {
                setVideos(response.data.data);
                setError(null);
            } else {
                setError(response.data.message || 'No videos found.');
                setVideos([]);
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'An error occurred while searching for videos.');
            } else if (error.request) {
                setError('No response from the server. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }

            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Search Bar */}
            <Row className="justify-content-center mb-4">
                <Col xs={12} md={8} lg={6}>
                    <Form className="d-flex" onSubmit={handleSearch}>
                        <FormControl
                            type="search"
                            placeholder="Search videos"
                            className="me-2"
                            aria-label="Search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button variant="primary" type="submit">
                            {
                                loading ? 'Searching...' : 'Search'
                            }
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Loading Indicator */}
            {loading && searchText.trim() !== '' && (
                <Spinner animation="border" role="status" className="mb-3">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            )}

            {/* Error Message */}
            {videos.length === 0 && hasSearched && error && searchText.trim() !== '' && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>
            )}

            {searchText.trim() !== '' && hasSearched && (
                <h2 className="mb-4">
                    {videos.length > 0
                        ? `Search Results for "${searchText}" (${videos.length} videos found)`
                        : ''}
                </h2>
            )}

            {/* Video Grid */}
            <Row className="g-4">
                {searchText.trim() !== '' && videos.length > 0 ? (
                    videos.map((video) => (
                        <Col key={video._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Link to={`/description/watch/${video._id}`} className="text-decoration-none">
                                <Card className="h-100">
                                    <div className="thumbnail-container" style={{ position: 'relative' }}>
                                        <Card.Img
                                            variant="top"
                                            src={video.thumbnail}
                                            alt={`${video.title} thumbnail`}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div
                                            className="video-duration"
                                            style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                right: '8px',
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                color: '#fff',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {video.duration}
                                        </div>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="text-truncate">{video.title}</Card.Title>
                                        <Card.Text>{video.views} views</Card.Text>

                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))
                ) : (
                    hasSearched && videos.length === 0 && !loading && !error && (
                       ""
                    )
                )}
            </Row>

        </div>
    );
};

export default SearchVideos;
