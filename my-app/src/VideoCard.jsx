import React from 'react';

const VideoCard = ({ video }) => {
    return (
        <div className="video-card">
            <h3>{video.title}</h3>
            <video controls>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <p>Views: {video.views}</p>
            <p>Rating: {video.rating}</p>
        </div>
    );
};

export default VideoCard;
