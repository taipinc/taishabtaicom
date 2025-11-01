# Image Optimization Guide

This project includes an automatic image optimization and renaming system that generates responsive images optimized for web delivery.

## Features

- **Automatic Optimization**: Images are compressed for web with optimal quality settings (JPEG: 85%, PNG: 90%)
- **Multiple Sizes**: Each image is generated at multiple widths (640w, 1024w, 1920w, 2560w) for responsive loading
- **Smart Renaming**: Images are renamed to `Shabtai-Pinchevsky_[page-slug]-[seq-num]-[width].ext`
- **Incremental Processing**: Only new or changed images are processed (uses `.image-cache.json`)
- **Automatic srcset**: React components automatically use responsive images with proper `srcset` and `sizes` attributes

## Usage

### Processing Images

Run the optimization script manually:
```bash
npm run optimize-images
```

Or as part of the full build:
```bash
npm run build:full
```

This will:
1. Read `pages.json` to map images to page slugs
2. Process only new/changed images in `public/images/`
3. Generate optimized variants in `public/images/optimized/`
4. Update `pages.json` with responsive image data

### Adding New Images

1. Add your images to `public/images/`
2. Update your Strapi content to reference the images
3. Run `npm run fetch-data` to update `pages.json`
4. Run `npm run optimize-images` to process the new images
5. The images will be automatically renamed based on the page they're associated with

### Image Naming Convention

Images are renamed to follow this pattern:
- **Hero/Cover images**: `Shabtai-Pinchevsky_[page-slug]-001-[width]w.ext`
- **Content images**: `Shabtai-Pinchevsky_[page-slug]-002-[width]w.ext` (sequential numbering)
- **Unassociated images**: `Shabtai-Pinchevsky_[original-name]-[width]w.ext`

Examples:
- `Shabtai-Pinchevsky_scopus-001-640w.jpeg`
- `Shabtai-Pinchevsky_scopus-001-1024w.jpeg`
- `Shabtai-Pinchevsky_scopus-001-original.jpeg`

## How It Works

### 1. Image Processing Script (`scripts/process-images.js`)

The script:
- Reads `pages.json` to understand image-to-page relationships
- Processes images using Sharp (high-performance Node.js image library)
- Generates multiple sizes for responsive loading
- Caches processed images to avoid reprocessing
- Updates `pages.json` with srcset data

### 2. Responsive Images in Components

The `ResponsiveImage` component automatically handles:
- Backwards compatibility with string URLs
- Generating proper `srcset` strings
- Setting appropriate `sizes` attributes
- Fallback for images without responsive data

#### Usage in Components:

```jsx
import ResponsiveImage from './components/ResponsiveImage';

// Hero/cover image (full width)
<ResponsiveImage
  image={page.image}
  alt={page.title}
  sizes="100vw"
/>

// Content image (constrained width)
<ResponsiveImage
  image={block.image}
  alt="Description"
  sizes="(min-width: 1024px) 800px, 100vw"
/>
```

### 3. Browser Selection

The browser automatically selects the best image size based on:
- Viewport width
- Device pixel ratio (retina displays)
- The `sizes` attribute you specify

Example: On a mobile device (375px wide) with a 2x display, the browser might select the 1024w image even though the viewport is smaller, to account for the high DPI.

## Configuration

Edit `scripts/process-images.js` to customize:

```javascript
const CONFIG = {
  sizes: [640, 1024, 1920, 2560], // Width breakpoints
  quality: {
    jpeg: 85,  // JPEG quality (0-100)
    jpg: 85,
    png: 90,   // PNG quality (0-100)
    webp: 85,
  },
  prefix: 'Shabtai-Pinchevsky', // Filename prefix
};
```

## Files and Directories

- `scripts/process-images.js` - Image processing script
- `src/components/ResponsiveImage.jsx` - Responsive image component
- `public/images/` - Source images (original Strapi uploads)
- `public/images/optimized/` - Generated optimized images (gitignored)
- `.image-cache.json` - Cache file for incremental processing (gitignored)

## Performance Benefits

- **Faster load times**: Smaller images load faster on mobile devices
- **Reduced bandwidth**: Users only download the size they need
- **Better UX**: Images appear faster, especially on slower connections
- **SEO benefits**: Faster page load improves search rankings

## Troubleshooting

### Images not updating

Delete the cache and reprocess:
```bash
rm .image-cache.json
npm run optimize-images
```

### "Image not found in pages.json" warning

This means an image in `public/images/` isn't referenced in any page. The image will still be processed but with a generic name. Either:
1. Delete the unused image, or
2. Add it to your Strapi content and re-fetch data

### Build process is slow

The first run processes all images. Subsequent runs use the cache and only process changed images. You can also run `npm run optimize-images` separately from the build.

## npm Scripts

- `npm run optimize-images` - Process images only
- `npm run build` - Build site (without image processing)
- `npm run build:full` - Fetch data + optimize images + build site
- `npm run dev` - Development server
