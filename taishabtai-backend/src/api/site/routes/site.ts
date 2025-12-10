/**
 * site router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::site.site', {
  config: {
    find: {
      auth: false,
    },
  },
});
