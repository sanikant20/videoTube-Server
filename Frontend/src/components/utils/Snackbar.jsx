import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const Snackbar = ({ message, show, onClose, type }) => {

    // Set background color based on the theme and type
    const getToastBackground = () => {
        switch (type) {
            case 'success':
                return 'light' ? 'bg-success' : 'bg-success';
            case 'error':
                return 'light' ? 'bg-danger' : 'bg-danger';
            case 'warning':
                return 'light' ? 'bg-warning' : 'bg-warning';
            case 'info':
                return 'light' ? 'bg-info' : 'bg-info';
            default:
                return 'light' ? 'bg-light' : 'bg-dark';
        }
    };

    const bgColor = getToastBackground();
    const textColor = 'light' ? 'text-dark' : 'text-light';

    return (
        <>
            {show && (
                <ToastContainer
                    position="top-center"
                    className={`p-3 ${bgColor}`}>
                    <Toast onClose={onClose} show={show} delay={3000} autohide>
                        <Toast.Body className={`text-center ${textColor}`}>
                            {message}
                        </Toast.Body>
                    </Toast>
                </ToastContainer>
            )}
        </>
    );
};

export default Snackbar;
