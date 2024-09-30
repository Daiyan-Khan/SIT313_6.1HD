import React, { useState } from 'react';
import { storage } from './utils/firebase'; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * @component VideoUpload
 * 
 * This component allows users to upload videos to Firebase Storage.
 * It takes a prop `onUpload` which is a function that will be called with 
 * the download URL of the uploaded video.
 * 
 * @param {Object} props - The component props
 * @param {function} props.onUpload - Callback function to handle the uploaded video URL
 */

const VideoUpload = ({ onUpload }) => {
  const [videoFiles, setVideoFiles] = useState([]); // State to hold selected video files
  const [isUploading, setIsUploading] = useState(false); // State to track upload status

  /**
   * Handles the video upload process.
   * It creates a reference in Firebase Storage, uploads the file, 
   * and retrieves the download URL.
   * 
   * @async
   * @function handleVideoUpload
   * @param {File} file - The video file to upload
   */
  const handleVideoUpload = async (file) => {
    const storageRef = ref(storage, `videos/${file.name}`); // Create a reference to the storage location
    setIsUploading(true); // Set uploading state to true
    await uploadBytes(storageRef, file); // Upload the file
    const url = await getDownloadURL(storageRef); // Get the download URL
    onUpload(url); // Call the onUpload prop to update the URLs in the parent
    setIsUploading(false); // Set uploading state to false after completion
  };

  /**
   * Handles file input change events.
   * It updates the state with the selected files and uploads each video.
   * 
   * @async
   * @function handleFileChange
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = (event) => {
    const files = event.target.files; // Get the selected files
    setVideoFiles(files); // Update the state with selected files
    for (let i = 0; i < files.length; i++) {
      handleVideoUpload(files[i]); // Upload each video
    }
  };

  return (
    <div>
      {/* File input for selecting videos, accepts multiple files */}
      <input 
        type="file" 
        accept="video/*" // Accept only video files
        multiple // Allow multiple file selection
        onChange={handleFileChange} // Handle file input change
      />
      {/* Change button text based on uploading status */}
      <button disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
};

export default VideoUpload;
