import React, {useState} from 'react';
import {resolveMediaUrl} from '../utils/media';
import ResponsiveImage from './ResponsiveImage';
import ImageLightbox from './ImageLightbox';
import JustifiedGallery from './JustifiedGallery';

const PageContent = ({page}) => {
	const [lightboxImages, setLightboxImages] = useState(null);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const openLightbox = (images, index = 0) => {
		setLightboxImages(images);
		setLightboxIndex(index);
	};

	const closeLightbox = () => {
		setLightboxImages(null);
		setLightboxIndex(0);
	};

	return (
		<div className='main-content'>
			{page ? (
				<>
					<div className='page-header'>
						<h1>{page.title}</h1>
						{page.subtitle ? (
							<span className='page-subtitle'>{page.subtitle}</span>
						) : null}
					</div>
					<hr />
					<div>{renderContent(page.content, openLightbox)}</div>
				</>
			) : null}

			{lightboxImages && (
				<ImageLightbox
					images={lightboxImages}
					initialIndex={lightboxIndex}
					onClose={closeLightbox}
				/>
			)}
		</div>
	);
};

function renderContent(contentBlocks, openLightbox) {
	if (!contentBlocks) return null;

	return contentBlocks.map((block, index) => {
		if (block.__component === 'text.text-block') {
			return (
				<div
					key={index}
					className='text-block'
				>
					{renderRichText(block.text)}
				</div>
			);
		}

		if (block.__component === 'text.big-text' || block.__component === 'text.large-text-block') {
			return (
				<div
					key={index}
					className='large-text-block'
				>
					{renderRichText(block.text)}
				</div>
			);
		}

		if (block.__component === 'text.two-columns' || block.__component === 'text.two-column-block') {
			return (
				<div
					key={index}
					className='two-column-block'
				>
					{renderTwoColumnText(block.text)}
				</div>
			);
		}

		if (block.__component === 'image.image-block') {
			const imageUrl = resolveMediaUrl(block.image);
			const enableFullscreen = block.enableFullscreen !== false; // Default true

			return (
				<div
					key={index}
					className='image-block'
				>
					{imageUrl ? (
						<>
							<div
								onClick={enableFullscreen ? () => openLightbox([block.image], 0) : undefined}
								style={{cursor: enableFullscreen ? 'pointer' : 'default'}}
							>
								<ResponsiveImage
									image={block.image}
									alt={block.caption || 'Image'}
									sizes='(min-width: 1024px) 800px, 100vw'
									style={{maxWidth: '100%', height: 'auto'}}
								/>
							</div>
							{block.caption && (
								<p className='image-caption'>{block.caption}</p>
							)}
						</>
					) : (
						<div
							style={{
								background: '#f0f0f0',
								padding: '2rem',
								textAlign: 'center',
							}}
						>
							No image uploaded
						</div>
					)}
				</div>
			);
		}

		if (block.__component === 'image.image-gallery') {
			const {images, layout, rows, gutter, enableFullscreen, caption} = block;

			if (!images || images.length === 0) {
				return (
					<div key={index} className='image-gallery-empty'>
						No images in gallery
					</div>
				);
			}

			const handleImageClick = enableFullscreen !== false
				? (imageIndex) => openLightbox(images, imageIndex)
				: undefined;

			return (
				<div key={index} className='image-gallery-block'>
					{layout === 'justify' ? (
						<JustifiedGallery
							images={images}
							rows={rows || 3}
							gutter={gutter || 8}
							onImageClick={handleImageClick}
						/>
					) : (
						// Fallback for other layouts (grid, masonry) - to be implemented
						<div className='image-gallery-grid'>
							{images.map((image, imgIndex) => (
								<div
									key={imgIndex}
									onClick={handleImageClick ? () => handleImageClick(imgIndex) : undefined}
									style={{cursor: handleImageClick ? 'pointer' : 'default'}}
								>
									<ResponsiveImage
										image={image}
										alt={image.alternativeText || `Image ${imgIndex + 1}`}
										sizes='(min-width: 1024px) 33vw, 50vw'
									/>
								</div>
							))}
						</div>
					)}
					{caption && <p className='image-caption'>{caption}</p>}
				</div>
			);
		}

		if (block.__component === 'video.video-embed') {
			const videoInfo = normaliseVideoUrl(block.url);
			if (!videoInfo?.src) return null;

			return (
				<div
					key={index}
					className='video-block'
				>
					{videoInfo.type === 'file' ? (
						<video
							controls
							src={videoInfo.src}
							className='video-player'
						/>
					) : (
						<div className='video-embed-wrapper'>
							<iframe
								src={videoInfo.src}
								title={block.title || `Embedded video ${index + 1}`}
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
								allowFullScreen
							/>
						</div>
					)}
				</div>
			);
		}

		return null;
	});
}

