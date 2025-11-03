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

# Development (requires Strapi running on localhost:1337)
npm run dev                # Start dev server with LIVE Strapi API preview (http://localhost:5173)
                           # Content and images load directly from Strapi - edit & refresh to see changes!

# Preview Production Build
npm run preview            # Preview production build locally (uses static JSON/images)

# Data & Assets (for production deployment)
npm run fetch-data         # Fetch content from Strapi to /public/data/*.json
npm run optimize-images    # Optimize images with Sharp (WebP, JPEG, multiple sizes)

# Building
npm run build              # Standard production build (uses existing static JSON/images)
npm run build:full         # Fetch data + optimize images + build (complete production build)

# Code Quality
npm run lint               # Run ESLint
```

**Important Distinction:**
- `npm run dev` - Development mode with live Strapi API connection (no static files needed)
- `npm run preview` - Tests production build locally (requires `npm run build` first)
- `npm run build:full` - Generates production-ready static site with optimized assets

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

#### Development vs Production Mode

**CRITICAL CONCEPT**: The frontend operates in two different modes depending on the environment:

| Mode | When | Data Source | Image Source |
|------|------|-------------|--------------|
| **Development** | `npm run dev` | Strapi API at `http://localhost:1337` | Strapi uploads at `http://localhost:1337/uploads/` |
| **Production** | `npm run build`, `npm run preview`, deployed | Static JSON files in `/public/data/` | Optimized images in `/public/images/` |

**Why This Matters:**
- **Dev mode**: Provides live preview - edit content in Strapi, refresh browser, see changes immediately
- **Production mode**: Uses pre-generated static files for fast, CDN-friendly deployment

**How It Works:**

The app detects the environment using Vite's `import.meta.env.DEV`:

```javascript
// In App.jsx
if (import.meta.env.DEV) {
  // Development: Fetch from Strapi API
  pagesData = await fetchPagesFromStrapi();
  siteData = await fetchSiteFromStrapi();
} else {
  // Production: Load from static JSON
  const pagesResponse = await fetch('/data/pages.json');
  const siteResponse = await fetch('/data/site.json');
}
```

**Media URL Resolution:**

The `resolveMediaUrl()` utility (in `media.js`) handles image URLs differently per mode:

```javascript
// Development mode
'/uploads/image_hash.jpg' → 'http://localhost:1337/uploads/image_hash.jpg'

// Production mode
'/uploads/image_hash.jpg' → '/images/image_hash.jpg' (optimized local copy)
```

**Key Files**:
- `taishabtai-frontend/src/App.jsx:42-93` - Conditional data loading
- `taishabtai-frontend/src/services/strapiApi.js` - Strapi API client (dev mode only)
- `taishabtai-frontend/src/utils/media.js` - URL resolution with mode detection
- `taishabtai-frontend/src/components/ResponsiveImage.jsx` - Uses `resolveMediaUrl()`

**Adding New Features:**

When adding features that display media or data, you MUST:

1. **Use `resolveMediaUrl()` for all image URLs** - Never extract URLs directly from objects
2. **Use `ResponsiveImage` component** - Already handles mode detection
3. **Don't assume local files exist in dev** - Images come from Strapi
4. **Test both modes**:
   - Dev: `npm run dev` (requires Strapi running)
   - Production: `npm run build && npm run preview`

**Example - Adding a New Image Display:**

```javascript
// ❌ WRONG - This will break in dev mode
const ImageComponent = ({image}) => {
  const url = image.url || image?.attributes?.url;
  return <img src={url} />; // URL not resolved for dev mode
};

// ✅ CORRECT - Works in both modes
import {resolveMediaUrl} from '../utils/media';

const ImageComponent = ({image}) => {
  const url = resolveMediaUrl(image);
  return <img src={url} />;
};

// ✅ BEST - Use ResponsiveImage (handles responsive images + mode detection)
import ResponsiveImage from './ResponsiveImage';

const ImageComponent = ({image}) => {
  return <ResponsiveImage image={image} alt="Description" />;
};
```

#### Static Data Loading (Production Mode)
Content is loaded from static JSON files in production:

1. Data fetching script (`scripts/fetch-strapi-data.js`) calls Strapi API
2. Downloads content + images to `/public/data/` and `/public/images/`
3. React app loads from these static files at runtime (in production/preview modes)

In development mode, this step is skipped - data comes directly from Strapi API.

**Key Files**:
- `taishabtai-frontend/scripts/fetch-strapi-data.js` - Strapi data fetcher

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

**Production Mode - Multi-stage image pipeline:**

1. **Fetch**: `fetch-strapi-data.js` downloads original images from Strapi to `/public/images/`
2. **Optimize**: `process-images.js` creates optimized versions in `/public/images/optimized/`:
   - Multiple sizes: 640w, 1024w, 1920w, 2560w, original
   - Optimized quality (JPEG: 85%, PNG: 90%)
   - Updates `pages.json` and `site.json` with new URLs and responsive srcset data
3. **Display**: `ResponsiveImage.jsx` uses `<img srcset>` for responsive loading with optimized images
4. **Lightbox**: `ImageLightbox.jsx` provides fullscreen viewing with keyboard navigation

**Development Mode - Direct from Strapi:**

1. Images load directly from Strapi at `http://localhost:1337/uploads/`
2. No optimization or responsive images (srcset) - single image source
3. `ResponsiveImage.jsx` detects dev mode and uses simple `<img>` without srcset
4. Lightbox works the same, but with non-optimized images

**URL Resolution** (`media.js`):

See the **Development vs Production Mode** section above for details. In summary:
- **Dev mode**: Strapi URLs (`/uploads/...`) → `http://localhost:1337/uploads/...`
- **Production mode**: Strapi URLs (`/uploads/...`) → `/images/filename.jpg` (optimized local copy)

**Image Filename Hashes:**

Strapi automatically adds hashes to uploaded filenames (e.g., `image_a7a16451de.jpg`) to prevent collisions. This is normal and handled correctly by `resolveMediaUrl()`.

**Key Files**:
- `taishabtai-frontend/scripts/process-images.js` - Image optimization with Sharp (production only)
- `taishabtai-frontend/src/components/ResponsiveImage.jsx` - Responsive image component (mode-aware)
- `taishabtai-frontend/src/utils/media.js` - URL resolution helper (mode-aware)

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

### Development Only (Live Preview)

When developing and testing content, use this workflow for instant live preview:

```bash
# Terminal 1: Start Strapi backend
cd taishabtai-backend
npm run develop                              # Start Strapi at http://localhost:1337

# Terminal 2: Start frontend dev server
cd taishabtai-frontend
npm run dev                                  # Start at http://localhost:5173
```

**Live Preview Workflow:**
1. Edit content in Strapi admin panel at `http://localhost:1337/admin`
2. Save your changes
3. Refresh the browser at `http://localhost:5173`
4. Changes appear immediately - no need to run `fetch-data`!

**Note**: In dev mode, `npm run dev` fetches data directly from Strapi API and loads images from Strapi uploads. This is different from production, which uses pre-generated static JSON and optimized images.

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
