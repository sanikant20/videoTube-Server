import React from 'react';
import { Card } from 'react-bootstrap';

const OfflineStatusCard = () => {
    return (
        <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 p-4">
            <Card className="text-center w-100 shadow-lg" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    {/* Icon representing offline status */}
                    <Card.Title>
                    <i className="fas fa-wifi mt-2 text-warning "></i>
                        <h2 className="mt-2 text-warning ">YOU ARE CURRENTLY</h2>
                    </Card.Title>

                    {/* Image for visual representation */}
                    <img
                        src="offline.jpg"
                        alt="OFFLINE"
                        className="img-fluid mb-4"
                        style={{ maxWidth: '100%', height: '300px', objectFit: 'contain' }}
                    />
                    <Card.Text>
                        {/* Offline Message */}
                        <h6 className="text-danger">Please check your internet connection and try again.</h6>
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default OfflineStatusCard;
