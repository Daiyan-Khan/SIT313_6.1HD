import React, { useState } from 'react';
import { storage } from './utils/firebase'; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './utils/firebase'; // Import your Firestore instance
import { collection, addDoc } from 'firebase/firestore';
import './css/VideoUpload.css'; // Import your CSS styles

const VideoUpload = ({ onUpload }) => {
  const [videoFiles, setVideoFiles] = useState([]); // Initialize as an empty array
  const [videoTitle, setVideoTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to an array
    setVideoFiles(files); // Set videoFiles as an array of files
  };

  const handleUploadClick = async () => {
    if (videoFiles.length === 0) return; // No files to upload
    setIsUploading(true);
  
    try {
      // Map through videoFiles and return an array of upload promises
      const uploadPromises = videoFiles.map(async (file) => {
        const storageRef = ref(storage, `videos/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
  
        // Add video to Firestore with upvotes and downvotes initialized to 0
        await addDoc(collection(db, 'videos'), {
          title: videoTitle,
          url: url,
          views: 0,
          upvotes: 0,      // Initialize upvotes to 0
          downvotes: 0,    // Initialize downvotes to 0
          createdAt: new Date(),
        });
  
        return url; // Return the video URL
      });
  
      // Wait for all the uploads to finish
      const uploadedUrls = await Promise.all(uploadPromises);
      uploadedUrls.forEach((url) => onUpload(url)); // Handle each uploaded video URL
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      setVideoTitle(''); // Reset title after upload
      setVideoFiles([]); // Clear the videoFiles array
    }
  };
  
  return (
    <div className="upload-container">
      <input 
        type="text" 
        placeholder="Enter video title" 
        value={videoTitle} 
        onChange={(e) => setVideoTitle(e.target.value)} 
        required 
      />
      <input 
        type="file" 
        accept="video/*" 
        multiple 
        onChange={handleFileChange} 
      />
      <button 
        onClick={handleUploadClick} 
        disabled={isUploading || !videoTitle}
      >
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
};

export default VideoUpload;