function renderRichText(richTextBlocks) {
	if (!richTextBlocks) return null;

	return richTextBlocks.map((block, index) => {
		if (block.type === 'paragraph') {
			return (
				<p key={index}>
					{block.children.map((child, childIndex) => {
						if (child.type === 'text') {
							return renderTextWithFormatting(child, childIndex);
						}
						if (child.type === 'link') {
							return (
								<a
									key={childIndex}
									href={child.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{child.children.map((linkChild, linkChildIndex) =>
										renderTextWithFormatting(linkChild, linkChildIndex)
									)}
								</a>
							);
						}
						return null;
					})}
				</p>
			);
		}
		if (block.type === 'heading') {
			const HeadingTag = `h${block.level}`;
			return (
				<HeadingTag key={index}>
					{block.children.map((child, childIndex) => {
						if (child.type === 'text') {
							return renderTextWithFormatting(child, childIndex);
						}
						return null;
					})}
				</HeadingTag>
			);
		}
		if (block.type === 'list') {
			const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
			return (
				<ListTag key={index}>
					{block.children.map((item, itemIndex) => (
						<li key={itemIndex}>
							{item.children.map((child, childIndex) => {
								if (child.type === 'text') {
									return renderTextWithFormatting(child, childIndex);
								}
								return null;
							})}
						</li>
					))}
				</ListTag>
			);
		}
		return null;
	});
}

function renderTextWithFormatting(textNode, key) {
	let text = textNode.text;

	if (textNode.bold && textNode.italic) {
		return <strong key={key}><em>{text}</em></strong>;
	}
	if (textNode.bold) {
		return <strong key={key}>{text}</strong>;
	}
	if (textNode.italic) {
		return <em key={key}>{text}</em>;
	}
	if (textNode.underline) {
		return <u key={key}>{text}</u>;
	}
	if (textNode.strikethrough) {
		return <del key={key}>{text}</del>;
	}
	if (textNode.code) {
		return <code key={key}>{text}</code>;
	}

	return <span key={key}>{text}</span>;
}

function renderTwoColumnText(richTextBlocks) {
	if (!richTextBlocks) return null;

	// Find the split point (look for a paragraph containing only "---")
	const splitIndex = richTextBlocks.findIndex((block) => {
		if (block.type === 'paragraph' && block.children?.length === 1) {
			const text = block.children[0]?.text?.trim();
			return text === '---';
		}
		// Also support horizontal rule if Strapi adds it
		return block.type === 'thematicBreak';
	});

	if (splitIndex === -1) {
		// No split found, render as single column
		return <div className="column-full">{renderRichText(richTextBlocks)}</div>;
	}

	// Split the content at the marker (exclude the marker itself)
	const leftBlocks = richTextBlocks.slice(0, splitIndex);
	const rightBlocks = richTextBlocks.slice(splitIndex + 1);

	return (
		<>
			<div className="column-left">{renderRichText(leftBlocks)}</div>
			<div className="column-right">{renderRichText(rightBlocks)}</div>
		</>
	);
}

function normaliseVideoUrl(rawUrl) {
	const url = rawUrl?.trim();
	if (!url) return null;

	const vimeoMatch = url.match(
		/^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?(?:\?.*)?$/i
	);
	if (vimeoMatch) {
		const videoId = vimeoMatch[1];
		const privacyHash = vimeoMatch[2];
		return {
			type: 'embed',
			src: privacyHash
				? `https://player.vimeo.com/video/${videoId}?h=${privacyHash}`
				: `https://player.vimeo.com/video/${videoId}`,
		};
	}

	const vimeoPlayerMatch = url.match(
		/^https?:\/\/player\.vimeo\.com\/video\/(\d+)(?:\?.*)?$/i
	);
	if (vimeoPlayerMatch) {
		return {
			type: 'embed',
			src: `https://player.vimeo.com/video/${vimeoPlayerMatch[1]}`,
		};
	}

	const youtubeWatchMatch = url.match(
		/^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+).*$/i
	);
	if (youtubeWatchMatch) {
		return {
			type: 'embed',
			src: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`,
		};
	}

	const youtubeShortMatch = url.match(/^https?:\/\/youtu\.be\/([^?]+).*$/i);
	if (youtubeShortMatch) {
		return {
			type: 'embed',
			src: `https://www.youtube.com/embed/${youtubeShortMatch[1]}`,
		};
	}

	const knownVideoFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
	if (knownVideoFile) {
		return {type: 'file', src: url};
	}

	return {
		type: 'embed',
		src: url,
	};
}

export default PageContent;
