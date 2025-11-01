import React from 'react';
import {resolveMediaUrl} from '../utils/media';

const PageContent = ({page}) => {
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
					<div>{renderContent(page.content)}</div>
				</>
			) : null}
		</div>
	);
};

function renderContent(contentBlocks) {
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

		if (block.__component === 'image.image-block') {
			const imageUrl = resolveMediaUrl(block.image);

			return (
				<div
					key={index}
					className='image-block'
				>
					{imageUrl ? (
						<>
							<img
								src={imageUrl}
								alt={block.caption || 'Image'}
								style={{maxWidth: '100%', height: 'auto'}}
							/>
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
							return child.text;
						}
						return null;
					})}
				</p>
			);
		}
		return null;
	});
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
