import React, {useEffect, useRef, useState} from 'react';
import {resolveMediaUrl} from '../utils/media';

const ImageDisplay = ({page, fallbackImage}) => {
	const pageImageUrl = resolveMediaUrl(page?.image);
	const fallbackImageUrl = resolveMediaUrl(fallbackImage);
	const desiredImage = pageImageUrl || fallbackImageUrl;

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

		if (!desiredImage) {
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
				(image) => image.src === desiredImage
			);

			if (existingIndex !== -1) {
				return prevImages.map((image, index) =>
					index === existingIndex
						? {...image, visible: true, alt: getAltText(desiredImage)}
						: image.visible
							? {...image, visible: false}
							: image
				);
			}

			const newKey = `image-${idRef.current++}`;
			const newImage = {
				key: newKey,
				src: desiredImage,
				alt: getAltText(desiredImage),
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
	}, [desiredImage, fallbackImageUrl, page, pageImageUrl]);

	const handleTransitionEnd = (key, visible) => {
		if (visible) return;
		setImages((prevImages) => prevImages.filter((image) => image.key !== key));
	};

	if (!images.length) return null;

	return (
		<div className='image-display'>
			{images.map((image) => (
				<img
					key={image.key}
					src={image.src}
					alt={image.alt}
					className={`image-display-img${
						image.visible ? ' image-display-img-visible' : ''
					}`}
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
