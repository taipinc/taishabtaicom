# Strapi Multi-Image Component Setup Guide

## Components to Create in Strapi

### 1. Update existing `image.image-block` component

**Location:** Content-Type Builder → Components → Image → image-block

**Add new field:**
- **Name:** `enableFullscreen`
- **Type:** Boolean
- **Default value:** `true`
- **Description:** "Allow clicking image to view fullscreen"

---

### 2. Create new `image.image-gallery` component

**Location:** Content-Type Builder → Components → Image → (Create new component)

**Component name:** `image-gallery`
**Display name:** Image Gallery
**Category:** image

**Fields to add:**

1. **images** (Media - Multiple files)
   - Type: Media
   - Multiple: Yes
   - Allowed types: images

2. **layout** (Enumeration)
   - Type: Enumeration
   - Name: `layout`
   - Values:
     - `justify` (default)
     - `grid`
     - `masonry`
   - Default: `justify`

3. **rows** (Number)
   - Type: Integer
   - Name: `rows`
   - Default value: `3`
   - Min value: `1`
   - Max value: `10`
   - Description: "Number of rows for justified layout"

4. **gutter** (Number)
   - Type: Integer
   - Name: `gutter`
   - Default value: `8`
   - Min value: `0`
   - Max value: `50`
   - Description: "Gap between images in pixels"

5. **enableFullscreen** (Boolean)
   - Type: Boolean
   - Name: `enableFullscreen`
   - Default value: `true`
   - Description: "Allow clicking images to view fullscreen with navigation"

6. **caption** (Text)
   - Type: Text
   - Name: `caption`
   - Description: "Optional caption for the gallery"

---

### 3. Add components to Page content type

**Location:** Content-Type Builder → Collection Types → Page → Edit

In the **content** field (Dynamic Zone), add:
- ✓ `image.image-block` (should already be there)
- ✓ `image.image-gallery` (newly created)

**Save and restart Strapi if needed.**

---

## Testing in Strapi Admin

1. Go to Content Manager → Pages
2. Edit a page
3. In the content area, click "Add component"
4. You should see:
   - Image Block (single image)
   - Image Gallery (multi-image)
5. Add an Image Gallery component
6. Upload multiple images
7. Set layout to "justify"
8. Set rows to 3
9. Set gutter to 8
10. Enable fullscreen
11. Save and publish

---

## Data Structure Example

After setup, the API will return:

```json
{
  "__component": "image.image-gallery",
  "id": 1,
  "layout": "justify",
  "rows": 3,
  "gutter": 8,
  "enableFullscreen": true,
  "caption": "My gallery",
  "images": [
    {
      "id": 1,
      "url": "/uploads/image1.jpg",
      "width": 1920,
      "height": 1080,
      ...
    },
    {
      "id": 2,
      "url": "/uploads/image2.jpg",
      "width": 1920,
      "height": 1280,
      ...
    }
  ]
}
```

---

## Next Steps

After completing this Strapi setup:
1. Run `npm run fetch-data` to get the new data structure
2. Run `npm run optimize-images` to optimize gallery images
3. The React components will automatically render the galleries
