import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateTicket.css';

const CreateTicket = () => {
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState('Low');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting ticket with the following data:', {
      summary,
      priority,
     
      link: window.location.href
    });

    try {
      const response = await axios.post('http://localhost:8081/create-ticket', {
        summary,
        priority,
        
        link: window.location.href
      });

      console.log('Response from server:', response);
      setMessage(`Ticket created: ${response.data.ticketUrl}`);
      setShowForm(false);
    } catch (error) {
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setMessage('Error creating ticket. Please try again.');
    }
  };

  useEffect(() => {
    console.log('Form visibility changed:', showForm);
  }, [showForm]);

  const handleButtonClick = () => {
    setShowForm(prevShowForm => !prevShowForm);
  };

  return (
    <div className="create-ticket">
      <button className="black-button" onClick={handleButtonClick}>Help</button>
      {showForm && (
        <div className="modal">
          <h2>Create Support Ticket</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Summary:</label>
              <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} required />
            </div>
            
            <button type="submit">Create Ticket</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default CreateTicket;
