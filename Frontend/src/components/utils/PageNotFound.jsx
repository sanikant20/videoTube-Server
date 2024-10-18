import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate();

    const handleDashboardRedirect = () => {
        navigate('/');
    };

    return (
        <Container className="text-center mt-5 p-5 rounded-3 shadow-lg bg-light">
            <div className="align-items-center text-center">
                <h1 className="mb-4">VideoTube</h1>
            </div>

            {/* Page Not Found Image */}
            <img
                src="https://img.freepik.com/premium-vector/error-404-illustration_863552-12.jpg?w=1060"
                alt="Page Not Found"
                className="img-fluid"
                style={{ maxWidth: '400px', height: '400px' }}
            />

            {/* Page Not Found Heading */}
            <h1 className="mt-4">Oops! Page Not Found</h1>

            {/* Redirect to Dashboard Button */}
            <Button
                variant="primary"
                className="mt-3"
                onClick={handleDashboardRedirect}
            >
                Go to Dashboard
            </Button>
        </Container>
    );
};

export default PageNotFound;
