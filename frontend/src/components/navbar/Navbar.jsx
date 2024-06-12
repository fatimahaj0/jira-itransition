import React from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SignOut from '../../pages/signout/SignOut';


function Navbar({ theme, setTheme }) {
  const { isAuthenticated } = useAuth();
  
  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="container">
      <div className="navbar">
        <ul>
          <li className="fs-18">
            <Link to="/">Home</Link>
          </li>
          { isAuthenticated ? (
            <li className="fs-18">
              <SignOut />
            </li>
          ) : (
            <li className="fs-18">
              <Link to="/signin">Sign In</Link>
            </li>
          )}
        </ul>
        <div className="search">
          <input type="text" placeholder="Search" />
        </div>
        <div className="toggle-container" onClick={switchTheme}>
          <FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} className={theme === 'dark' ? 'moon-icon' : ''} />
        </div>
       
    
      </div>
    </div>
  );
}

export default Navbar;
