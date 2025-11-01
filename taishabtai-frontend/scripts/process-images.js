import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
	inputDir: path.join(__dirname, '../public/images'),
	outputDir: path.join(__dirname, '../public/images/optimized'),
	cacheFile: path.join(__dirname, '../.image-cache.json'),
	pagesDataFile: path.join(__dirname, '../public/data/pages.json'),
	siteDataFile: path.join(__dirname, '../public/data/site.json'),
	sizes: [640, 1024, 1920, 2560], // Width breakpoints for responsive images
	quality: {
		jpeg: 85,
		jpg: 85,
		png: 90,
		webp: 85,
	},
};

// Load or initialize cache
function loadCache() {
	try {
		if (fs.existsSync(CONFIG.cacheFile)) {
			return JSON.parse(fs.readFileSync(CONFIG.cacheFile, 'utf-8'));
		}
	} catch (error) {
		console.warn('Could not load cache, starting fresh:', error.message);
	}
	return {};
}

// Save cache
function saveCache(cache) {
	fs.writeFileSync(CONFIG.cacheFile, JSON.stringify(cache, null, 2));
}

// Generate file hash for change detection
function getFileHash(filePath) {
	const content = fs.readFileSync(filePath);
	return crypto.createHash('md5').update(content).digest('hex');
}

// Extract image URL from various Strapi image object formats
function extractImageUrl(imageObj) {
	if (!imageObj) return null;
	if (typeof imageObj === 'string') return imageObj;
	return imageObj.url || imageObj?.attributes?.url || imageObj?.data?.attributes?.url || null;
}

// Process a single image with multiple sizes
async function processImage(inputPath, baseFilename) {
	const results = [];
	const ext = path.extname(baseFilename);
	const nameWithoutExt = path.basename(baseFilename, ext);

	// Load the image once
	const image = sharp(inputPath);
	const metadata = await image.metadata();

	console.log(`  Processing: ${baseFilename} (${metadata.width}x${metadata.height})`);

	// Process each size
	for (const width of CONFIG.sizes) {
		// Skip if original is smaller than target size
		if (metadata.width < width) {
			console.log(`    Skipping ${width}w (original is ${metadata.width}px wide)`);
			continue;
		}

		const outputFilename = `${nameWithoutExt}-${width}w${ext}`;
		const outputPath = path.join(CONFIG.outputDir, outputFilename);

		// Determine quality based on format
		const format = ext.toLowerCase().replace('.', '');
		const quality = CONFIG.quality[format] || 85;

		await sharp(inputPath)
			.resize(width, null, {
				withoutEnlargement: true,
				fit: 'inside',
			})
			.jpeg({quality: format === 'jpg' || format === 'jpeg' ? quality : undefined})
			.png({quality: format === 'png' ? quality : undefined})
			.webp({quality: format === 'webp' ? quality : undefined})
			.toFile(outputPath);

		const stats = fs.statSync(outputPath);
		results.push({
			width,
			filename: outputFilename,
			size: stats.size,
		});

		console.log(`    ✓ ${width}w (${(stats.size / 1024).toFixed(1)}KB)`);
	}

	// Also save the original at full resolution (optimized)
	const originalFilename = `${nameWithoutExt}-original${ext}`;
	const originalPath = path.join(CONFIG.outputDir, originalFilename);

	const format = ext.toLowerCase().replace('.', '');
	const quality = CONFIG.quality[format] || 85;

	await sharp(inputPath)
		.jpeg({quality: format === 'jpg' || format === 'jpeg' ? quality : undefined})
		.png({quality: format === 'png' ? quality : undefined})
		.webp({quality: format === 'webp' ? quality : undefined})
		.toFile(originalPath);

	const originalStats = fs.statSync(originalPath);
	results.push({
		width: metadata.width,
		filename: originalFilename,
		size: originalStats.size,
		original: true,
	});

	console.log(`    ✓ original (${(originalStats.size / 1024).toFixed(1)}KB)`);

	return results;
}

// Update image object with responsive data
function updateImageObject(imageObj, sizes, baseFilename) {
	const ext = path.extname(baseFilename);
	const nameWithoutExt = path.basename(baseFilename, ext);

	return {
		...imageObj,
		url: `/images/optimized/${nameWithoutExt}-original${ext}`,
		responsive: {
			srcset: sizes.map(s => ({
				url: `/images/optimized/${s.filename}`,
				width: s.width,
				size: s.size,
			})),
			sizes: '100vw', // Default, can be overridden in components
		},
	};
}

