import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Image, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import URL from '../../ApiConfig';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from "react-router-dom";

const AllTweets = () => {
    const [tweets, setTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const fetchTweets = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await axios.get(`${URL}/tweets/all-tweets`, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setTweets(response.data?.data?.tweets || []);
                setSuccessMessage(response.data?.message);
            } else {
                setErrorMessage(response.data.message || "Failed to load tweets.");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred while fetching tweets.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch tweets on component mount and when a new tweet is created
    useEffect(() => {
        fetchTweets();
    }, []);

    // Automatically clear messages after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (successMessage) setSuccessMessage(null);
            if (errorMessage) setErrorMessage(null);
        }, 3000);
        return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, [successMessage, errorMessage]);

    if (isLoading) {
        return (
            <div className='d-flex flex-column justify-content-center align-items-center vh-100 w-100'>
                <Spinner
                    animation="border"
                    variant={theme === 'light' ? 'dark' : 'light'}
                    style={{ width: '3rem', height: '3rem', marginBottom: '10px' }}
                />
                <p className={`text-secondary fw-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                    Loading tweets...
                </p>
            </div>
        );
    }

    const handleMyTweets = () => {
        navigate('/tweets/user-tweets');
    };

    return (
        <div className={`p-2 mt-2 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`}>
            {successMessage && (
                <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
                    {errorMessage}
                </Alert>
            )}

            <div className="mt-2 mb-2 d-flex flex-column flex-sm-row justify-content-between align-items-center">
                {tweets.length > 0 ? (
                    <h4 className='text-center'>
                        Total {tweets.length} {tweets.length === 1 ? "tweet" : "tweets"} found
                    </h4>
                ) : (
                    <h4 className='text-center'>No tweets found</h4>
                )}
                <Button
                    type="button"
                    variant="primary"
                    className="mb-3"
                    onClick={handleMyTweets}
                >
                    View My Tweets
                </Button>
            </div>

            {tweets.map((tweet) => (
                <Card className={`mb-3 shadow-sm ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white border-light'}`} key={tweet._id}>
                    <Card.Body>
                        <Row>
                            <Col xs={3} sm={2} md={2} className="d-flex justify-content-center">
                                <Image
                                    src={tweet.owner.avatar}
                                    roundedCircle
                                    width="100%"
                                    height="auto"
                                    style={{ maxWidth: '60px', maxHeight: '60px' }}
                                />
                            </Col>

                            <Col xs={9} sm={10} md={10}>
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
                                    <div>
                                        <h6 className="mb-1">{tweet.owner.fullName}</h6>
                                        <small className={`${theme === 'light' ? 'text-muted' : 'text-white'}`}>
                                            @{tweet.owner.userName} - {new Date(tweet.createdAt).toLocaleString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "numeric",
                                                second: "numeric",
                                                timeZone: "UTC",
                                                timeZoneName: "short"
                                            })}
                                        </small>
                                    </div>
                                </div>
                                <div className="mt-2 mb-2 d-flex justify-content-between align-items-center">
                                    <Card.Text className="flex-grow-1 mb-0">{tweet.content}</Card.Text>
                                </div>

                                <div className="d-flex justify-content-around text-muted flex-wrap">
                                    <Button variant="link" className="text-secondary p-0 me-2 mb-2">
                                        <i className="far fa-comment" /> {tweet.commentCount || 0}
                                    </Button>
                                    <Button variant="link" className="text-secondary p-0 me-2 mb-2">
                                        <i className="fas fa-retweet" /> {tweet.retweetCount || 0}
                                    </Button>
                                    <Button variant="link" className="text-secondary p-0 mb-2">
                                        <i className="far fa-heart" /> {tweet.likeCount || 0}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

export default AllTweets;
