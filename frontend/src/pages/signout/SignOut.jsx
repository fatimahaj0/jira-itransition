import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../components/AuthContext';
import "./style.css";


const SignOut = () => {
	const { toggleAuth } = useAuth();
	
  const handleSignOut = async () => {
    try {
		localStorage.removeItem('token');
		toggleAuth(false);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <button onClick={handleSignOut} className="fs-18 color-text">Sign Out</button>
  );
};

export default SignOut;
