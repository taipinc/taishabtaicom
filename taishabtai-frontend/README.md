# Taishab Tai Portfolio

A static portfolio website built with React and Vite, featuring a custom SPA routing implementation using the HTML5 History API.

## Features

- Custom client-side routing (no React Router)
- Responsive grid layout with sidebar navigation
- Image lightbox with keyboard navigation
- Responsive image optimization
- Multi-image gallery support
- Dynamic content loading from static JSON files

## Tech Stack

- **React** 19.1.0
- **Vite** 7.0.0 (build tool)
- **Sharp** (image optimization)
- **Axios** (data fetching)
- **ESLint** (code linting)

## Quick Start: Updating Website Content

**After making changes in Strapi CMS:**

```bash
# 1. Fetch latest content from Strapi
npm run fetch-data

# 2. Optimize images and update URLs
npm run optimize-images

# 3. Commit and deploy (triggers Vercel auto-deploy)
git add public/data/ public/images/
git commit -m "Update content"
git push origin static-site-conversion
```

**That's it!** Vercel will automatically build and deploy. Changes live in ~2 minutes.

<details>
<summary>💡 Why these steps?</summary>

- **fetch-data**: Downloads content from Strapi to `/public/data/` JSON files
- **optimize-images**: Creates responsive image variants (640w, 1024w, 1920w, 2560w) and updates JSON with new URLs
- **git commit**: Required! Vercel deploys from git, so optimized images must be committed
- **git push**: Triggers automatic deployment via GitHub integration
</details>

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Install dependencies
npm install
```

## Development

### Start Development Server

```bash
# Run local development server with hot module replacement
npm run dev
```

The site will be available at `http://localhost:5173/`

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Data Management

### Fetch Data from Strapi

```bash
# Fetch content data from Strapi CMS
npm run fetch-data
```

This script fetches pages and site settings from your Strapi backend and saves them as static JSON files in `/public/data/`.

### Optimize Images

```bash
# Process and optimize images for web delivery
npm run optimize-images
```

This script uses Sharp to create optimized versions of images in multiple formats (WebP, JPEG) and sizes.

## Building

### Standard Build

```bash
# Build for production
npm run build
```

Output will be in the `dist/` directory.

### Full Build (with data fetch and image optimization)

```bash
# Fetch data, optimize images, and build in one command
npm run build:full
```

This runs:
1. `fetch-data` - Updates content from Strapi
2. `optimize-images` - Optimizes all images
3. `build` - Creates production build

## Deployment

This project is deployed on **Vercel** via **GitHub integration** (automatic deployment on push).

### Automatic Deployment (Recommended)

Push to the `static-site-conversion` branch to trigger automatic deployment:

```bash
# After running fetch-data and optimize-images
git add public/data/ public/images/
git commit -m "Update content from Strapi"
git push origin static-site-conversion
```

Vercel will automatically:
1. Detect the push
2. Run `npm install` and `npm run build`
3. Deploy to production
4. Live in ~2 minutes

### Manual Deployment (Optional)

If needed, you can deploy directly with Vercel CLI:

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod --yes
```

### Vercel Configuration

The root `vercel.json` file configures:
- Build command: `cd taishabtai-frontend && npm run build`
- Output directory: `taishabtai-frontend/dist`
- SPA routing: All routes rewrite to `/index.html`

**Important**: Optimized images and JSON data files **must be committed to git** because Vercel only runs `npm run build`, not `fetch-data` or `optimize-images`.

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
taishabtai-frontend/
├── public/
│   ├── data/           # Static JSON data files
│   └── images/         # Optimized images
├── scripts/
│   ├── fetch-strapi-data.js   # Data fetching script
│   └── process-images.js      # Image optimization script
├── src/
│   ├── components/     # React components
│   │   ├── Sidebar.jsx
│   │   ├── PageContent.jsx
│   │   ├── ImageDisplay.jsx
│   │   └── ImageLightbox.jsx
│   ├── App.jsx         # Main app with routing logic
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:full` | Fetch data, optimize images, and build |
| `npm run preview` | Preview production build locally |
| `npm run fetch-data` | Fetch content from Strapi CMS |
| `npm run optimize-images` | Optimize images with Sharp |
| `npm run lint` | Run ESLint code checks |

## Notes

### Architecture
- **Static Site**: Content is pre-fetched from Strapi and committed to git as static JSON
- **Custom Routing**: Uses HTML5 History API (no React Router)
- **SPA**: All routes rewrite to `/index.html` via Vercel configuration
- **Responsive Images**: Optimized in 4 sizes (640w, 1024w, 1920w, 2560w) with srcset

### Important Workflow Notes
- Always run `npm run optimize-images` after `npm run fetch-data`
- Commit generated files in `public/data/` and `public/images/` to git
- Push to `static-site-conversion` branch to deploy
- Vercel auto-deploys on push (GitHub integration)
