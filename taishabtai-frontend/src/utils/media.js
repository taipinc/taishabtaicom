export const resolveMediaUrl = (media) => {
	if (!media) return null;

	if (typeof media === 'string') {
		// If it's already a full URL, return it
		if (media.startsWith('http')) {
			return media;
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

	// If it's already a relative path starting with /, use as-is
	if (url.startsWith('/')) {
		return url;
	}

	// Extract filename and point to local images folder (legacy Strapi URLs)
	const filename = url.split('/').pop();
	return `/images/${filename}`;
};
