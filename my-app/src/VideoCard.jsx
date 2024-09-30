import React from 'react';
import { Link } from 'react-router-dom';
import './css/VideoCard.css';

const VideoCard = ({ video, onView, updateVideoViews }) => {
    const handleSeeMoreClick = () => {
        onView(video.id);
    };

    const handleVideoPlay = () => {
        // Call the updateVideoViews function when the video plays
        updateVideoViews(video.id);
    };

    return (
        <div className="video-card">
            <h3>{video.title}</h3>
            <video controls onPlay={handleVideoPlay}>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <p>Views: {video.views}</p>
            <p>Rating: {video.rating}</p>
            <p>Upvotes: {video.upvotes || 0}</p>
            <p>Downvotes: {video.downvotes || 0}</p>
            <Link to={`/video/${video.id}`} className="see-more-button" onClick={handleSeeMoreClick}>
                See More
            </Link>
        </div>
    );
};

export default VideoCard;
