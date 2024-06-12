import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import {jwtDecode} from 'jwt-decode'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

function Home() {
  const [data, setData] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch('http://localhost:8081/collection');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const responseData = await response.json();

        if (!Array.isArray(responseData)) {
          throw new Error('Invalid data format');
        }

        setData(responseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    getData();
  }, []);

  const handleMyCollections = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      navigate(`/user-collections/${userId}`);
    }
  };

  return (
    <div className="container">
      <div className="row">
        {data.map((item, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div className="card">
              <img src={item.image} className="card-img-top" alt={item.name} />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">{item.description}</p>
                <p className="card-text"><strong>Category:</strong> {item.category}</p>
                <Link to={`/collection/${item.id}/items`} className="btn btn-dark me-2">View Collection</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isAuthenticated && (
        <div className="row mt-4">
          <div className="col text-center">
            <Link to="/create" className="btn btn-dark me-2">Create Collection</Link>
            <button onClick={handleMyCollections} className="btn btn-dark">My Collections</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
