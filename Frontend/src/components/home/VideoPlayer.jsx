import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import URL from "../../ApiConfig";
import { useTheme } from "../context/ThemeContext";
import CommentMain from "../comments/CommentMain";
import VideoSuggestion from "./VideoSuggestion";

const VideoPlayer = () => {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { videoId } = useParams();
    const { theme } = useTheme();

    useEffect(() => {
        const getVideo = async (e) => {
            setLoading(true);
            setError(null); // Reset error state before fetching

            try {
                const response = await axios.get(`${URL}/videos/${videoId}`);

                if (response.status === 200) {
                    setVideo(response.data.data.video);
                } else {
                    console.error("Failed to fetch video");
                    setError(response.data.message);
                }
            } catch (error) {
                setError(error.message || "Failed to fetch video");
            } finally {
                setLoading(false);
            }
        };

        getVideo(); // Call the function to fetch video
    }, [videoId]); // Dependency on videoId to refetch when it changes

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Video Player Section - Takes 8 columns on large screens, full width on small */}
                <div className="col-12 col-lg-8 mb-4">
                    <div className="d-flex flex-column">
                        <h2 className="mb-4">Video Player</h2>

                        {loading ? (
                            <div className="d-flex flex-column justify-content-center align-items-center vh-100 w-100">
                                <Spinner
                                    animation="border"
                                    variant={`${theme === 'light' ? 'dark' : 'light'}`}
                                    style={{ width: '3rem', height: '3rem', marginBottom: '10px' }}
                                />
                                <p className={`text-secondary fw-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                                    Loading video...
                                </p>
                            </div>
                        ) : error ? (
                            <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>
                        ) : (
                            <Card className="text-center w-100 mx-auto shadow-lg" style={{ maxWidth: '1000px' }}>
                                <Card.Body>
                                    {/* Video Player */}
                                    <div className="video-container position-relative" style={{ overflow: 'hidden', borderRadius: '0.5rem', maxHeight: '70vh', maxWidth: '100%' }}>
                                        <video
                                            autoPlay
                                            muted
                                            controls
                                            className={`w-100 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`}
                                            style={{ objectFit: 'contain', borderRadius: '0.5rem', maxHeight: '70vh', maxWidth: '100%' }}
                                            onCanPlayThrough={(e) => {
                                                e.target.volume = 0.5; // Set default volume to 50%
                                            }}
                                            title="Video Player"
                                            aria-label="Video player with controls"
                                        >
                                            <source src={video.videoFile} type="video/mp4" />
                                        </video>
                                    </div>


                                    {/* Video Details */}
                                    <div className={`p-3 rounded-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'} text-start rounded-bottom shadow-sm`}>
                                        <Card.Title as="h5" className="mb-3 text-info">{video.title}</Card.Title>

                                        <Card.Text className="mb-2">
                                            <span className="fw-bold">Views: </span>
                                            <span className={`${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                                                {video.views.toLocaleString()}
                                            </span>
                                        </Card.Text>

                                        <Card.Text className="mb-2">
                                            <span className="fw-bold">Likes: </span>
                                            <span className={`${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                                                {video.likeCount}
                                            </span>
                                        </Card.Text>

                                        <Card.Text className="mb-2">
                                            <span className="fw-bold">Description: </span>
                                            <span className={`${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                                                {video.description}
                                            </span>
                                        </Card.Text>

                                        <Card.Text className="mb-2">
                                            <span className="fw-bold">Uploaded on: </span>
                                            <span className={`${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </span>
                                        </Card.Text>
                                    </div>

                                    {/* Comments Section */}
                                    <div className={`${theme === 'light' ? 'bg-light' : 'bg-dark'} rounded mt-3`}>
                                        <CommentMain />
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Video Suggestions Section - Takes 4 columns on large screens, full width on small */}
                <div className="col-12 col-lg-4">
                    <div className="d-flex flex-column">
                        <VideoSuggestion />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
