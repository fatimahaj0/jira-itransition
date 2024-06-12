import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserCollection.css'; 

const UserCollection = () => {
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();
  const { userId } = useParams(); 

  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`http://localhost:8081/users/${userId}/collections`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setCollections(response.data);
        } catch (error) {
          console.error('Error fetching collections:', error);
        }
      }
    };

    fetchCollections();
  }, [userId]);

  const handleEdit = (collectionId) => {
    navigate(`/edit/${collectionId}`);
  };

  const handleDelete = async (collectionId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8081/collection/${collectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setCollections(prevCollections => prevCollections.filter(collection => collection.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h2 className="text-center">User Collections</h2>
        <Link to={`/create?userId=${userId}`} className="btn btn-dark">Create Collection</Link>
      </div>
      {collections.length > 0 ? (
        <div className="row">
          {collections.map(collection => (
            <div className="col-md-4 mb-4" key={collection.id}>
              <div className="card h-100">
                <img src={collection.image} className="card-img-top" alt={collection.name} />
                <div className="card-body d-flex flex-column color-bg">
                  <h5 className="card-title color-text">{collection.name}</h5>
                  <p className="card-text color-text">{collection.description}</p>
                  <p className="card-text color-text"><strong>Category:</strong> {collection.category}</p>
                  <div className="mt-auto d-flex justify-content-between">
                    <button onClick={() => handleEdit(collection.id)} className="btn btn-dark me-2">Edit</button>
                    <button onClick={() => handleDelete(collection.id)} className="btn btn-dark">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">This user has no collections.</p>
      )}
    </div>
  );
};

export default UserCollection;
