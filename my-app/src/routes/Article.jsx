import React, { useState } from 'react'; // Import React and useState hook
import { TextArea, Form } from 'semantic-ui-react'; // Import TextArea and Form components from Semantic UI
import ImageUploadComponent from '../ImageUpload'; // Import ImageUploadComponent for handling image uploads
import { db } from '../utils/firebase'; // Import Firebase database configuration
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions for data manipulation
import '../css/PostPage.css'; // Import CSS styles for the PostPage

// Component for handling tag input
const TagInput = ({ tags, setTags }) => {
  const [currentTag, setCurrentTag] = useState(''); // State for managing the current tag input

  // Function to add a tag to the list of tags
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) { // Check if the tag is not empty and not already added
      setTags((prevTags) => [...prevTags, currentTag]); // Update the tags state
      setCurrentTag(''); // Reset the current tag input
    }
  };

  // Handle key down events for adding tags
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTag(); // Add tag on pressing Enter
  };

  return (
    <div>
      <input
        type="text" // Input for tag entry
        value={currentTag} // Controlled input value
        onChange={(e) => setCurrentTag(e.target.value)} // Update currentTag state on change
        onKeyDown={handleKeyDown} // Attach key down event handler
        placeholder="Add a tag" // Placeholder for the input
        style={{ width: '80%', padding: '10px', borderRadius: '5px', marginRight: '10px' }} // Inline styles for input
      />
      <button type="button" onClick={handleAddTag} style={{ padding: '10px 15px', borderRadius: '5px' }}>
        + {/* Button for adding tag */}
      </button>
      <div style={{ marginTop: '10px' }}>
        {/* Display added tags */}
        {tags.map((tag, index) => (
          <span key={index} style={{ display: 'inline-block', background: '#e0e0e0', borderRadius: '12px', padding: '5px 10px', margin: '5px' }}>
            {tag} {/* Show each tag */}
          </span>
        ))}
      </div>
    </div>
  );
};

// Main Article component for creating and submitting an article
const Article = () => {
  // State for article title, abstract, body, tags, image URLs, and loading status
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to handle image upload and update the imageUrls state
  const handleImageUpload = (url) => {
    setImageUrls((prev) => [...prev, url]); // Append new image URL to the list
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    // Validate required fields
    if (!title || !abstract || !body) {
      alert('Please fill out all required fields.'); // Alert user to fill all fields
      return;
    }

    // Retrieve user's email from local storage
    const userEmail = localStorage.getItem('userEmail');

    try {
      setLoading(true); // Set loading state to true while submitting
      // Create article data object
      const articleData = { title, abstract, body, tags, imageUrls, userEmail, createdAt: new Date() };
      // Add document to Firestore collection
      const docRef = await addDoc(collection(db, 'posts'), articleData);
      alert('Article successfully added!'); // Notify user of successful submission

      // Reset form fields after successful submission
      setTitle(''); // Reset title
      setAbstract(''); // Reset abstract
      setBody(''); // Reset body
      setTags([]); // Reset tags
      setImageUrls([]); // Reset image URLs
    } catch (error) {
      console.error('Error adding document:', error); // Log any error that occurs during submission
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className='PostSection'> {/* Container for the post section */}
      <Form onSubmit={handleSubmit}> {/* Semantic UI Form component for submission */}
        <Form.Field>
          <label style={{ color: 'white' }}>Title</label>
          <input 
            placeholder="Enter article title" // Placeholder for title input
            value={title} // Controlled input value
            onChange={(e) => setTitle(e.target.value)} // Update title state on change
            style={{ width: '100%', padding: '10px', borderRadius: '12px' }} // Inline styles for input
          />
        </Form.Field>

        <Form.Field>
          <label style={{ color: 'white' }}>Abstract</label>
          <TextArea 
            placeholder="Enter a 1 paragraph abstract" // Placeholder for abstract input
            value={abstract} // Controlled input value
            onChange={(e) => setAbstract(e.target.value)} // Update abstract state on change
            style={{ minHeight: 50, width: '100%', borderRadius: '12px' }} // Inline styles for textarea
          />
        </Form.Field>

        <Form.Field>
          <label style={{ color: 'white' }}>Article Text</label>
          <TextArea 
            placeholder="Enter the full article text" // Placeholder for body input
            value={body} // Controlled input value
            onChange={(e) => setBody(e.target.value)} // Update body state on change
            style={{ minHeight: 400, width: '100%', borderRadius: '12px' }} // Inline styles for textarea
          />
        </Form.Field>

        <ImageUploadComponent onUpload={handleImageUpload} /> {/* Image upload component */}

        {/* Image preview section */}
        <div className="uploaded-images" style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
          {imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Uploaded ${index}`} style={{ width: '100px', height: '100px', margin: '10px', borderRadius: '8px' }} />
          ))}
        </div>

        {/* Tags input component */}
        <TagInput tags={tags} setTags={setTags} /> {/* Pass tags and setter function to TagInput */}

        <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', borderRadius: '5px' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Article'} {/* Change button text based on loading state */}
        </button>
      </Form>
    </div>
  );
};

export default Article; // Export the Article component for use in other parts of the application
