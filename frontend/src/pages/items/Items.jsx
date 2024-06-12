import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Items.css';

function Items() {
    const { collectionId } = useParams();
    const [items, setItems] = useState([]);
    const [itemData, setItemData] = useState({
        name: '',
        tags: '',
    });
    const [customFields, setCustomFields] = useState([]);
    const [error, setError] = useState(null);
    const [fieldCounts, setFieldCounts] = useState({
        string: 0,
        number: 0,
        multiline: 0,
        date: 0,
        boolean: 0
    });
    const [tagSuggestions, setTagSuggestions] = useState([]);
    const [userInfo, setUserInfo] = useState({ isAdmin: false, userId: null });
    const [dropdownVisible, setDropdownVisible] = useState(true);
    const [likedItems, setLikedItems] = useState({});
    const [commentInput, setCommentInput] = useState('');
    const [comments, setComments] = useState({});

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`http://localhost:8081/collection/${collectionId}/items`);
                if (!response.ok) {
                    throw new Error('Failed to fetch items');
                }
                let responseData = await response.json();
                responseData = responseData.map(item => ({
                    ...item,
                    customFields: Array.isArray(item.customFields) ? item.customFields : JSON.parse(item.customFields),
                }));
                setItems(responseData);
                setError(null);

               
                responseData.forEach(item => fetchComments(item.id));
            } catch (error) {
                console.error('Error fetching items:', error);
                setError('Failed to fetch items');
            }
        };

        fetchItems();
    }, [collectionId]);

