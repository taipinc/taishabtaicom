import React, {useState, useEffect} from 'react';
import ResponsiveImage from './ResponsiveImage';

/**
 * JustifiedGallery - Creates justified rows of images
 * All images in a row have the same height, rows are full width
 *
 * @param {Array} images - Array of image objects with width/height
 * @param {number} rows - Target number of rows
 * @param {number} gutter - Gap between images in pixels
 * @param {function} onImageClick - Callback when image is clicked
 */
const JustifiedGallery = ({images, rows = 3, gutter = 8, onImageClick}) => {
	const [layout, setLayout] = useState([]);

	useEffect(() => {
		if (!images || images.length === 0) return;

		// Calculate justified layout
		const containerWidth = 1000; // Will be adjusted by CSS
		const targetRows = Math.max(1, rows);
		const imagesPerRow = Math.ceil(images.length / targetRows);

		const newLayout = [];
		let currentRow = [];
		let currentRowWidth = 0;

		images.forEach((image, index) => {
			const aspectRatio = image.width / image.height;
			currentRow.push({image, aspectRatio, index});
			currentRowWidth += aspectRatio;

			// Complete row when we have enough images or it's the last image
			const isLastImage = index === images.length - 1;
			const shouldCompleteRow =
				currentRow.length >= imagesPerRow || isLastImage;

			if (shouldCompleteRow) {
				// Calculate heights to make row fit container width
				const availableWidth =
					containerWidth - gutter * (currentRow.length - 1);
				const rowHeight = availableWidth / currentRowWidth;

				const layoutRow = currentRow.map((item) => ({
					...item,
					width: item.aspectRatio * rowHeight,
					height: rowHeight,
				}));

				newLayout.push(layoutRow);
				currentRow = [];
				currentRowWidth = 0;
			}
		});

		setLayout(newLayout);
	}, [images, rows, gutter]);

	if (!images || images.length === 0) {
		return <div className='justified-gallery-empty'>No images</div>;
	}

	return (
		<div className='justified-gallery' style={{'--gutter': `${gutter}px`}}>
			{layout.map((row, rowIndex) => (
				<div key={rowIndex} className='justified-gallery-row'>
					{row.map((item) => (
						<div
							key={item.index}
							className='justified-gallery-item'
							style={{
								flexGrow: item.aspectRatio,
								flexBasis: `${item.aspectRatio * 100}px`,
							}}
							onClick={
								onImageClick
									? () => onImageClick(item.index)
									: undefined
							}
						>
							<ResponsiveImage
								image={item.image}
								alt={item.image.alternativeText || `Image ${item.index + 1}`}
								sizes='(min-width: 1024px) 33vw, 50vw'
								className='justified-gallery-image'
							/>
						</div>
					))}
				</div>
			))}
		</div>
	);
};

export default JustifiedGallery;
