/**
 * App runtime configuration (API hosts, asset URLs, third-party IDs).
 *
 * Setup:
 *   cp src/config.example.js src/config.js
 *   # edit src/config.js for your environment
 *
 * `src/config.js` is gitignored. This example is the template for local clones.
 *
 * `version` and `build` are overwritten automatically when you run:
 *   npm run deploy_ios | deploy_android | archive_ios | archive_android
 * (values are synced from app.json before each build.)
 */

export const domain = 'bkkleague.com'
export const webSocketDomain = 'bkkleague.com'
export const profilePicturesUrl = 'bkkleague.com/profile_pictures'

export default {
  /** REST API base URL (no trailing slash). */
  apiUrl: 'https://' + domain + '/api',

  /** Socket.IO origin (scheme + host, no path). */
  webSocketUrl: 'https://' + webSocketDomain,

  /** Same host as `domain`; used by some legacy socket hooks. */
  domain,

  /** Team / venue logo base URL (path prefix before filename). */
  logoUrl: 'https://' + domain + '/logos/',

  /** Player avatar base URL (path prefix before filename). */
  profileUrl: 'https://' + profilePicturesUrl + '/',

  /**
   * Optional forum image base URL. Falls back to `logoUrl` when omitted.
   * Example: 'https://bkkleague.com/forum_images/'
   */
  // forumImagesUrl: 'https://' + domain + '/forum_images/',

  /** OneSignal app ID (push notifications). */
  ONESIGNAL_APP_ID: 'your-onesignal-app-id',

  /** Shown in Settings; synced from app.json on deploy/archive. */
  build: 1,
  version: '1.0.0',

  /** LINE Login channel ID (LINE Developers Console). */
  line: {
    channelId: 'your-line-channel-id',
  },

  // Facebook app ID (optional; login is commented out in Auth screen).
  // fbAppId: 'your-facebook-app-id',
}
