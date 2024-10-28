import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from './components/context/ThemeContext';

// import components and pages for Online Status and Page Not Found
import UseOnlineStatus from "./components/utils/OnlineStatus";
import OfflineStatusCard from "./components/utils/OfflineStatusCard";
import PageNotFound from "./components/utils/PageNotFound";

// import components and pages for Authentication
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import Layout from "./components/auth/Layout";
import PrivateRoute from "./components/auth/PrivateRoute";

// import components and pages for Home
import HomeMain from "./components/home/HomeMain";
import VideoPlayer from "./components/home/VideoPlayer";

import ShortsMain from "./components/shorts/ShortsMain";
import PlaylistMain from "./components/playlists/PlaylistMain";

// import components and pages for Profile
import ProfileMain from "./components/profile/ProfileMain";
import UpdateAvatar from "./components/profile/UpdateAvatar";
import UpdateCoverImage from "./components/profile/UpdateCoverImage";
import UpdatePassword from "./components/profile/UpdatePassword";
import UpdateProfileData from "./components/profile/UpdateProfileData";

// import components and pages for Tweets
import TweetsMain from "./components/tweets/TweetsMain";
import MyTweets from "./components/tweets/MyTweets";
import UpdateTweets from "./components/tweets/UpdateTweets";

const App = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

// ThemedApp applies the theme to the entire app based on the current theme state
const ThemedApp = () => {
  const { theme } = useTheme(); 
  const online = UseOnlineStatus();

  return (
    <div className={theme === 'light' ? 'light-mode' : 'dark-mode'}>
      <div>
        {online ? (
          <Router>
            <Routes>
              {/* Public routes */}

              <Route path="*" element={<PageNotFound />} />

              {/* Protected routes with layout */}
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/tweets" element={<TweetsMain />} />
                <Route path="/tweets/user-tweets" element={<MyTweets />} />
                <Route path="/tweets/:tweetId" element={<UpdateTweets />} />
                
                <Route path="/playlists" element={<PlaylistMain />} />
                <Route path="/logout" element={<Logout />} />

                {/* <Route path="/profile" element={<ProfileMain />} /> */}
                <Route path="/profile" element={<ProfileMain />} />
                <Route path="/profile/update/avatar" element={<UpdateAvatar />} />
                <Route path="/profile/update/coverImage" element={<UpdateCoverImage />} />
                <Route path="/profile/update/profileData" element={<UpdateProfileData />} />
                <Route path="/profile/update/password" element={<UpdatePassword />} />

              </Route>

              <Route element={<Layout />}>
                <Route path="/" element={<HomeMain />} />
                <Route path="/description/watch/:videoId" element={<VideoPlayer />} />


                <Route path="/shorts" element={<ShortsMain />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

            </Routes>
          </Router>
        ) : (
          <OfflineStatusCard />
        )
        }
      </div>

    </div>
  );
};

export default App;
