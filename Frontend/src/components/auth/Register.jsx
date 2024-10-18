import React, { useState } from 'react';
import { Form, Button, Card, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Snackbar from '../utils/Snackbar';
import URL from '../../ApiConfig';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState({ message: '', type: '', show: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Check if passwords match
    if (password !== confirmPassword) {
      setShowSnackbar({ message: "Passwords don't match!", type: 'error', show: true });
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('password', password);
    if (avatar) formData.append('avatar', avatar);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      const response = await axios.post(`${URL}/users/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setShowSnackbar({ message: response.data.message, type: 'success', show: true });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      setShowSnackbar({ message: errorMsg, type: 'error', show: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid position-relative row m-0 p-0 overflow-hidden">
      <div className="container d-flex justify-content-center align-items-center">
        <Card
          style={{ width: '650px' }}
          className={`p-4 shadow-lg ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
        >
          <Card.Body>
            <h2 className="text-center mb-4">Videotube Register</h2>
            <Form onSubmit={handleRegister}>
              {/* Full Name Input */}
              <Form.Group className="mb-3" controlId="formBasicFullName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Username and Email Inputs */}
              <div className="row mb-3">
                <Form.Group className="col-md-6 mb-3" controlId="formBasicUserName">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
              </div>

              {/* Password and Confirm Password Inputs */}
              <div className="row mb-3">
                <Form.Group className="col-md-6 mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="col-md-6 mb-3" controlId="formBasicConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </div>

              {/* Avatar and Cover Image Inputs */}
              <div className="row mb-3">
                <Form.Group className="col-md-6 mb-3" controlId="formBasicAvatar">
                  <Form.Label>Avatar</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    required
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3" controlId="formBasicCoverImage">
                  <Form.Label>Cover Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                  />
                </Form.Group>
              </div>

              {/* Submit and Clear Form Buttons */}
              <div>
                <Button variant="primary" type="submit" className="w-100">
                  <i className="fa fa-user-plus me-2"></i>
                  {loading ? 'Registering...' : 'Register'}
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  className="w-100 mt-3"
                  onClick={() => {
                    setFullName('');
                    setUserName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setAvatar(null);
                    setCoverImage(null);
                  }}
                >
                  <i className="fa fa-eraser me-2"></i>
                  Clear Form
                </Button>
              </div>

              <div className="mt-3 text-center">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Form>
          </Card.Body>

          {/* Snackbar for notifications */}
          <Snackbar
            message={showSnackbar.message}
            show={showSnackbar.show}
            onClose={() => setShowSnackbar({ ...showSnackbar, show: false })}
            type={showSnackbar.type}
          />
        </Card>
      </div>
    </div>

  );
};

export default Register;
