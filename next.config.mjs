/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'))

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: config => {
    // This is to resolve client side error with `fs` dependency from libsignal,
    // as `fs` is not available in the browser.
    config.resolve.fallback = { fs: false }

    return config
  },

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}
export default config
