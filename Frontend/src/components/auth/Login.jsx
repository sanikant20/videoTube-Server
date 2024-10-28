import React, { useState } from 'react';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Snackbar from '../utils/Snackbar';
import axios from 'axios';
import URL from '../../ApiConfig';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${URL}/users/login`, {
        email,
        password,
      }, {
        withCredentials: true,
      });

      console.log("response Login data", response.data);
      // Successful login handling
      if (response.status === 200) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Show success Snackbar and navigate after short delay
        setShowSnackbar(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setErrorMessage(response.data?.message);
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
      <div className="container d-flex justify-content-center align-items-center">
        <Card style={{ width: '650px', zIndex: 1 }} className={` p-4 shadow-lg ${theme === 'light' ? 'text-dark bg-light' : 'text-white bg-dark'}`}>
          <Card.Body>
            <h2 className="text-center mb-4">Videotube Login</h2>
            {errorMessage && (
              <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>
            )}

            <Form onSubmit={handleLogin}>
              {/* Email Input */}
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              {/* Password Input */}
              <Form.Group className="mb-1" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </Button>
                </InputGroup>
              </Form.Group>

              {/* Forgot Password Link */}
              <Button
                variant="danger"
                type="button"
                className="float-end text-decoration-none m-2"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </Button>

              {/* Login Button */}
              <Button
                variant="primary"
                type="submit"
                className="w-100">
                <i className="fas fa-sign-in-alt me-2"></i>
                {
                  loading
                    ? 'Logging in...'
                    : 'Login'
                }
              </Button>

              <hr className="my-4" />
              {/* Google Login Button */}
              <Button
                variant="success"
                type="button"
                className="w-100 mt-2"
                onClick={() => navigate('/google-login')}
              >
                <i className="fab fa-google me-2"></i>
                Login with Google
              </Button>

              {/* Facebook Login Button */}
              <Button
                variant="info"
                type="button"
                className="w-100 mt-2"
                onClick={() => navigate('/facebook-login')}
              >
                <i className="fab fa-facebook me-2"></i>
                Login with Facebook
              </Button>

              {/* Register Link */}
              <div className="mt-3 text-center">
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none">
                  Register
                </Link>
              </div>
            </Form>
          </Card.Body>

          {/* Snackbar for confirmation message */}
          <Snackbar
            message="You have been logged in successfully!"
            show={showSnackbar}
            onClose={() => setShowSnackbar(false)}
            type={'success'}
          />
        </Card>
      </div>
    </div >
  );
};

export default Login;

