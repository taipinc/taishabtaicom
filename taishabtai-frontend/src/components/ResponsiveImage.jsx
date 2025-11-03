import React from 'react';
import {resolveMediaUrl} from '../utils/media';

/**
 * ResponsiveImage component
 * Renders an optimized image with srcset for responsive loading
 *
 * @param {Object} image - Image object with url and optional responsive data
 * @param {string} alt - Alt text for the image
 * @param {string} sizes - Sizes attribute (e.g., "100vw" or "(min-width: 1024px) 800px, 100vw")
 * @param {string} className - Optional CSS class
 * @param {Object} style - Optional inline styles
 * @param {*} rest - Other props to pass to the img element
 */
const ResponsiveImage = ({image, alt, sizes, className, style, ...rest}) => {
	if (!image) return null;

	// Handle string URLs (backwards compatibility)
	if (typeof image === 'string') {
		const resolvedSrc = resolveMediaUrl(image);
		return (
			<img
				src={resolvedSrc}
				alt={alt || 'Image'}
				className={className}
				style={style}
				{...rest}
			/>
		);
	}

	// Extract image data and resolve URL (handles dev vs prod mode)
	const src = resolveMediaUrl(image);
	if (!src) return null;

	// Check if we have responsive image data (only available in production after optimization)
	const responsive = image.responsive;

	if (!responsive || !responsive.srcset || responsive.srcset.length === 0) {
		// No responsive data, use single image
		return (
			<img
				src={src}
				alt={alt || 'Image'}
				className={className}
				style={style}
				{...rest}
			/>
		);
	}

	// Build srcset string (only in production mode with optimized images)
	const srcsetString = responsive.srcset
		.map((source) => `${source.url} ${source.width}w`)
		.join(', ');

	// Use provided sizes or fall back to responsive.sizes or default
	const sizesAttr = sizes || responsive.sizes || '100vw';

	return (
		<img
			src={src}
			srcSet={srcsetString}
			sizes={sizesAttr}
			alt={alt || 'Image'}
			className={className}
			style={style}
			{...rest}
		/>
	);
};

export default ResponsiveImage;
