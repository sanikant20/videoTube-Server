import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate();

    const handleDashboardRedirect = () => {
        navigate('/');
    };

    return (
        <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 p-4">
            <Card className="text-center w-100 shadow-lg" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    {/* Site Title */}
                    <Card.Title as="h1" className="mb-4 text-danger">VideoTube</Card.Title>

                    {/* Page Not Found Image */}
                    <img
                        src="https://img.freepik.com/premium-vector/error-404-illustration_863552-12.jpg?w=1060"
                        alt="Page Not Found"
                        className="img-fluid mb-4"
                        style={{ maxWidth: '100%', height: '300px', objectFit: 'contain' }}
                    />

                    {/* Page Not Found Message */}
                    <Card.Text as="h1" className="mt-4 text-danger">Oops! Page Not Found</Card.Text>

                    {/* Redirect Button */}
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={handleDashboardRedirect}
                    >
                        Go to Dashboard
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PageNotFound;
