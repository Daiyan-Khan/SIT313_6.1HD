import React, { useState } from 'react';
import { TextArea, Form } from 'semantic-ui-react';
import ImageUploadComponent from '../ImageUpload'; 
import { db } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import '../css/PostPage.css';

/**
 * Question component allows users to submit questions with a title, description, tags, and images.
 */
const Question = () => {
  // State variables for managing title, description, tags, current tag input, image URLs, and loading status
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Handles image upload and updates the image URLs state.
   * @param {string} url - The uploaded image URL.
   */
  const handleImageUpload = (url) => {
    setImageUrls((prev) => [...prev, url]);
  };

  /**
   * Adds the current tag to the tags array if it is not already present.
   */
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags((prevTags) => [...prevTags, currentTag]);
      setCurrentTag('');
    }
  };

  /**
   * Handles the submission of the question form.
   * @param {Object} e - The event object for the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const userEmail = localStorage.getItem('userEmail'); // Retrieve user's email from localStorage

    try {
      setLoading(true); // Set loading state to true
      // Prepare question data for submission
      const questionData = {
        title,
        description,
        tags,
        imageUrls,
        userEmail,
        createdAt: new Date(),
      };
      // Add question data to Firestore
      const docRef = await addDoc(collection(db, 'questions'), questionData);
      console.log('Question successfully written with ID: ', docRef.id);
      // Reset form fields after successful submission
      setDescription('');
      setTags([]);
      setImageUrls([]);
    } catch (error) {
      console.error('Error adding document: ', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className='PostSection'>
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label style={{ color: 'white' }}>Title</label>
          <input 
            placeholder="Enter article title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ 
              width: '100%', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '12px', 
              padding: '10px',
              border: '1px solid #ccc',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' 
            }} 
          />
        </Form.Field>
        <Form.Field>
          <label style={{ color: 'white' }}>Describe your problem:</label>
          <TextArea 
            placeholder="Enter a description of your issue" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ minHeight: 400, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px' }} 
          />
        </Form.Field>

        {/* Component for uploading images */}
        <ImageUploadComponent onUpload={handleImageUpload} />
        
        {/* Display uploaded images */}
        <div className="uploaded-images" style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
          {imageUrls.map((url, index) => (
            <img 
              key={index} 
              src={url} 
              alt={`Uploaded ${index}`} 
              style={{ width: '100px', height: '100px', margin: '10px', borderRadius: '8px' }} 
              onError={(e) => { e.target.src = 'fallback-image.png'; }} // Handle image load error
            />
          ))}
        </div>

        {/* Tag input section */}
        <div style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            value={currentTag} 
            onChange={(e) => setCurrentTag(e.target.value)} 
            placeholder="Add a tag" 
            style={{ 
              width: '80%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              marginRight: '10px'
            }} 
          />
          <button type="button" onClick={handleAddTag} style={{ padding: '10px 15px', borderRadius: '5px' }}>
            +
          </button>
        </div>

        {/* Display added tags */}
        <div style={{ marginTop: '10px' }}>
          {tags.map((tag, index) => (
            <span key={index} style={{ 
              display: 'inline-block', 
              background: '#e0e0e0', 
              borderRadius: '12px', 
              padding: '5px 10px', 
              margin: '5px'
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Submit button for the form */}
        <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', borderRadius: '5px' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
      </Form>
    </div>
  );
};

export default Question;
