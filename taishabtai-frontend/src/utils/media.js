import {STRAPI_BASE_URL} from '../constants';

export const resolveMediaUrl = (media) => {
	if (!media) return null;

	if (typeof media === 'string') {
		return media.startsWith('http')
			? media
			: `${STRAPI_BASE_URL}${media}`;
	}

	const directUrl = media.url || media?.attributes?.url;
	const nestedUrl = media?.data?.attributes?.url;
	const url = directUrl || nestedUrl;

	if (!url) return null;

	return url.startsWith('http') ? url : `${STRAPI_BASE_URL}${url}`;
};
