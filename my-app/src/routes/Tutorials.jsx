// Tutorials.jsx
import React, { useState, useEffect } from 'react';
import VideoCard from '../VideoCard'; // Component to display individual videos
import '../css/Tutorials.css'; // Styles specific to the Tutorials component
import { getVideoData, saveVideoData } from '../utils/firebase'; // Firebase utility functions
import VideoUpload from '../VideoUpload'; // Import VideoUpload component

const Tutorials = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch videos from Firebase on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      const videoData = await getVideoData(); // Fetch video data from your database
      setVideos(videoData);
    };
    fetchVideos();
  }, []);

  // Handle the uploaded video URL and save it to the database
  const handleVideoUpload = async (videoURL) => {
    setUploading(true);
    try {
      await saveVideoData(videoURL); // Save the video URL to your database
      const updatedVideos = await getVideoData(); // Fetch updated video data
      setVideos(updatedVideos); // Update the videos list
    } catch (error) {
      console.error('Error saving video data:', error);
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  return (
    <div className="tutorials-page">
      <h1>Tutorials</h1>
      <div className="upload-section">
        {/* Use VideoUpload component to handle video file uploads */}
        <VideoUpload onUpload={handleVideoUpload} />
        {uploading && <p>Uploading...</p>}
      </div>
      <div className="videos-list">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} /> // Display the uploaded videos
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
