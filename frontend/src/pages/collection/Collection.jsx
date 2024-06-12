import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';

const Collection = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    image: ''
  });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:8081/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const handleChange = (event) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
    console.log('Form Data:', formData);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
   
    console.log('isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
    
      navigate('/login');
      return;
    }

    const formDataWithFile = new FormData();
    formDataWithFile.append('file', file);
    formDataWithFile.append('upload_preset', 'oe8ddeiz');

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dfvr0vyzm/image/upload', formDataWithFile);
      const imageUrl = response.data.secure_url;

      const searchParams = new URLSearchParams(location.search);
      const userId = searchParams.get('userId'); 

      const collectionData = {
        ...formData,
        image: imageUrl,
        userId 
      };

      await axios.post('http://localhost:8081/create', collectionData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setFormData({
        name: '',
        description: '',
        categoryId: '',
        image: ''
      });

      setImageUrl(imageUrl);
      navigate('/user-collections');
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
    }
  }

  return (
    <div className="container">
      <h2 className="mt-4 mb-3 text-center">Create a Collection</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category:</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            value={formData.categoryId} 
            onChange={handleChange} 
            className="form-control" 
            required 
          >
            {categories.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image:</label>
          <input 
            type="file" 
            id="image" 
            name="image" 
            onChange={handleFileChange} 
            className="form-control" 
            required 
          />
        </div>
        {imageUrl && (
          <div className="mb-3">
            <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )}
        <button type="submit" className="btn btn-dark">Create</button>
      </form>
	 
    </div>
  );
};

export default Collection;
