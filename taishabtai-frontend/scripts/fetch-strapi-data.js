import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const STRAPI_API_URL = `${STRAPI_BASE_URL}/api`;
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchData(endpoint) {
	try {
		const response = await fetch(`${STRAPI_API_URL}${endpoint}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching ${endpoint}:`, error);
		throw error;
	}
}

async function downloadImage(imageUrl, outputPath) {
	try {
		const fullUrl = imageUrl.startsWith('http')
			? imageUrl
			: `${STRAPI_BASE_URL}${imageUrl}`;

		const response = await fetch(fullUrl);
		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		fs.writeFileSync(outputPath, buffer);
		console.log(`  ✓ Downloaded: ${path.basename(outputPath)}`);
	} catch (error) {
		console.error(`  ✗ Failed to download ${imageUrl}:`, error.message);
	}
}

function extractImageUrl(media) {
	if (!media) return null;
	if (typeof media === 'string') return media;

	// Handle direct image object (Strapi v4/v5 format)
	const directUrl = media.url || media?.attributes?.url;
	const nestedUrl = media?.data?.attributes?.url;

	// Also check for formats.medium, formats.small, etc.
	const mediumUrl = media?.formats?.medium?.url;
	const smallUrl = media?.formats?.small?.url;

	return directUrl || nestedUrl || mediumUrl || smallUrl;
}

async function downloadAllImages(data) {
	const imagesDir = path.join(__dirname, '../public/images');
	if (!fs.existsSync(imagesDir)) {
		fs.mkdirSync(imagesDir, { recursive: true });
	}

	const imagesToDownload = new Set();

	// Extract images from pages
	if (data.pages?.data) {
		for (const page of data.pages.data) {
			// Try both attributes.image and direct image property
			const imageUrl = extractImageUrl(page.attributes?.image || page.image);
			if (imageUrl) {
				imagesToDownload.add(imageUrl);
			}
		}
	}

	// Extract site image
	if (data.site?.data) {
		const imageUrl = extractImageUrl(data.site.data.attributes?.image || data.site.data.image);
		if (imageUrl) {
			imagesToDownload.add(imageUrl);
		}
	}

	console.log(`\nDownloading ${imagesToDownload.size} images...`);

	for (const imageUrl of imagesToDownload) {
		const filename = path.basename(imageUrl);
		const outputPath = path.join(imagesDir, filename);
		await downloadImage(imageUrl, outputPath);
	}
}

async function main() {
	console.log('🚀 Fetching data from Strapi...\n');

	try {
		// Fetch pages
		console.log('Fetching pages...');
		const pages = await fetchData('/pages?populate=*');
		fs.writeFileSync(
			path.join(OUTPUT_DIR, 'pages.json'),
			JSON.stringify(pages, null, 2)
		);
		console.log(`✓ Saved ${pages.data?.length || 0} pages to pages.json`);

		// Fetch site settings
		console.log('Fetching site settings...');
		const site = await fetchData('/site?populate=image');
		fs.writeFileSync(
			path.join(OUTPUT_DIR, 'site.json'),
			JSON.stringify(site, null, 2)
		);
		console.log('✓ Saved site settings to site.json');

		// Download all images
		await downloadAllImages({ pages, site });

		console.log('\n✅ Data export complete!');
		console.log(`📁 Data saved to: ${OUTPUT_DIR}`);
		console.log(`📁 Images saved to: ${path.join(__dirname, '../public/images')}`);
	} catch (error) {
		console.error('\n❌ Error during export:', error);
		process.exit(1);
	}
}

main();
