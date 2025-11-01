import React, {useEffect, useState, useRef} from 'react';
import {resolveMediaUrl} from '../utils/media';

const ImagePopover = ({page, titleElement}) => {
	const [position, setPosition] = useState(null);
	const popoverRef = useRef(null);

	useEffect(() => {
		if (!page || !titleElement || !page.image) {
			setPosition(null);
			return;
		}

		const updatePosition = () => {
			const rect = titleElement.getBoundingClientRect();

			// Position the popover:
			// - x: just outside the sidebar (at the right edge of the sidebar border)
			// - y: above the title
			const sidebar = document.querySelector('.sidebar');
			const sidebarRect = sidebar?.getBoundingClientRect();

			if (!sidebarRect) return;

			setPosition({
				x: sidebarRect.right, // Position at the right edge of sidebar
				y: rect.top, // Initially position at title top, will adjust after image loads
				titleY: rect.top,
				titleHeight: rect.height,
			});
		};

		updatePosition();
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);

		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}, [page, titleElement]);

	if (!page || !page.image || !position) {
		return null;
	}

	const imageUrl = resolveMediaUrl(page.image);
	if (!imageUrl) {
		return null;
	}

	// Calculate popover position
	// The popover should be above the title
	const popoverHeight = window.innerHeight * 0.33; // 33vh
	const popoverY = position.titleY - popoverHeight; // 10px gap above title
	const popoverX = position.x + 48; // 3rem (16px * 3 = 48px) away from panel

	return (
		<div
			ref={popoverRef}
			className="image-popover"
			style={{
				position: 'fixed',
				left: `${popoverX}px`,
				top: `${popoverY}px`,
				height: `${popoverHeight}px`,
			}}
		>
			<img
				src={imageUrl}
				alt={page.title || 'Page image'}
				className="image-popover-img"
			/>
		</div>
	);
};

export default ImagePopover;
