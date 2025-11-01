import React, {useState, useEffect, useCallback} from 'react';
import Sidebar from './components/Sidebar';
import PageContent from './components/PageContent';
import ImageDisplay from './components/ImageDisplay';

const normalizePage = (page) => {
	if (!page) return null;
	if (!page.attributes) return page;

	return {
		id: page.id,
		...page.attributes,
	};
};

const getPageSlug = (page) => {
	if (!page) return '';
	if (page.slug) return page.slug;
	return page.attributes?.slug || '';
};

function App() {
	const [pages, setPages] = useState([]);
	const [currentPage, setCurrentPage] = useState(null);
	const [hoveredPage, setHoveredPage] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isIndexPage, setIsIndexPage] = useState(false);
	const [siteSettings, setSiteSettings] = useState(null);

	useEffect(() => {
		const updateViewportVar = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		};

		updateViewportVar();
		window.addEventListener('resize', updateViewportVar);
		return () => window.removeEventListener('resize', updateViewportVar);
	}, []);

	useEffect(() => {
		const fetchContent = async () => {
			try {
				// Load from static JSON files
				const pagesResponse = await fetch('/data/pages.json');
				const siteResponse = await fetch('/data/site.json').catch((error) => {
					console.error('Error fetching site settings:', error);
					return null;
				});

				const pagesData = await pagesResponse.json();
				const siteData = siteResponse ? await siteResponse.json() : null;

				const rawPages = pagesData?.data || [];
				const normalisedPages = rawPages.map(normalizePage);
				setPages(normalisedPages);

				if (siteData?.data) {
					setSiteSettings(normalizePage(siteData.data));
				} else {
					setSiteSettings(null);
				}
			} catch (error) {
				console.error('Error loading data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchContent();
	}, []);

	useEffect(() => {
		if (!pages.length) return;

		const loadPageFromURL = () => {
			// Decode URL to handle spaces and special characters
			const slug = decodeURIComponent(window.location.pathname.slice(1)).toLowerCase();

			if (slug) {
				const match = pages.find((page) => {
					const pageSlug = getPageSlug(page).toLowerCase();
					return pageSlug === slug;
				});

				if (match) {
					setCurrentPage(normalizePage(match));
					setIsIndexPage(false);
					return;
				}
			}

			// When at root /, show index page with interactive images
			setCurrentPage(null);
			setIsIndexPage(true);
		};

		loadPageFromURL();
		window.addEventListener('popstate', loadPageFromURL);

		return () => {
			window.removeEventListener('popstate', loadPageFromURL);
		};
	}, [pages]);

	const handleSelectPage = useCallback((page) => {
		if (!page) return;
		setCurrentPage(normalizePage(page));
		setIsIndexPage(false);
		const slug = getPageSlug(page);
		if (slug) {
			window.history.pushState({}, '', `/${slug}`);
		} else {
			window.history.pushState({}, '', '/');
		}
	}, []);

	const handlePageHover = useCallback((page) => {
		// No longer updating hoveredPage for background image changes
		// Hover now only triggers popover component
		setHoveredPage(null);
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	console.log('Current page:', currentPage);
	console.log('Content:', currentPage?.content);
	console.log('Is index page:', isIndexPage);

	return (
		<div className='app-container'>
			<Sidebar
				pages={pages}
				currentPage={currentPage}
				onSelectPage={handleSelectPage}
				onPageHover={handlePageHover}
			/>
			{isIndexPage ? (
				<ImageDisplay
					page={null}
					fallbackImage={siteSettings?.image}
				/>
			) : (
				<PageContent page={currentPage} />
			)}
		</div>
	);
}

export default App;
