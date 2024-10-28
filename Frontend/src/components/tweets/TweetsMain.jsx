import React from 'react';
import { Container } from 'react-bootstrap';
import AllTweets from './AllTweet';
import CreateTweet from './CreateTweet';


const TweetsMain = () => {
  return (
    <Container>
      <h2 className="text-center mb-4">Tweets</h2>
      <CreateTweet />
      <AllTweets />
    </Container>
  );
};

export default TweetsMain;
