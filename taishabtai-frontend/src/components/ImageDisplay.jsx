import React from 'react';
import {resolveMediaUrl} from '../utils/media';

const ImageDisplay = ({page}) => {
	if (!page || !page.image) return null;

	const imageUrl = resolveMediaUrl(page.image);

	return (
		<div className='image-display'>
			{imageUrl && (
				<img
					src={imageUrl}
					alt={page.title || 'Page image'}
					className='image-display-img'
				/>
			)}
		</div>
	);
};

export default ImageDisplay;
