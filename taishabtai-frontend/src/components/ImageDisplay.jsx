import React, {useEffect, useRef, useState} from 'react';
import {resolveMediaUrl} from '../utils/media';
import ResponsiveImage from './ResponsiveImage';

const ImageDisplay = ({page, fallbackImage}) => {
	// Keep the original image objects for ResponsiveImage
	const pageImage = page?.image;
	const desiredImage = pageImage || fallbackImage;

	// For comparison and alt text, we still need URLs
	const pageImageUrl = resolveMediaUrl(pageImage);
	const fallbackImageUrl = resolveMediaUrl(fallbackImage);
	const desiredImageUrl = pageImageUrl || fallbackImageUrl;

	const [images, setImages] = useState([]);
	const idRef = useRef(0);
	const frameRef = useRef(null);

	useEffect(() => {
		return () => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}

		const getAltText = (imageUrl) => {
			if (!imageUrl) return '';
			if (imageUrl === pageImageUrl && page) {
				return page.title || 'Page image';
			}
			if (imageUrl === fallbackImageUrl) {
				return 'Site image';
			}
			return page?.title || 'Page image';
		};

		if (!desiredImageUrl) {
			setImages((prevImages) =>
				prevImages.length
					? prevImages.map((image) =>
							image.visible ? {...image, visible: false} : image
					  )
					: prevImages
			);
			return;
		}

		setImages((prevImages) => {
			const existingIndex = prevImages.findIndex(
				(image) => image.srcUrl === desiredImageUrl
			);

			if (existingIndex !== -1) {
				return prevImages.map((image, index) =>
					index === existingIndex
						? {...image, visible: true, alt: getAltText(desiredImageUrl)}
						: image.visible
							? {...image, visible: false}
							: image
				);
			}

			const newKey = `image-${idRef.current++}`;
			const newImage = {
				key: newKey,
				imageObject: desiredImage, // Store the full image object
				srcUrl: desiredImageUrl, // Store URL for comparison
				alt: getAltText(desiredImageUrl),
				visible: false,
			};

			const nextImages = [
				...prevImages.map((image) =>
					image.visible ? {...image, visible: false} : image
				),
				newImage,
			];

			frameRef.current = requestAnimationFrame(() => {
				setImages((currentImages) =>
					currentImages.map((image) =>
						image.key === newKey ? {...image, visible: true} : image
					)
				);
			});

			return nextImages;
		});
	}, [desiredImage, desiredImageUrl, fallbackImageUrl, page, pageImageUrl]);

	const handleTransitionEnd = (key, visible) => {
		if (visible) return;
		setImages((prevImages) => prevImages.filter((image) => image.key !== key));
	};

	if (!images.length) return null;

	return (
		<div className='image-display'>
			{images.map((image) => (
				<ResponsiveImage
					key={image.key}
					image={image.imageObject}
					alt={image.alt}
					sizes='100vw'
					className={`image-display-img${
						image.visible ? ' image-display-img-visible' : ''
					}`}
					style={{}}
					onTransitionEnd={(event) => {
						if (event.propertyName === 'opacity') {
							handleTransitionEnd(image.key, image.visible);
						}
					}}
				/>
			))}
		</div>
	);
};

export default ImageDisplay;
