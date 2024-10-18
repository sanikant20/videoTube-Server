import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from './components/context/ThemeContext'; // Import Theme Context

import PageNotFound from "./components/utils/PageNotFound";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import Layout from "./components/auth/Layout";
import PrivateRoute from "./components/auth/PrivateRoute";

import HomeMain from "./components/home/HomeMain";
import ShortsMain from "./components/shorts/ShortsMain";
import PlaylistMain from "./components/playlists/PlaylistMain";
import ProfileMain from "./components/profile/ProfileMain";
import TweetsMain from "./components/tweets/TweetsMain";

const App = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

// ThemedApp applies the theme to the entire app based on the current theme state
const ThemedApp = () => {
  const { theme } = useTheme();  // Get current theme from context

  return (
    <div className={theme === 'light' ? 'light-mode' : 'dark-mode'}>
      <Router>
        <Routes>
          {/* Public routes */}

          <Route path="*" element={<PageNotFound />} />

          {/* Protected routes with layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/tweets" element={<TweetsMain />} />
            <Route path="/playlists" element={<PlaylistMain />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/" element={<HomeMain />} />
            <Route path="/shorts" element={<ShortsMain />} />
            <Route path="/profile" element={<ProfileMain />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

        </Routes>
      </Router>
    </div>
  );
};

export default App;
