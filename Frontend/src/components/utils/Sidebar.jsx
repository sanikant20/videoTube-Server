import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Offcanvas, Navbar, Button } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const token = localStorage.getItem('accessToken');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      {/* Navbar for small screens */}
      <Navbar expand="lg" className={`d-lg-none w-100 ${theme === 'light' ? 'navbar-light bg-light' : 'navbar-dark bg-dark'}`}>
        <div className="container-fluid">
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleShow} />
          <Navbar.Brand>
            <h2>
              <Link to="/" className={`text-decoration-none ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                VideoTube
              </Link>
            </h2>
          </Navbar.Brand>
        </div>
      </Navbar>

      {/* Sidebar for larger screens */}
      <div className={`pt-4 p-3 d-none d-lg-block shadow-lg ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`} style={{ width: '250px', height: '100vh' }}>
        <h2>
          <Link to="/" className={`text-decoration-none ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
            VideoTube
          </Link>
        </h2>
        <hr />
        <ul className="nav flex-column font-weight-bold">
          <li className={`nav-item ${isActive("/")}`}>
            <Link to="/" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/")}`}>
              <i className="fas fa-home me-2"></i> Home
            </Link>
          </li>
          <li className={`nav-item ${isActive("/shorts")}`}>
            <Link to="/shorts" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/shorts")}`}>
              <i className="fas fa-video me-2"></i> Shorts
            </Link>
          </li>


          {token && (
            <>
              <li className={`nav-item ${isActive("/tweets")}`}>
                <Link to="/tweets" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/tweets")}`}>
                  <i className="fas fa-comment me-2"></i> Tweets
                </Link>
              </li>
              <li className={`nav-item ${isActive("/playlists")}`}>
                <Link to="/playlists" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/playlists")}`}>
                  <i className="fas fa-list me-2"></i> Playlists
                </Link>
              </li>
              <li className={`nav-item ${isActive("/profile")}`}>
                <Link to="/profile" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/profile")}`}>
                  <i className="fas fa-user me-2"></i> Profile
                </Link>
              </li>
              <li className={`nav-item ${isActive("/logout")}`}>
                <Link to="/logout" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/logout")}`}>
                  <i className="fas fa-sign-out-alt me-2"></i> Logout
                </Link>
              </li>
            </>
          )}
          {!token && (
            <>
              <li className={`nav-item ${isActive("/login")}`}>
                <Link to="/login" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/login")}`}>
                  <i className="fas fa-sign-in-alt me-2"></i> Login
                </Link>
              </li>
              <li className={`nav-item ${isActive("/register")}`}>
                <Link to="/register" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/register")}`}>
                  <i className="fas fa-user-plus me-2"></i> Register
                </Link>
              </li>
            </>
          )}
          <li>
            <Button variant="light"
              onClick={toggleTheme} className={`theme-toggle-btn ${theme === 'light' ? 'btn-dark text-light' : 'btn-light text-dark'} w-100 mt-2 text-start`}>
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} me-2`}></i>
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>{' '}
          </li>
        </ul>
      </div>

      {/* Offcanvas (Sidebar) for small screens */}
      <Offcanvas show={show} onHide={handleClose} className={`pt-4 w-100 h-100 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white'}`}>

        <Offcanvas.Header closeButton>
          <Offcanvas.Title>VideoTube</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <ul className="nav flex-column">
            <li className={`nav-item ${isActive("/")}`}>
              <Link to="/" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/")}`} onClick={handleClose}>
                <i className="fas fa-home-alt me-2"></i> Home
              </Link>
            </li>
            <li className={`nav-item ${isActive("/shorts")}`}>
              <Link to="/shorts" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/shorts")}`} onClick={handleClose}>
                <i className="fas fa-video me-2"></i> Shorts
              </Link>
            </li>


            {token && (
              <>
                <li className={`nav-item ${isActive("/tweets")}`}>
                  <Link to="/tweets" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/tweets")}`} onClick={handleClose}>
                    <i className="fas fa-comment me-2"></i> Tweets
                  </Link>
                </li>
                <li className={`nav-item ${isActive("/playlists")}`}>
                  <Link to="/playlists" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/playlists")}`} onClick={handleClose}>
                    <i className="fas fa-list me-2"></i> Playlists
                  </Link>
                </li>
                <li className={`nav-item ${isActive("/profile")}`}>
                  <Link to="/profile" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/profile")}`} onClick={handleClose}>
                    <i className="fas fa-user me-2"></i> Profile
                  </Link>
                </li>
                <li className={`nav-item ${isActive("/logout")}`}>
                  <Link to="/logout" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/logout")}`}>
                    <i className="fas fa-sign-out-alt me-2"></i> Logout
                  </Link>
                </li>
              </>
            )}
            {!token && (
              <>
                <li className={`nav-item ${isActive("/login")}`}>
                  <Link to="/login" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/login")}`} onClick={handleClose}>
                    <i className="fas fa-sign-in-alt me-2"></i> Login
                  </Link>
                </li>
                <li className={`nav-item ${isActive("/register")}`}>
                  <Link to="/register" className={`nav-link ${theme === 'light' ? 'text-dark' : 'text-white'} ${isActive("/register")}`} onClick={handleClose}>
                    <i className="fas fa-user-plus me-2"></i> Register
                  </Link>
                </li>
              </>
            )}
            <li >
              <Button
                onClick={() => {
                  toggleTheme();
                  handleClose();
                }}
                className={`theme-toggle-btn ${theme === 'light' ? 'btn-dark text-light' : 'btn-light text-dark'} w-100 text-start`}

              >
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} me-2`}></i>
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </Button>{' '}
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas >
    </>
  );
};

export default Sidebar;
