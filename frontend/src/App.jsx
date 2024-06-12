import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { AuthProvider, useAuth } from './components/AuthContext';
import AdminPanel from './pages/adminpanel/Adminpanel';
import Home from './pages/home/Home';
import SignIn from './pages/signin/Signin';
import SignUp from './pages/signup/SignUp';
import Items from './pages/items/Items';
import CreateItem from './pages/items/CreateItem';
import Collection from './pages/collection/Collection';
import Users from './pages/Users';
import UserCollection from './pages/collection/UserCollection';
import EditCollection from './pages/collection/EditCollection';
import CreateTicket from './pages/ticket/CreateTicket';
import TicketList from './pages/ticket/TicketList'; 

const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const decodedToken = jwtDecode(token);
    return decodedToken.isAdmin;
  }
  return false;
};

const isUser = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const AdminRoute = ({ children }) => {
  console.log('Checking authentication for admin route...');
  const { isAuthenticated } = useAuth();
  console.log('IsAuthenticated:', isAuthenticated);
  return isAdmin() ? children : <Navigate to="/" />;
};

const PrivateRoute = ({ children }) => {
  console.log('Checking authentication for private route...');
  const { isAuthenticated } = useAuth();
  console.log('IsAuthenticated:', isAuthenticated);
  return isUser() ? children : <Navigate to="/" />;
};

function App() {
  const [theme, setTheme] = useState('light');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUser(decodedToken);
    }
  }, []);

  return (
    <AuthProvider>
      <div className="app">
        <Navbar theme={theme} setTheme={setTheme} />
        <CreateTicket currentUser={currentUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin-panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/collection/:collectionId/items" element={<Items />} />
          <Route path="/collection/:collectionId/items/create" element={<CreateItem />} />
          <Route path="/create" element={<PrivateRoute><Collection /></PrivateRoute>} />
          <Route path="/users-with-collections" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/my-collection" element={<PrivateRoute><UserCollection /></PrivateRoute>} />
          <Route path="/user-collections/:userId" element={<UserCollection />} />
          <Route path="/edit/:collectionId" element={<PrivateRoute><EditCollection /></PrivateRoute>} />
		   <Route path="/fetch-tickets" element={<TicketList />} />
		
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
