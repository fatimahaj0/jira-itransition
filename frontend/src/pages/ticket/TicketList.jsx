import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const TicketList = () => {
    const [tickets, setTickets] = useState([]); 
    const [loading, setLoading] = useState(true);
    const JIRA_DOMAIN = 'fatimagojo.atlassian.net';

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://localhost:8081/fetch-tickets');
                console.log('Response from fetchTickets:', response);

                setTickets(response.data.issues);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tickets:', error.response ? error.response.data : error.message);
            }
        };

        fetchTickets();
    }, []);

    console.log('Tickets state:', tickets); 

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Tickets</h2>
            <div className="row">
                {tickets.map(ticket => (
                    <div className="col-md-4 mb-4" key={ticket.key}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{ticket.summary}</h5>
                                <p className="card-text">
                                    <strong>Key:</strong> {ticket.key}<br/>
                                    <strong>Status:</strong> {ticket.status}<br/>
                                    <strong>Link:</strong> {ticket.link !== 'No link provided' ? (
                                        <a href={ticket.link} target="_blank" rel="noopener noreferrer">{ticket.link}</a>
                                    ) : ticket.link}
                                </p>
                                <a href={`https://${JIRA_DOMAIN}/browse/${ticket.key}`} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                                    View Ticket
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketList;
