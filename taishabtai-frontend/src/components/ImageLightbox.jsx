import React, {useEffect, useState, useCallback} from 'react';
import ResponsiveImage from './ResponsiveImage';

/**
 * ImageLightbox - Fullscreen image viewer with navigation
 *
 * @param {Array} images - Array of image objects
 * @param {number} initialIndex - Starting image index
 * @param {function} onClose - Callback when lightbox closes
 */
const ImageLightbox = ({images, initialIndex = 0, onClose}) => {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	const handlePrevious = useCallback(() => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
	}, [images.length]);

	const handleNext = useCallback(() => {
		setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
	}, [images.length]);

	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === 'Escape') {
				onClose();
			} else if (e.key === 'ArrowLeft') {
				handlePrevious();
			} else if (e.key === 'ArrowRight') {
				handleNext();
			}
		},
		[onClose, handlePrevious, handleNext]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		// Prevent body scroll when lightbox is open
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	}, [handleKeyDown]);

	const currentImage = images[currentIndex];

	return (
		<div className='lightbox-overlay' onClick={onClose}>
			<button
				className='lightbox-close'
				onClick={onClose}
				aria-label='Close lightbox'
			>
				×
			</button>

			{images.length > 1 && (
				<>
					<button
						className='lightbox-nav lightbox-nav-prev'
						onClick={(e) => {
							e.stopPropagation();
							handlePrevious();
						}}
						aria-label='Previous image'
					>
						‹
					</button>
					<button
						className='lightbox-nav lightbox-nav-next'
						onClick={(e) => {
							e.stopPropagation();
							handleNext();
						}}
						aria-label='Next image'
					>
						›
					</button>
				</>
			)}

			<div
				className='lightbox-content'
				onClick={(e) => e.stopPropagation()}
			>
				<ResponsiveImage
					image={currentImage}
					alt={currentImage.alternativeText || `Image ${currentIndex + 1}`}
					sizes='90vw'
					className='lightbox-image'
				/>
				{images.length > 1 && (
					<div className='lightbox-counter'>
						{currentIndex + 1} / {images.length}
					</div>
				)}
			</div>
		</div>
	);
};

export default ImageLightbox;
