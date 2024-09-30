import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVideoDataById, updateVideoVotes, incrementVideoViews } from './utils/firebase'; // Make sure to import incrementVideoViews

const VideoDetails = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [userVote, setUserVote] = useState(null); // Track user's vote state

  useEffect(() => {
    const fetchVideo = async () => {
      const videoData = await getVideoDataById(videoId);
      console.log('Fetched video data:', videoData); // Log the fetched video data
      setVideo(videoData);

      // Increment view count once video data is fetched
      await incrementViews(videoId);
    };
    fetchVideo();
  }, [videoId]);

  const incrementViews = async (id) => {
    if (video) {
      // Update the video views in Firebase
      await incrementVideoViews(id); // Implement this in your firebase function
      
      // Immediately update local state
      setVideo((prev) => ({
        ...prev,
        views: (prev.views || 0) + 1,
      }));
    }
  };

  const handleVote = async (type) => {
    if (video) {
      // Update the video votes in Firebase
      await updateVideoVotes(videoId, type);
      setUserVote(type); // Update the user vote state
      
      // Update local video state immediately
      setVideo((prev) => {
        const updatedVotes = {
          upvotes: prev.upvotes || 0,
          downvotes: prev.downvotes || 0,
        };
        
        if (type === 'upvote') {
          updatedVotes.upvotes += 1; // Increment upvote count
        } else if (type === 'downvote') {
          updatedVotes.downvotes += 1; // Increment downvote count
        }
        
        return {
          ...prev,
          ...updatedVotes,
        };
      });
    }
  };

  const handleRemoveVote = async () => {
    if (video) {
      const currentVote = userVote; // Store current vote type
      await updateVideoVotes(videoId, 'remove'); // Implement this in your firebase function
      setUserVote(null); // Reset user vote

      // Decrement the appropriate vote count based on current vote type
      setVideo((prev) => {
        const updatedVotes = {
          upvotes: prev.upvotes || 0,
          downvotes: prev.downvotes || 0,
        };
        
        if (currentVote === 'upvote') {
          updatedVotes.upvotes -= 1; // Decrement upvote count
        } else if (currentVote === 'downvote') {
          updatedVotes.downvotes -= 1; // Decrement downvote count
        }

        return {
          ...prev,
          ...updatedVotes,
        };
      });
    }
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div className="video-details-page">
      <h1>{video.title}</h1>
      <video controls width="600">
        <source src={video.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p>Views: {video.views}</p>
      <p>Upvotes: {video.upvotes || 0}</p>
      <p>Downvotes: {video.downvotes || 0}</p>

      {userVote ? ( // If user has voted, show Remove Vote button
        <button onClick={handleRemoveVote}>
          Remove Vote
        </button>
      ) : (
        <>
          <button onClick={() => handleVote('upvote')}>
            Upvote
          </button>
          <button onClick={() => handleVote('downvote')}>
            Downvote
          </button>
        </>
      )}
      <Link to='/tutorials'><button>Back</button></Link>
    </div>
  );
};

export default VideoDetails;
