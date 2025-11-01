import React from 'react';

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
		return (
			<img
				src={image}
				alt={alt || 'Image'}
				className={className}
				style={style}
				{...rest}
			/>
		);
	}

	// Extract image data
	const src = image.url || image?.attributes?.url || image?.data?.attributes?.url;
	if (!src) return null;

	// Check if we have responsive image data
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

	// Build srcset string
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
