# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for Taishab Tai with a **monorepo structure** containing:
- **Frontend**: React SPA with custom routing (no React Router)
- **Backend**: Strapi v5 CMS for content management

The architecture follows a **static site** approach where content is fetched from Strapi, converted to static JSON files, and deployed as a pure static site to Vercel.

## Monorepo Structure

```
taishabtaicom/
├── taishabtai-frontend/    # React application
└── taishabtai-backend/     # Strapi CMS
```

**Important**: Always `cd` into the appropriate directory before running commands. The root `package.json` does not exist.

## Development Commands

### Frontend Development

```bash
cd taishabtai-frontend

# Development
npm run dev                # Start dev server (http://localhost:5173)
npm run preview            # Preview production build locally

# Data & Assets
npm run fetch-data         # Fetch content from Strapi to /public/data/*.json
npm run optimize-images    # Optimize images with Sharp (WebP, JPEG, multiple sizes)

# Building
npm run build              # Standard production build
npm run build:full         # Fetch data + optimize images + build

# Code Quality
npm run lint               # Run ESLint
```

### Backend Development (Strapi)

```bash
cd taishabtai-backend

npm run develop            # Start Strapi with autoReload (dev mode)
npm run start              # Start Strapi without autoReload (production mode)
npm run build              # Build admin panel
```

### Deployment

The project deploys to Vercel. The root `vercel.json` configures the build:

```bash
vercel --prod --yes        # Deploy from CLI
# OR push to main branch for automatic deployment
```

## Architecture & Key Concepts

### Frontend Architecture

#### Custom Client-Side Routing
The app uses **HTML5 History API** instead of React Router. All routing logic is in `App.jsx`:

- URL format: `/{page-slug}` (e.g., `/about`, `/my%20project`)
- Routes are matched against page slugs from `/public/data/pages.json`
- All routes rewrite to `/index.html` (configured in `vercel.json`)
- Navigation updates `window.history.pushState()` and triggers `popstate` events
- Slugs with spaces and special characters are URL-encoded/decoded

**Key Files**:
- `taishabtai-frontend/src/App.jsx:76-104` - URL parsing and page matching
- `taishabtai-frontend/src/App.jsx:106-116` - Navigation handler

#### Static Data Loading
Content is loaded from static JSON files (not live API calls):

1. Data fetching script (`scripts/fetch-strapi-data.js`) calls Strapi API
2. Downloads content + images to `/public/data/` and `/public/images/`
3. React app loads from these static files at runtime

**Key Files**:
- `taishabtai-frontend/scripts/fetch-strapi-data.js` - Strapi data fetcher
- `taishabtai-frontend/src/App.jsx:41-71` - Static JSON loading

#### Dynamic Content Blocks
Pages use a component-based content system defined in Strapi:

- `text.text-block` - Regular text content
- `text.big-text` / `text.large-text-block` - Large text
- `text.two-columns` / `text.two-column-block` - Two-column layout
- `image.image-block` - Single image with optional lightbox
- `image.image-gallery` - Multi-image gallery with justified layout
- `video.video-embed` - Embedded video

**Key Files**:
- `taishabtai-frontend/src/components/PageContent.jsx:47-246` - Content block renderer

#### Image Handling
Multi-stage image pipeline:

1. **Fetch**: `fetch-strapi-data.js` downloads original images from Strapi
2. **Optimize**: `process-images.js` creates WebP/JPEG in multiple sizes (400px, 800px, 1200px, 1600px)
3. **Display**: `ResponsiveImage.jsx` uses `<picture>` with srcset for responsive loading
4. **Lightbox**: `ImageLightbox.jsx` provides fullscreen viewing with keyboard navigation

**Key Files**:
- `taishabtai-frontend/scripts/process-images.js` - Image optimization with Sharp
- `taishabtai-frontend/src/components/ResponsiveImage.jsx` - Responsive image component
- `taishabtai-frontend/src/utils/media.js` - URL resolution helper

### Backend Architecture (Strapi)

#### Content Types
Two main content types:

1. **Page** (`/api/page`) - Portfolio pages with:
   - `title`, `subtitle`, `slug`
   - `image` (single media)
   - `content` (dynamic zone with content blocks)

2. **Site** (`/api/site`) - Global site settings with fallback image

#### API Population
Strapi v5 uses nested population for dynamic zones. The fetch script uses:

```javascript
populate[content][on][image.image-block][populate]=image
populate[content][on][image.image-gallery][populate]=images
populate[image]=*
```

**Key Files**:
- `taishabtai-frontend/scripts/fetch-strapi-data.js:144-164` - Nested population logic
- `taishabtai-backend/src/api/page/` - Page content type
- `taishabtai-backend/src/api/site/` - Site settings

## Common Workflows

### Adding New Content
1. Start Strapi backend: `cd taishabtai-backend && npm run develop`
2. Edit content in admin panel (http://localhost:1337/admin)
3. Fetch updated data: `cd ../taishabtai-frontend && npm run fetch-data`
4. View changes: `npm run dev`

### Deploying Changes
```bash
cd taishabtai-frontend
npm run build:full     # Fetch latest data + optimize images + build
vercel --prod --yes    # Deploy to production
```

### Modifying Routing
Edit `taishabtai-frontend/src/App.jsx`:
- Page matching logic: lines 76-104
- Navigation handler: lines 106-116
- URL encoding/decoding: line 78

### Adding New Content Block Types
1. Create component in Strapi admin
2. Update `fetch-strapi-data.js` populate query (line 149)
3. Add renderer in `PageContent.jsx` `renderContent()` function

## Tech Stack

### Frontend
- **React 19.1.0** - UI framework
- **Vite 7.0.0** - Build tool and dev server
- **Sharp 0.34.4** - Image optimization
- **Axios 1.10.0** - Data fetching in scripts

### Backend
- **Strapi 5.17.0** - Headless CMS
- **SQLite (better-sqlite3)** - Local database
- **Node 18-22** - Runtime

### Deployment
- **Vercel** - Static hosting with SPA routing
