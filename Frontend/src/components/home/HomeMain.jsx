import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Container, Row, Col, Form, FormControl, Button, Card } from 'react-bootstrap';

const HomeMain = () => {
  const { theme } = useTheme(); // Access the current theme

  const videos = [
    { id: 1, title: 'Video 1', thumbnail: 'https://via.placeholder.com/300x180', views: '1M views', duration: '10:30' },
    // ...other video data
  ];

  return (
    <Container fluid className={`pt-4 ${theme}`}>
      {/* Search Bar */}
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Search videos"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="primary">Search</Button>
          </Form>
        </Col>
      </Row>

      {/* Video Grid */}
      <Row>
        {videos.map((video) => (
          <Col key={video.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className={`h-100 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
              <Card.Img variant="top" src={video.thumbnail} />
              <Card.Body>
                <Card.Title>{video.title}</Card.Title>
                <Card.Text>{video.views}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HomeMain;
