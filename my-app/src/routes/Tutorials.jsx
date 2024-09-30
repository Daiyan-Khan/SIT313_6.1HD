import React, { useState, useEffect } from 'react';
import VideoCard from '../VideoCard'; // Component to display individual videos
import '../css/Tutorials.css'; // Styles specific to the Tutorials component
import { getVideoData, saveVideoData } from '../utils/firebase'; // Firebase utility functions
import VideoUpload from '../VideoUpload'; // Import VideoUpload component
import { Link } from 'react-router-dom';

const Tutorials = () => {
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch videos from Firebase on component mount
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const videoData = await getVideoData(); // Fetch video data from your database
                setVideos(videoData);
            } catch (error) {
                console.error('Error fetching video data:', error);
                setErrorMessage('Error fetching video data.'); // Set error message for UI
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    // Handle the uploaded video URL and save it to the database
    const handleVideoUpload = async (videoURL) => {
        setUploading(true);
        try {
            const newVideo = await saveVideoData(videoURL); // Save the video and get its details
            setVideos((prevVideos) => {
                const isDuplicate = prevVideos.some(video => video.id === newVideo.id);
                return isDuplicate ? prevVideos : [...prevVideos, newVideo];
            });
        } catch (error) {
            console.error('Error saving video data:', error);
            setErrorMessage('Error saving video data.'); // Set error message for UI
        } finally {
            setUploading(false); // Reset uploading state
        }
    };

    // Increment view count for the specified video
    const handleVideoView = async (videoId) => {
        // Increment view count for the specified video
        const videoToUpdate = videos.find(video => video.id === videoId);
        if (videoToUpdate) {
            // Increment the view count locally
            const updatedVideo = { ...videoToUpdate, views: (videoToUpdate.views || 0) + 1 };
    
            // Update state with new views count
            setVideos((prevVideos) => 
                prevVideos.map(video => (video.id === videoId ? updatedVideo : video))
            );
    
            // Save the updated video to the database
            try {
                await saveVideoData(updatedVideo); // Make sure this function handles updates
                console.log(`Updated video views for ID ${videoId}:`, updatedVideo.views);
            } catch (error) {
                console.error('Error updating video views:', error);
            }
        }
    };
    

    return (
        <div className="tutorials-page">
            <div className="upload-section">
                <VideoUpload onUpload={handleVideoUpload} />
                {uploading && <p>Uploading...</p>}
            </div>
            <Link to="/">
                <button className="home-button">Home</button>
            </Link>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Render error message */}
            {loading ? <p>Loading videos...</p> : (
                <div className="videos-list">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} onView={handleVideoView} /> // Pass onView function to VideoCard
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tutorials;
