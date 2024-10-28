import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import URL from '../../ApiConfig';
import { useTheme } from '../context/ThemeContext';

const CreateTweet = () => {
  const [tweetContent, setTweetContent] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();

  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${URL}/tweets/create-tweet`,
        { content: tweetContent },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setTweetContent('');
      } else {
        setError(response?.data?.message || 'Failed to create tweet');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create tweet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`p-4  ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white border-white border'}`}>
      <Card.Body>
        <Form onSubmit={handleTweetSubmit}>
          <Form.Group controlId="tweetContent">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="What's happening?"
              value={tweetContent}
              onChange={(e) => setTweetContent(e.target.value)}
              disabled={isLoading}
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="mt-2">
              {error}
            </Alert>
          )}

          <Button type="submit" variant="primary" className="mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Tweet Posting...
              </>
            ) : (
              'Post Tweet'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateTweet;
