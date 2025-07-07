// @ts-check
import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "https://glowing-chaja-bca8b9.netlify.app/",
  integrations: [preact()]
});