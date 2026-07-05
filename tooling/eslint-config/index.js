export { config as base } from './base.js';
export { nextJsConfig } from './next.js';
export { config as reactInternal } from './react-internal.js';

import { config as base } from './base.js';
import { nextJsConfig } from './next.js';
import { config as reactInternal } from './react-internal.js';

export const recommended = [...base, ...nextJsConfig, ...reactInternal];
