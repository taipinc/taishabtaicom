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

This project is configured for deployment on **Vercel**.

### Deploy to Vercel

#### Option 1: Vercel CLI (Manual Deploy)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod --yes
```

#### Option 2: Git Integration (Automatic Deploy)

Push to your main branch and Vercel will automatically deploy:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Vercel Configuration

The root `vercel.json` file configures:
- Build command: `cd taishabtai-frontend && npm run build`
- Output directory: `taishabtai-frontend/dist`
- SPA routing: All routes rewrite to `/index.html`

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

- The site uses custom routing without React Router
- All routes are rewritten to `/index.html` for SPA functionality
- Images are optimized in multiple formats and sizes for responsive delivery
- Content is fetched from Strapi and saved as static JSON files
