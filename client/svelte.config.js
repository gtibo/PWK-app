import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */

import os from 'os';
var network = os.networkInterfaces()?.wlp3s0[0].address || "localhost";

process.env.VITE_REQUEST_PATH = (process.env.NODE_ENV == "development") ? `http://${network}:3002` : "/";


const config = {
  kit: {
    adapter: adapter()
  },

  preprocess: [
    preprocess({
      postcss: true
    })
  ]
};

export default config;