// Update pages.json with new image references
function updatePagesData(pagesData, processedImages) {
	let updateCount = 0;

	pagesData.data.forEach((page) => {
		// Update hero/cover image
		if (page.image) {
			const imageUrl = extractImageUrl(page.image);
			if (imageUrl) {
				const filename = imageUrl.split('/').pop();
				if (processedImages[filename]) {
					page.image = updateImageObject(
						page.image,
						processedImages[filename],
						filename
					);
					updateCount++;
				}
			}
		}

		// Update content block images
		if (page.content && Array.isArray(page.content)) {
			page.content.forEach((block) => {
				if (block.__component === 'image.image-block' && block.image) {
					const imageUrl = extractImageUrl(block.image);
					if (imageUrl) {
						const filename = imageUrl.split('/').pop();
						if (processedImages[filename]) {
							block.image = updateImageObject(
								block.image,
								processedImages[filename],
								filename
							);
							updateCount++;
						}
					}
				}

				// Update gallery images
				if (block.__component === 'image.image-gallery' && block.images && Array.isArray(block.images)) {
					block.images = block.images.map((image) => {
						const imageUrl = extractImageUrl(image);
						if (imageUrl) {
							const filename = imageUrl.split('/').pop();
							if (processedImages[filename]) {
								updateCount++;
								return updateImageObject(
									image,
									processedImages[filename],
									filename
								);
							}
						}
						return image;
					});
				}
			});
		}
	});

	return updateCount;
}

// Update site.json with new image reference
function updateSiteData(siteData, processedImages) {
	let updateCount = 0;

	if (siteData.data && siteData.data.image) {
		const imageUrl = extractImageUrl(siteData.data.image);
		if (imageUrl) {
			const filename = imageUrl.split('/').pop();
			if (processedImages[filename]) {
				siteData.data.image = updateImageObject(
					siteData.data.image,
					processedImages[filename],
					filename
				);
				updateCount++;
			}
		}
	}

	return updateCount;
}

// Main processing function
async function main() {
	console.log('🖼️  Image Optimization Tool\n');

	// Ensure output directory exists
	if (!fs.existsSync(CONFIG.outputDir)) {
		fs.mkdirSync(CONFIG.outputDir, {recursive: true});
		console.log(`✓ Created output directory: ${CONFIG.outputDir}\n`);
	}

	// Load cache and data files
	const cache = loadCache();
	const pagesData = JSON.parse(fs.readFileSync(CONFIG.pagesDataFile, 'utf-8'));

	// Load site.json if it exists
	let siteData = null;
	if (fs.existsSync(CONFIG.siteDataFile)) {
		siteData = JSON.parse(fs.readFileSync(CONFIG.siteDataFile, 'utf-8'));
	}

	// Get all image files from input directory
	const files = fs.readdirSync(CONFIG.inputDir);
	const imageFiles = files.filter((file) => {
		const ext = path.extname(file).toLowerCase();
		return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
	});

	console.log(`Found ${imageFiles.length} images in ${CONFIG.inputDir}\n`);

	const processedImages = {};
	let processedCount = 0;
	let skippedCount = 0;

	// Process each image
	for (const filename of imageFiles) {
		const inputPath = path.join(CONFIG.inputDir, filename);
		const fileHash = getFileHash(inputPath);

		// Check cache - skip if unchanged
		if (cache[filename] && cache[filename].hash === fileHash) {
			console.log(`⊘ Skipped (unchanged): ${filename}`);
			skippedCount++;

			// Still add to processedImages for data update
			processedImages[filename] = cache[filename].sizes;
			continue;
		}

		// Process the image
		const sizes = await processImage(inputPath, filename);

		// Store results
		processedImages[filename] = sizes;
		cache[filename] = {
			hash: fileHash,
			sizes: sizes,
		};
		processedCount++;

		console.log('');
	}

	// Update pages.json with new image references
	console.log('\nUpdating pages.json with new image references...');
	const pagesUpdateCount = updatePagesData(pagesData, processedImages);

	// Save updated pages.json
	fs.writeFileSync(
		CONFIG.pagesDataFile,
		JSON.stringify(pagesData, null, 2)
	);
	console.log(`✓ Updated ${pagesUpdateCount} image references in pages.json`);

	// Update site.json if it exists
	let siteUpdateCount = 0;
	if (siteData) {
		console.log('Updating site.json with new image references...');
		siteUpdateCount = updateSiteData(siteData, processedImages);
		fs.writeFileSync(
			CONFIG.siteDataFile,
			JSON.stringify(siteData, null, 2)
		);
		console.log(`✓ Updated ${siteUpdateCount} image reference in site.json`);
	}
	console.log('');

	// Save cache
	saveCache(cache);

	// Summary
	console.log('═══════════════════════════════════════');
	console.log('Summary:');
	console.log(`  Processed: ${processedCount} images`);
	console.log(`  Skipped (unchanged): ${skippedCount} images`);
	console.log(`  Total variants generated: ${processedCount * (CONFIG.sizes.length + 1)}`);
	console.log(`  Pages.json references updated: ${pagesUpdateCount}`);
	console.log(`  Site.json references updated: ${siteUpdateCount}`);
	console.log('═══════════════════════════════════════');
	console.log(`\n✓ Done! Optimized images saved to: ${CONFIG.outputDir}`);
}

// Run
main().catch((error) => {
	console.error('Error:', error);
	process.exit(1);
});
