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
├── .git/                   # Git repository (root level)
├── taishabtai-frontend/    # React application
└── taishabtai-backend/     # Strapi CMS
```

**Important Git Structure**:
- The git repository is at the **root** level (one `.git/` folder for the entire monorepo)
- Git commands work from **anywhere** in the repo (parent or child folders)
- npm commands must be run in folders with `package.json` (frontend or backend)
- You can run all git commands from `taishabtai-frontend/` - git will find the `.git/` folder in the parent

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

The project deploys to Vercel via GitHub integration. Push to the `static-site-conversion` branch to trigger automatic deployment.

```bash
# After updating content
git add taishabtai-frontend/public/data/
git add taishabtai-frontend/public/images/
git commit -m "Update content"
git push origin static-site-conversion    # Triggers Vercel deployment automatically
```

**Important**: Optimized images and data files MUST be committed to git because:
- Vercel only runs `npm run build` (not `fetch-data` or `optimize-images`)
- The generated assets are the source of truth for the static site
- They are NOT in `.gitignore` and should be committed after each content update

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

1. **Fetch**: `fetch-strapi-data.js` downloads original images from Strapi to `/public/images/`
2. **Optimize**: `process-images.js` creates optimized versions in `/public/images/optimized/`:
   - Multiple sizes: 640w, 1024w, 1920w, 2560w, original
   - Optimized quality (JPEG: 85%, PNG: 90%)
   - Updates `pages.json` and `site.json` with new URLs and responsive srcset data
3. **Display**: `ResponsiveImage.jsx` uses `<img srcset>` for responsive loading
4. **Lightbox**: `ImageLightbox.jsx` provides fullscreen viewing with keyboard navigation

**URL Resolution** (`media.js`):
- Strapi URLs (`/uploads/...`) → extracts filename → `/images/filename.jpg`
- Optimized URLs (`/images/optimized/...`) → returns as-is (already processed)
- This allows the same component to work with both raw Strapi data and optimized data

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
Strapi v5 uses array-based populate for dynamic zones. The fetch script uses:

```javascript
// Correct Strapi v5 syntax for populating nested relations in dynamic zones
populate[0]=image&populate[1]=content.image&populate[2]=content.images
```

This populates:
- `page.image` - Main page image
- `content[].image` - Images in image-block components
- `content[].images` - Images in image-gallery components

**Common Pitfall**: Using `populate[content][populate]=*` or `populate[image]=*` causes validation errors in Strapi v5. Use array-based syntax instead.

**Key Files**:
- `taishabtai-frontend/scripts/fetch-strapi-data.js:148` - Populate query string
- `taishabtai-backend/src/api/page/` - Page content type
- `taishabtai-backend/src/api/site/` - Site settings

## Common Workflows

### Content Update & Deployment (Complete Workflow)

**After editing content in Strapi:**

```bash
cd taishabtai-frontend

# Step 1: Fetch latest content from Strapi
npm run fetch-data          # Downloads to /public/data/ and /public/images/

# Step 2: Optimize images and update JSON with new URLs
npm run optimize-images     # Creates responsive images in /public/images/optimized/

# Step 3: Test locally (optional)
npm run build && npm run preview

# Step 4: Commit generated assets (REQUIRED for deployment)
git add public/data/ public/images/
git commit -m "Update content from Strapi"
git push origin static-site-conversion    # Auto-deploys to Vercel

# OR use the all-in-one command for steps 1-2:
npm run build:full         # Runs fetch-data + optimize-images + build
```

**Why commit generated assets?**
- Vercel only runs `npm run build` (not `fetch-data` or `optimize-images`)
- The static JSON and optimized images ARE the deployed content
- This is a "static site generator" pattern - build artifacts are version controlled

### Development Only (No Deployment)
```bash
cd taishabtai-backend && npm run develop    # Start Strapi CMS
# Edit content at http://localhost:1337/admin
cd ../taishabtai-frontend
npm run fetch-data                           # Pull latest content
npm run dev                                  # View at http://localhost:5173
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
