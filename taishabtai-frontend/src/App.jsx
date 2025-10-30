import React, {useState, useEffect} from 'react';
import axios from 'axios';

function renderContent(contentBlocks) {
	if (!contentBlocks) return null;

	return contentBlocks.map((block, index) => {
		// Handle Text Block component
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

		// Handle Image Block component
		if (block.__component === 'image.image-block') {
			const imageUrl = block.image?.url
				? `http://localhost:1337${block.image.url}`
				: null;

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

		return null;
	});
}

// Helper function for rich text (same as before)
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
function App() {
	const [pages, setPages] = useState([]);
	const [currentPage, setCurrentPage] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPages = async () => {
			try {
				const response = await axios.get(
					'http://localhost:1337/api/pages?populate[content][populate]=*'
				);
				console.log('Full API response:', response.data);
				setPages(response.data.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching pages:', error);
				setLoading(false);
			}
		};
		fetchPages();
	}, []);
	// Add this after your existing useEffect
	useEffect(() => {
		// Function to load page based on current URL
		const loadPageFromURL = () => {
			const slug = window.location.pathname.slice(1); // Remove leading slash
			if (slug && pages.length > 0) {
				const page = pages.find((p) => p.slug === slug);
				if (page) {
					setCurrentPage(page);
				}
			} else if (pages.length > 0) {
				// Default to first page if no slug
				setCurrentPage(pages[0]);
			}
		};

		// Load page when pages are loaded or URL changes
		if (pages.length > 0) {
			loadPageFromURL();
		}

		// Listen for browser back/forward buttons
		const handlePopState = () => {
			loadPageFromURL();
		};

		window.addEventListener('popstate', handlePopState);

		// Cleanup listener
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, [pages]); // Run when pages array changes

	if (loading) {
		return <div>Loading...</div>;
	}

	console.log('Current page:', currentPage);
	console.log('Content:', currentPage?.content);

	return (
		<div className='app-container'>
			<div className='sidebar'>
				<h1>Shabtai Pinchevsky</h1>
				<p>
					I’m a photographer and digital media artist working at the
					intersection of architecture, archives, technology, and politics. In
					my works, I use 3D modeling, mapping, internet-based tools, and more
					to examine archival photographic materials and their relations to
					geographies of conflict and displacement, especially in Israel /
					Palestine. My practice is engaged with issues of social justice and
					human rights, and their application in art and media
				</p>
				<ul>
					{pages.map((page) => (
						<li
							key={page.id}
							onClick={() => {
								setCurrentPage(page);
								window.history.pushState({}, '', `/${page.slug}`);
							}}
							style={{cursor: 'pointer'}}
						>
							{page.title}
						</li>
					))}
				</ul>
			</div>
			<div className='main-content'>
				<h1>{currentPage?.title}</h1>
				<div>{renderContent(currentPage?.content)}</div>
			</div>
		</div>
	);
}

export default App;
