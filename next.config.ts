import type { NextConfig } from 'next';

/**
 * `basePath` is set when the site is served from a subpath, which is how
 * GitHub Pages serves a project site (user.github.io/<repo>). It is empty
 * locally and on a custom domain. CI sets it; see docs/deployment.md.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  // Emits a pure static site. This is what makes $0 hosting possible, and it
  // is the switch we turn off if donations ever fund a real backend.
  output: 'export',
  basePath,
  // Static export writes every route as <route>/index.html, so URLs must carry
  // the trailing slash the files actually live at.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
