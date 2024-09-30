import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoDataById, updateVideoVotes, incrementVideoViews } from './utils/firebase';

const VideoDetails = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const videoData = await getVideoDataById(videoId);
      console.log('Fetched video data:', videoData);
      setVideo(videoData);

      // Increment view count in the database
      await incrementVideoViews(videoId);
    };

    fetchVideo();
  }, [videoId]);

  // Other functions (handleVote, handleRemoveVote) remain the same...

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
      {/* Vote buttons and other UI elements */}
    </div>
  );
};

export default VideoDetails;
