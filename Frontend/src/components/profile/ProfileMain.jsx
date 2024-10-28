import React, { useState, useEffect } from 'react'; // Corrected import for useEffect
import { Link } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useTheme } from "../context/ThemeContext";
import URL from "../../ApiConfig";
import axios from 'axios';

const ProfileMain = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { theme } = useTheme();


  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${URL}/users/current-user`, {
          withCredentials: true,
        });

        if (response.data && response.data.data) {
          const userData = response.data.data;

          if (!userData) {
            setError("User not found");
          } else {
            setUser(userData);
          }
        } else {
          setError("Failed to fetch user");
        }
      } catch (error) {
        setError(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className='d-flex flex-column justify-content-center align-items-center vh-100 w-100'>
        <Spinner
          animation="border"
          variant={`${theme === 'light' ? 'dark' : 'light'}`}
          style={{ width: '3rem', height: '3rem', marginBottom: '10px' }}
        />
        <p className={`text-secondary fw-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
          Loading user profile...
        </p>
      </div>
    )
  }

  return (
    <div className='container mb-5 d-flex flex-column align-items-center '>
      <h1 className='mb-4 text-center'>Profile</h1>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible >{error}</Alert>}

      {/* Profile Card with Cover Image and Avatar */}
      <Card className={`w-100 border-2 mb-4 position-relative shadow-sm ${theme === 'light' ? 'bg-light text-dark border-dark' : 'bg-dark text-white border-white'}`} style={{ maxWidth: '800px' }}>
        <Card.Img
          className='coverImage rounded-top'
          src={user.coverImage}
          alt='Cover Image'
          style={{
            height: '300px',
            objectFit: 'cover',
            filter: 'brightness(85%)'
          }}
        />

        <Card.Img
          className='avatar rounded-circle'
          src={user.avatar}
          alt='Profile'
          style={{
            position: 'absolute',
            top: '200px',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: '150px',
            height: '150px',
            border: '5px solid white',
            objectFit: 'cover',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}
        />

        <Card.Body className='text-center mt-5'>
          <Card.Title as="h2" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            <i className="fas fa-user me-2"></i>
            {user.fullName}
          </Card.Title>

          <Card.Subtitle className="mt-3" style={{ fontSize: '1rem', fontStyle: 'italic' }}>
            <i className="fas fa-user me-2"></i>
            @{user.userName}
          </Card.Subtitle>

          <Card.Text className='mt-2' style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            <i className="fas fa-envelope me-2"></i>
            {user.email}
          </Card.Text>

          <hr style={{ width: '50%', margin: '1.5rem auto', opacity: '0.5' }} />

          <Card.Text className='mt-3' style={{ fontSize: '1rem', color: '#6c757d' }}>
            <i className="fas fa-calendar me-2"></i>
            Joined on {new Date(user.createdAt).toLocaleDateString()}
          </Card.Text>
        </Card.Body>

      </Card>

      {/* Action Buttons for Profile Updates */}
      {
        error ? (
          <Alert variant="danger" onClose={() => setError(null)} dismissible >{error}</Alert>
        ) : (
          <Card className={`w-100 border-2 shadow-sm ${theme === 'light' ? 'bg-light text-dark border-dark' : 'bg-dark text-white border-white'}`} style={{ maxWidth: '800px' }}>
            <Card.Body className='row justify-content-around flex-wrap gap-3 p-4'>
              <div className='col-12 col-md-5 mb-3'>
                <Button
                  as={Link}
                  to='/profile/update/avatar'
                  variant='primary'
                  className='w-100 shadow'
                >
                  <i className="fas fa-camera me-2"></i>
                  Update Avatar
                </Button>
              </div>
              <div className='col-12 col-md-5 mb-3'>
                <Button
                  as={Link}
                  to='/profile/update/coverImage'
                  variant='info'
                  className='w-100 shadow'
                >
                  <i className="fas fa-image me-2"></i>
                  Change Cover Image
                </Button>
              </div>
              <div className='col-12 col-md-5 mb-3'>
                <Button
                  as={Link}
                  to='/profile/update/profileData'
                  variant='warning'
                  className='w-100 shadow'
                >
                  <i className="fas fa-user-edit me-2"></i>
                  Edit Profile
                </Button>
              </div>
              <div className='col-12 col-md-5 mb-3'>
                <Button
                  as={Link}
                  to='/profile/update/password'
                  variant='danger'
                  className='w-100 shadow'
                >
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </Button>
              </div>
            </Card.Body>
          </Card>
        )
      }


    </div>
  );
};

export default ProfileMain;
