import React from 'react';
import { storage } from './utils/firebase'; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * @component ImageUpload
 * 
 * This component allows users to upload images to Firebase Storage.
 * It takes a prop `onUpload` which is a function that will be called with 
 * the download URL of the uploaded image.
 * 
 * @param {Object} props - The component props
 * @param {function} props.onUpload - Callback function to handle the uploaded image URL
 */

const ImageUpload = ({ onUpload }) => {
  
  /**
   * Handles the image upload process.
   * It creates a reference in Firebase Storage, uploads the file, 
   * and retrieves the download URL.
   * 
   * @async
   * @function handleImageUpload
   * @param {File} file - The image file to upload
   */
  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`); // Create a reference to the storage location
    await uploadBytes(storageRef, file); // Upload the file
    const url = await getDownloadURL(storageRef); // Get the download URL
    onUpload(url); // Call the onUpload prop to update the URLs in parent
  };

  /**
   * Handles file input change events.
   * It uploads each selected file by calling `handleImageUpload`.
   * 
   * @async
   * @function handleFileChange
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = async (event) => {
    const files = event.target.files; // Get the selected files
    for (let i = 0; i < files.length; i++) {
      await handleImageUpload(files[i]); // Upload each file and get URL
    }
  };

  return (
    <div>
      {/* File input for selecting images, accepts multiple files */}
      <input 
        type="file" 
        accept="image/*" // Accept only image files
        multiple // Allow multiple file selection
        onChange={handleFileChange} // Handle file input change
      />
    </div>
  );
};

export default ImageUpload;