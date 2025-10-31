const stripTrailingSlash = (value) => value?.replace(/\/+$/, '') || null;

const envBaseUrl = stripTrailingSlash(import.meta.env.VITE_STRAPI_BASE_URL);

export const STRAPI_BASE_URL = envBaseUrl || 'http://localhost:1337';

export const STRAPI_API_URL = `${STRAPI_BASE_URL}/api`;
