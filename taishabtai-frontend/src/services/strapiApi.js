const STRAPI_BASE_URL = 'http://localhost:1337';
const STRAPI_API_URL = `${STRAPI_BASE_URL}/api`;

async function fetchData(endpoint) {
	try {
		const url = `${STRAPI_API_URL}${endpoint}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching ${endpoint}:`, error);
		throw error;
	}
}

export async function fetchPagesFromStrapi() {
	console.log('🔄 Fetching pages from Strapi API...');

	try {
		// Fetch pages list
		const pagesList = await fetchData('/pages');

		const pagesWithContent = {
			data: [],
			meta: pagesList.meta
		};

		// Fetch each page individually with nested population
		// Strapi v5 array-based populate for nested relations in dynamic zones
		for (const page of pagesList.data) {
			try {
				const populateQuery = 'populate[0]=image&populate[1]=content.image&populate[2]=content.images';
				const detailedPage = await fetchData(`/pages/${page.documentId}?${populateQuery}`);
				pagesWithContent.data.push(detailedPage.data);
			} catch (error) {
				console.warn(`⚠️ Could not fetch nested data for ${page.title || page.documentId}, trying fallback...`);
				try {
					// Fallback: Try simpler population
					const basicPage = await fetchData(`/pages/${page.documentId}?populate[0]=content&populate[1]=image`);
					pagesWithContent.data.push(basicPage.data);
				} catch (fallbackError) {
					console.warn(`⚠️ Fallback also failed for ${page.title || page.documentId}, using minimal data`);
					// Last resort: use basic data from list
					pagesWithContent.data.push(page);
				}
			}
		}

		console.log(`✓ Fetched ${pagesWithContent.data?.length || 0} pages from Strapi`);
		return pagesWithContent;
	} catch (error) {
		console.error('❌ Error fetching pages from Strapi:', error);
		throw error;
	}
}

export async function fetchSiteFromStrapi() {
	console.log('🔄 Fetching site settings from Strapi API...');

	try {
		const site = await fetchData('/site?populate=image');
		console.log('✓ Fetched site settings from Strapi');
		return site;
	} catch (error) {
		console.error('❌ Error fetching site settings from Strapi:', error);
		throw error;
	}
}
