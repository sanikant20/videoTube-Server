import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Container, Row, Col, Card, Spinner, Button, Dropdown } from 'react-bootstrap';
import SearchVideos from './SearchVideos';
import axios from 'axios';
import URL from '../../ApiConfig';

const HomeMain = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${URL}/videos/get-all-videos`, {
          params: { page, limit, sortBy, sortType },
        });

        if (response.data && response.data.data && response.data.data.videos) {
          setVideos(response.data.data.videos);
        } else {
          setError('No videos found in the response.');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch videos.');
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, limit, sortBy, sortType]); // Fetch videos when these states change

  // Function to handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Function to handle limit change
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to the first page when limit changes
  };

  // Function to handle sorting
  const handleSortChange = (field) => {
    if (field === sortBy) {
      // Toggle sort direction if the same field is selected
      setSortType(sortType === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortType('asc'); // Reset to ascending when a new field is selected
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading video...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <p>{error}</p>
      </Container>
    );
  }



  return (
    <div className="d-flex flex-column flex-lg-row vh-100"> {/* Ensure this matches your layout */}
      {/* <Sidebar /> Sidebar remains outside the main content area */}

      <div className="flex-grow-1"> {/* This will ensure it takes the remaining space */}
        <Container className={`pt-4 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`}>
          <SearchVideos />

          <h2>Popular Videos</h2>

          {/* Sort and Pagination Controls */}
          <div className="d-flex flex-column flex-md-row justify-content-between mb-3 mt-3 border rounded shadow-sm p-3">
            {/* Sorting Dropdown */}
            <div className="d-flex flex-wrap gap-2">
              <Dropdown className={`me-2 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`}>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  Sort By: {sortBy} ({sortType})
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleSortChange('createdAt')}>Date Created</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange('views')}>Views</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange('title')}>Title</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Items per Page Section */}
            <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0 align-items-center">
              <span className="me-2">Items per page:</span>
              <Button variant="outline-secondary" onClick={() => handleLimitChange(12)}>12</Button>
              <Button variant="outline-secondary" className="ms-2" onClick={() => handleLimitChange(24)}>24</Button>
              <Button variant="outline-secondary" className="ms-2" onClick={() => handleLimitChange(48)}>48</Button>
              <Button variant="outline-secondary" className="ms-2" onClick={() => handleLimitChange(96)}>96</Button>
            </div>
          </div>

          {/* Video Grid */}
          <Row className="g-4">
            {Array.isArray(videos) && videos.length > 0 ? (
              videos.map((video) => (
                <Col key={video._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card className="h-100">
                    <div className="thumbnail-container" style={{ position: 'relative' }}>
                      <Card.Img
                        variant="top"
                        src={video.thumbnail}
                        alt={`${video.title} thumbnail`}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div
                        className="video-duration"
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                        }}
                      >
                        {video.duration}
                      </div>
                    </div>
                    <Card.Body>
                      <Card.Title>{video.title}</Card.Title>
                      <Card.Text>{video.views} views</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No videos found.</p>
            )}
          </Row>

          {/* Pagination Controls */}
          <div
            className={`d-flex justify-content-center align-items-center mt-3 p-3 border rounded shadow-sm 
              ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`}
          >
            <Button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="btn btn-primary me-2"
            >
              Previous
            </Button>
            <span className={`mx-2 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}>
              Page {page}
            </span>
            <Button
              disabled={videos.length < limit}
              onClick={() => handlePageChange(page + 1)}
              className="btn btn-primary ms-2"
            >
              Next
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );


};

export default HomeMain;