useEffect(() => {
  const fetchLikedItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/user/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Failed response:', text);
        throw new Error('Failed to fetch liked items');
      }

      const responseData = await response.json();
      if (!responseData || !responseData.likedItemIds) {
        throw new Error('Invalid response format');
      }

      setLikedItems(responseData.likedItemIds.reduce((acc, itemId) => {
        acc[itemId] = true;
        return acc;
      }, {}));
      setError(null);
    } catch (error) {
      console.error('Error fetching liked items:', error);
      setError(`Failed to fetch liked items: ${error.message}`);
    }
  };

  fetchLikedItems();
}, []);


    useEffect(() => {
        if (typeof itemData.tags === 'string' && itemData.tags.trim() !== '') {
            const fetchTags = async () => {
                try {
                    const response = await fetch(`http://localhost:8081/items/tags?query=${itemData.tags}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch tags');
                    }
                    const tagsData = await response.json();
                    setTagSuggestions(tagsData);
                    console.log('Tags fetched:', tagsData);
                } catch (error) {
                    console.error('Error fetching tags:', error);
                }
            };

            fetchTags();
        }
    }, [itemData.tags]);

    const toggleCommentInput = (itemId) => {
        setCommentInput(itemId === commentInput ? '' : itemId);
    };

    // Function to handle comment submission
    const handleSubmitComment = async (itemId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8081/items/${itemId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ comment: commentInput }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add comment');
            }

            // Logic to update comments state after successful comment submission

            setCommentInput(''); // Clear comment input field
        } catch (error) {
            console.error('Error adding comment:', error);
            // Handle error
        }
    };

    const fetchComments = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:8081/items/${itemId}/comments`);
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const commentsData = await response.json();
            console.log('Comments Data:', commentsData);
            setComments(prevComments => ({
                ...prevComments,
                [itemId]: commentsData,
            }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleChange = (event) => {
        setItemData(prevItemData => ({
            ...prevItemData,
            [event.target.name]: event.target.value,
        }));
        setDropdownVisible(true);
    };

    const handleCustomFieldNameChange = (index, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index].name = value;
        setCustomFields(updatedCustomFields);
    };

    const handleCustomFieldValueChange = (index, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index].value = value;
        setCustomFields(updatedCustomFields);
    };

    const handleDateChange = (index, field, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index][field] = value;

        const { year, month, day } = updatedCustomFields[index];
        updatedCustomFields[index].value = `${year}-${month}-${day}`;
        setCustomFields(updatedCustomFields);
    };

    const addCustomField = (fieldType) => {
        if (fieldCounts[fieldType] >= 3) {
            setError('Maximum of three fields allowed for each type');
            return;
        }

        setFieldCounts({
            ...fieldCounts,
            [fieldType]: fieldCounts[fieldType] + 1
        });

        setCustomFields([...customFields, { name: '', value: getDefaultFieldValue(fieldType), type: fieldType, year: '', month: '', day: '' }]);
    };

    const getDefaultFieldValue = (type) => {
        switch (type) {
            case 'string':
                return '';
            case 'number':
                return 0;
            case 'multiline':
                return '';
            case 'date':
                return '';
            case 'boolean':
                return false;
            default:
                return '';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8081/collection/${collectionId}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...itemData, customFields }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create item');
            }

            const responseData = await response.json();
            console.log('New item created:', responseData);
            setItems([...items, responseData]);
            setItemData({ name: '', tags: '' });
            setCustomFields([]);
            setError(null);

            setFieldCounts({
                string: 0,
                number: 0,
                multiline: 0,
                date: 0,
                boolean: 0
            });
        } catch (error) {
            console.error('Error creating item:', error);
            setError('Failed to create item: ' + error.message);
        }
    };

    const handleEdit = (itemId) => {
        // Implement edit functionality here
    };

    const handleDelete = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            console.log('Deleting item with ID:', itemId);

            const response = await fetch(`http://localhost:8081/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            console.log('Item deleted successfully:', itemId);
            setItems(items.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Failed to delete item: ' + error.message);
        }
    };

    const handleLike = async (itemId) => {
        const isLiked = likedItems[itemId];
        try {
            const token = localStorage.getItem('token');
            const method = isLiked ? 'DELETE' : 'POST';
            const url = isLiked ? `http://localhost:8081/items/${itemId}/unlike` : `http://localhost:8081/items/${itemId}/like`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || (isLiked ? 'Failed to unlike item' : 'Failed to like item'));
            }

            const responseData = await response.json();
            console.log(isLiked ? 'Item unliked:' : 'Item liked:', responseData);

            setLikedItems(prevLikedItems => ({
                ...prevLikedItems,
                [itemId]: !isLiked,
            }));
        } catch (error) {
            console.error(isLiked ? 'Error unliking item:' : 'Error liking item:', error);
            setError(isLiked ? 'Failed to unlike item: ' + error.message : 'Failed to like item: ' + error.message);
        }
    };

    return (
        <div className="container my-5 color-bg color-text">
            <h2 className="text-center mb-4 color-text">Items for Collection ID: {collectionId}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <ul className="list-group mb-4">
                {items.map((item) => (
                    <li key={item.id} className="list-group-item mb-2 color-bg color-text">
                        <div><strong>Name:</strong> {item.name}</div>
                        <div><strong>Tags:</strong> {item.tags}</div>
                        {comments[item.id] && comments[item.id].length > 0 && (
                            <div>
                                <strong>Comments:</strong>
                                <ul>
                                    {comments[item.id].map((comment, index) => (
                                        <li key={index}>{comment.comment}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {item.customFields && (
                            <ul className="list-unstyled mt-2">
                                {item.customFields.map((field, index) => (
                                    <li key={index} className="mb-1">
                                        <div><strong>{field.name}:</strong> {field.type === 'boolean' ? (field.value ? 'Yes' : 'No') : field.value}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="item-actions">
                            <button onClick={() => handleEdit(item.id)} className="btn btn-dark me-2">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-dark me-2">Delete</button>
                            <button
                                className={`btn ${likedItems[item.id] ? 'btn-success' : 'btn-light'} like-button`}
                                onClick={() => handleLike(item.id)}
                            >
                                <i className="fas fa-heart"></i> {likedItems[item.id] ? 'Liked' : 'Like'}
                            </button>
                            <button className="btn btn-light comment-button" onClick={() => toggleCommentInput(item.id)}>
                                <i className="fas fa-comment"></i> Comment
                            </button>

                            {commentInput === item.id && ( // Display comment input field only if commentInput is equal to item ID
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        className="form-control"
                                        placeholder="Write your comment..."
                                    />
                                    <button
                                        className="btn btn-dark mt-2"
                                        onClick={() => handleSubmitComment(item.id)}
                                    >
                                        Submit
                                    </button>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <h2 className="mt-4 mb-3 text-center color-text">Create an Item</h2>

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="name" className="form-label color-text">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={itemData.name}
                            onChange={handleChange}
                            className="form-control color-bg color-text"
                            required
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <label htmlFor="tags" className="form-label color-text">Tags:</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={itemData.tags}
                            onChange={handleChange}
                            className="form-control color-bg color-text"
                            autoComplete="off"
                            required
                        />
                        <div className="autocomplete-dropdown" style={{ display: dropdownVisible ? 'block' : 'none' }}>
                            {tagSuggestions.length > 0 && tagSuggestions.map((tag, index) => (
                                <div
                                    key={index}
                                    className="px-2 py-1 border-bottom"
                                    onClick={() => {
                                        setItemData(prevItemData => ({
                                            ...prevItemData,
                                            tags: tag
                                        }));
                                        setDropdownVisible(false);
                                    }}
                                >
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {customFields.map((field, index) => (
                    <div className="row mb-3" key={index}>
                        <div className="col-md-6">
                            <label htmlFor={`customFieldName-${index}`} className="form-label color-text">Custom Field Name:</label>
                            <input
                                type="text"
                                id={`customFieldName-${index}`}
                                value={field.name}
                                onChange={(e) => handleCustomFieldNameChange(index, e.target.value)}
                                className="form-control color-bg color-text"
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor={`customFieldValue-${index}`} className="form-label color-text mt-2">Custom Field Value:</label>
                            {field.type === 'multiline' ? (
                                <textarea
                                    id={`customFieldValue-${index}`}
                                    value={field.value}
                                    onChange={(e) => handleCustomFieldValueChange(index, e.target.value)}
                                    className="form-control color-bg color-text"
                                />
                            ) : field.type === 'boolean' ? (
                                <div className="form-check mt-2">
                                    <input
                                        type="checkbox"
                                        id={`customFieldValue-${index}`}
                                        checked={field.value}
                                        onChange={(e) => handleCustomFieldValueChange(index, e.target.checked)}
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label color-text" htmlFor={`customFieldValue-${index}`}>Yes</label>
                                </div>
                            ) : field.type === 'date' ? (
                                <div className="d-flex mt-2">
                                    <select
                                        value={field.month}
                                        onChange={(e) => handleDateChange(index, 'month', e.target.value)}
                                        className="form-select me-2 color-bg color-text"
                                    >
                                        <option value="">Month</option>
                                        {[...Array(12).keys()].map(i => (
                                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={field.day}
                                        onChange={(e) => handleDateChange(index, 'day', e.target.value)}
                                        className="form-select me-2 color-bg color-text"
                                    >
                                        <option value="">Day</option>
                                        {[...Array(31).keys()].map(i => (
                                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={field.year}
                                        onChange={(e) => handleDateChange(index, 'year', e.target.value)}
                                        className="form-select color-bg color-text"
                                    >
                                        <option value="">Year</option>
                                        {[...Array(50).keys()].map(i => (
                                            <option key={i + 1970} value={i + 1970}>{i + 1970}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    id={`customFieldValue-${index}`}
                                    value={field.value}
                                    onChange={(e) => handleCustomFieldValueChange(index, e.target.value)}
                                    className="form-control color-bg color-text"
                                />
                            )}
                        </div>
                    </div>
                ))}

                <div className="d-flex flex-wrap">
                    <button type="button" className="btn btn-outline-dark me-2 mb-2" onClick={() => addCustomField('string')}>Add Text</button>
                    <button type="button" className="btn btn-outline-dark me-2 mb-2" onClick={() => addCustomField('number')}>Add Number</button>
                    <button type="button" className="btn btn-outline-dark me-2 mb-2" onClick={() => addCustomField('multiline')}>Add Description</button>
                    <button type="button" className="btn btn-outline-dark me-2 mb-2" onClick={() => addCustomField('date')}>Add Date</button>
                    <button type="button" className="btn btn-outline-dark me-2 mb-2" onClick={() => addCustomField('boolean')}>Add Checkbox</button>
                </div>

                <button type="submit" className="btn btn-dark mt-3">Create</button>
            </form>
        </div>
    );
}

export default Items;
