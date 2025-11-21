import React from 'react';

interface VideoPlayerProps {
	src: string;
	title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title }) => {
	return (
		<div className="video-player" style={{
			padding: '20px',
			background: '#000',
			borderRadius: '8px'
		}}>
			{title && <h3 style={{ color: '#fff', marginBottom: '10px' }}>{title}</h3>}
			<video
				controls
				style={{ width: '100%', maxWidth: '800px', borderRadius: '4px' }}
				src={src}
			>
				Your browser does not support the video tag.
			</video>
		</div>
	);
};
