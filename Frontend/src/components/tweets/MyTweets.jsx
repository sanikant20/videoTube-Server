import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Image, Alert, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import URL from '../../ApiConfig';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

const MyTweets = () => {
    const [myTweets, setMyTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Fetch my tweets
    useEffect(() => {
        const fetchMyTweets = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            try {
                const response = await axios.get(`${URL}/tweets/user-tweets`, {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    setMyTweets(response.data?.data?.tweets || []);
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

        fetchMyTweets();
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
                    Loading your tweets...
                </p>
            </div>
        );
    }

    const handleNavigateToAllTweets = () => {
        navigate('/tweets');
    };

    const handleDeleteTweet = async (tweetId) => {
        if (window.confirm("Are you sure you want to delete this tweet?")) {
            setSuccessMessage(null);
            setErrorMessage(null);
            setIsLoading(true);

            try {
                const response = await axios.delete(`${URL}/tweets/${tweetId}`, { withCredentials: true });
                if (response.status === 200) {
                    setSuccessMessage(response.data.message || 'Tweet deleted successfully');
                    // Remove the deleted tweet from the state
                    setMyTweets(myTweets.filter(tweet => tweet._id !== tweetId));
                } else {
                    setErrorMessage(response.data.message || 'An error occurred while deleting the tweet');
                }
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'An error occurred while deleting the tweet');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Container className="my-4">
            <h2 className="text-center mb-4">My Tweets</h2>
            {errorMessage && (
                <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
                    {errorMessage}
                </Alert>
            )}
            {successMessage && (
                <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
                    {successMessage}
                </Alert>
            )}

            <div className="mt-2 mb-2 d-flex flex-column flex-sm-row justify-content-between">
                {myTweets.length > 0 ? (
                    <h4 className='text-center'>
                        {myTweets.length} {myTweets.length === 1 ? "tweet" : "tweets"} found for {myTweets[0]?.owner.fullName}
                    </h4>
                ) : (
                    <h4 className='text-center'>No tweets found</h4>
                )}

                <Button variant="primary" onClick={handleNavigateToAllTweets} className="mb-3">
                    View all tweets
                </Button>
            </div>

            {myTweets.map((tweet) => (
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
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
                                            <h6 className="mb-0">{tweet.owner.fullName}</h6>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="text-white"
                                                onClick={() => handleDeleteTweet(tweet._id)} // Pass the tweet ID
                                            >
                                                <i className="far fa-trash-alt me-1" />
                                            </Button>
                                        </div>
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

                                <div className="mt-2 mb-2 d-flex flex-column flex-sm-row justify-content-between">
                                    <Card.Text className="flex-grow-1 mb-0">{tweet.content}</Card.Text>
                                    <Link
                                        to={`/tweets/${tweet._id}`}
                                        className="text-decoration-none text-primary mt-2 mt-sm-0 ms-0 ms-sm-3"
                                    >
                                        <Button className="d-flex align-items-center gap-2">
                                            <i className="far fa-edit" />
                                            <span>Edit Content</span>
                                        </Button>
                                    </Link>
                                </div>

                                <div className="d-flex justify-content-around text-muted flex-wrap">
                                    <Button variant="link" className="text-secondary p-0 me-2 mb-2">
                                        <i className="far fa-comment" /> 10
                                    </Button>
                                    <Button variant="link" className="text-secondary p-0 me-2 mb-2">
                                        <i className="fas fa-retweet" /> 5
                                    </Button>
                                    <Button variant="link" className="text-secondary p-0 mb-2">
                                        <i className="far fa-heart" /> {tweet.likeCount}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default MyTweets;
