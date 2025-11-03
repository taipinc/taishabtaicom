const STRAPI_BASE_URL = 'http://localhost:1337';

export const resolveMediaUrl = (media) => {
	if (!media) return null;

	const isDev = import.meta.env.DEV;

	if (typeof media === 'string') {
		// If it's already a full URL, return it
		if (media.startsWith('http')) {
			return media;
		}

		// In dev mode, convert Strapi upload paths to full Strapi URLs
		if (isDev && media.startsWith('/uploads/')) {
			return `${STRAPI_BASE_URL}${media}`;
		}

		// If it's already a relative path starting with /, use as-is
		if (media.startsWith('/')) {
			return media;
		}

		// Extract filename and point to local images folder
		const filename = media.split('/').pop();
		return `/images/${filename}`;
	}

	const directUrl = media.url || media?.attributes?.url;
	const nestedUrl = media?.data?.attributes?.url;
	const url = directUrl || nestedUrl;

	if (!url) return null;

	// If it's a full URL, return it
	if (url.startsWith('http')) {
		return url;
	}

	// In dev mode, convert Strapi upload paths to full Strapi URLs
	if (isDev && url.startsWith('/uploads/')) {
		return `${STRAPI_BASE_URL}${url}`;
	}

	// If it's already pointing to /images/, return as-is (already processed by optimize-images)
	if (url.startsWith('/images/')) {
		return url;
	}

	// Extract filename from Strapi URLs (/uploads/...) and point to local images folder
	// This handles both /uploads/filename.jpg and other relative paths
	const filename = url.split('/').pop();
	return `/images/${filename}`;
};
