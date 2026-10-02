# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create local config

   ```bash
   cp src/config.example.js src/config.js
   cp .env.example .env.local
   ```

   Edit `src/config.js` for your API host and third-party IDs. Set Sentry, Apple team ID, and signing vars in `.env.local`. See [Configuration](#configuration) below.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Configuration

Runtime settings live in **`src/config.js`**, which is **gitignored**. New clones should copy the example:

```bash
cp src/config.example.js src/config.js
```

Import it anywhere as `@/config` or `@/config.js`.

### Environment variables (`.env.local`)

Copy `.env.example` → `.env.local` (gitignored). Expo loads it for **`app.config.js`** at prebuild time and inlines **`EXPO_PUBLIC_*`** into the JS bundle.

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN in `src/app/_layout.tsx` (optional; app runs without it) |
| `SENTRY_ORG` | Sentry org for `@sentry/react-native/expo` plugin |
| `SENTRY_PROJECT` | Sentry project for the plugin |
| `APPLE_TEAM_ID` | Apple Developer team ID (`app.config.js` + `archive_ios` export) |

`app.config.js` merges these into `app.json` — Sentry plugin and `ios.appleTeamId` are not hardcoded in the repo.

Release-build credentials (`ASC_*`, `ANDROID_*`, `PLAY_*`) are also documented in `.env.example` and [Release builds](#release-builds).

### File layout (`src/config.js`)

| Export / field | Purpose |
|----------------|---------|
| `domain` | API hostname (no scheme), used for some Socket.IO connections |
| `webSocketDomain` | Socket.IO hostname (no scheme) |
| `profilePicturesUrl` | Host + path prefix for player avatars |
| `apiUrl` | REST API base, e.g. `https://bkkleague.com/api` |
| `webSocketUrl` | Socket.IO origin, e.g. `https://bkkleague.com` |
| `logoUrl` | Base URL for team/venue logos |
| `profileUrl` | Base URL for profile pictures |
| `forumImagesUrl` | Optional; forum post images (defaults to `/forum_images/` on the `apiUrl` host) |
| `ONESIGNAL_APP_ID` | OneSignal push notification app ID |
| `line.channelId` | LINE Login channel ID |
| `version` | User-facing app version string |
| `build` | Native build number shown in Settings |

### Version sync

Deploy and archive scripts update `version` and `build` in `src/config.js` from **`app.json`** before each build:

- iOS: `expo.version`, `expo.ios.buildNumber`
- Android: `expo.version`, `expo.android.versionCode`

Bump those in `app.json` before store releases; do not rely on hand-editing `config.js` for production builds.

### Overrides at runtime

`LeagueContext` can persist a custom API URL in AsyncStorage (`api_domain`) for admin/staging testing. Defaults always come from `src/config.js`.

### Related files (also gitignored)

| File | Purpose |
|------|---------|
| `.env.local` | Sentry, Apple team ID, signing, and store-upload credentials |
| `.env.example` | Template for `.env.local` |
| `GoogleService-Info.plist` | Firebase iOS config (referenced in `app.json`) |
| `firebase.google-services.json` | Firebase Android config (referenced in `app.json`) |

## Android wireless debugging (Wi-Fi)

Use this when you want to run the app on a physical Android device without a USB cable after initial pairing.

1. Connect your Android device and computer to the same Wi-Fi network.
2. Enable developer options and turn on **USB debugging** on your Android device.
3. Enable wireless debugging
4. Connect the device once with USB and verify ADB can see it:

   ```bash
   adb devices
   ```

5. Pair the device if not paired.

Push the button that allows you to pair with a PIN.
then when the pop up shows...use the ip address and port and type

```bash
adb pair <ip address>:<port>
```

6. Find your phone's local IP address (Wi-Fi details on the device), then connect:

   ```bash
   adb connect <DEVICE_IP>:5555
   ```

7. Unplug USB, confirm the device is still connected, then run Expo:

   ```bash
   adb devices
   npx expo start
   ```

To disconnect later:

```bash
adb disconnect <DEVICE_IP>:5555
```

## Release builds

Scripts live in `scripts/` and are wired in `package.json`. All of them sync `app.json` version fields into `src/config.js` before building.

| Script | Purpose |
|--------|---------|
| `npm run deploy_ios` | Debug build → install on a connected iPhone |
| `npm run deploy_android` | Debug build → install on a connected Android device |
| `npm run archive_ios` | Release archive → export IPA → upload to App Store Connect |
| `npm run archive_android` | Release AAB → upload to Google Play |

Bump **`expo.version`** and the platform build number in **`app.json`** before a store release:

- iOS: `expo.ios.buildNumber`
- Android: `expo.android.versionCode`

### `deploy_ios` / `deploy_android`

Use these for day-to-day testing on a physical device. They run `expo prebuild`, then `expo run:<platform> --device`.

```bash
npm run deploy_ios
npm run deploy_android
```

Extra CLI args are forwarded to `expo run` (e.g. pick a specific device).

**iOS** (`scripts/deploy_ios.sh`):

- Unlocks the login keychain for code signing.
- Caps Xcode parallelism via a temporary `xcodebuild` wrapper (`MAX_CPUS`, default `4`).

**Android** (`scripts/deploy_android.sh`):

- Applies Gradle/Metro memory and worker limits after prebuild (`scripts/android_gradle_limits.sh`).
- See [Gradle limits](#gradle-limits-android) below.

Requires a USB- or Wi‑Fi-paired device (`adb devices` / Xcode device list).

### `archive_ios` / `archive_android`

Use these for store uploads. Both support building only (no upload) with `ARCHIVE_ONLY=1`.

#### iOS archive (`npm run archive_ios`)

1. `expo prebuild --platform ios`
2. `xcodebuild archive` (Release, iPhone only) → `build/BangkokPoolLeague.xcarchive` by default
3. Export IPA via `ios-export/ExportOptions.plist` → `build/`
4. Upload to App Store Connect with `xcrun altool`

**Credentials** (in `.env.local` or the environment):

```bash
ASC_KEY_ID=XXXXXXXXXX
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Place the API key file at `private_keys/AuthKey_${ASC_KEY_ID}.p8` (or `~/.appstoreconnect/private_keys/`).

**Examples:**

```bash
# Archive, export, and upload (default)
npm run archive_ios

# Archive only — skip export and upload
ARCHIVE_ONLY=1 npm run archive_ios

# Custom paths
ARCHIVE_PATH=build/MyApp.xcarchive EXPORT_PATH=build npm run archive_ios
```

**Optional env vars:** `ARCHIVE_PATH`, `EXPORT_PATH`, `EXPORT_OPTIONS`, `PRIVATE_KEYS_DIR`, `MAX_CPUS` (default `4`), `CLEAN_DERIVED_DATA=1`, `ARCHIVE_LOG`, `SENTRY_ALLOW_FAILURE` (default `true`).

**If archive hangs or crashes:** stop the run (`Ctrl+C`), clear stale build state, then retry:

```bash
killall xcodebuild XCBBuildService 2>/dev/null || true
CLEAN_DERIVED_DATA=1 npm run archive_ios
```

#### Android archive (`npm run archive_android`)

1. `expo prebuild --platform android`
2. Writes `android/keystore.properties` from signing env vars
3. `./gradlew bundleRelease` → `android/app/build/outputs/bundle/release/app-release.aab`
4. Copies the AAB to `build/`
5. Uploads via `scripts/upload_play.js` (Google Play Android Publisher API)

**Signing credentials** (required):

```bash
ANDROID_KEYSTORE_PATH=private_keys/android-release.jks
ANDROID_KEYSTORE_PASSWORD=...
ANDROID_KEY_ALIAS=...
ANDROID_KEY_PASSWORD=...
```

**Play upload credentials** (required unless `ARCHIVE_ONLY=1`):

```bash
PLAY_SERVICE_ACCOUNT_JSON=private_keys/play-service-account.json
PLAY_TRACK=internal          # internal | alpha | beta | production
PLAY_RELEASE_STATUS=completed # completed | draft | halted | inProgress
PLAY_PACKAGE_NAME=com.bangkok_pool_league
```

The service account JSON must be a **Google Cloud service account key** (`type: service_account`), not `google-services.json`. Invite the service account email in Play Console → Users and permissions with release permissions.

**Examples:**

```bash
# Build AAB and upload to internal track (default)
npm run archive_android

# Build AAB only
ARCHIVE_ONLY=1 npm run archive_android

# Upload to a different track
PLAY_TRACK=beta npm run archive_android
```

**Optional env vars:** `AAB_PATH`, `ARCHIVE_ONLY`, `SENTRY_ALLOW_FAILURE` (default `true`), plus Gradle limits below.

### Gradle limits (Android)

`scripts/android_gradle_limits.sh` caps workers and JVM heaps so release builds stay within memory on smaller Macs. Applied by both `deploy_android` and `archive_android` after prebuild.

| Variable | Default | Purpose |
|----------|---------|---------|
| `MAX_CPUS` | `4` | Gradle workers / Xcode `-jobs` |
| `MAX_HEAP_MB` | `1536` | Gradle daemon heap |
| `MAX_METASPACE_MB` | `768` | Gradle metaspace |
| `KOTLIN_HEAP_MB` | `1024` | Kotlin daemon heap |
| `NODE_HEAP_MB` | `1536` | Metro bundler (`NODE_OPTIONS`) |

Example:

```bash
MAX_CPUS=2 MAX_HEAP_MB=2048 npm run archive_android
```

### Local secrets

Create `.env.local` in the project root (gitignored). Both archive scripts `source` it automatically. Never commit keystores, `.p8` keys, or service account JSON — keep them under `private_keys/` or outside the repo.

## Over-the-air updates (xprem)

JS/asset updates are published to a self-hosted [xprem](https://mercure-technologies.gitbook.io/xprem) server at **https://ota.bkkleague.com**. The app uses `expo-updates` with code signing. Native changes still need a store build.

OTA only reaches binaries that were built **after** the update URL and signing cert were configured. Existing store installs will not pull updates until users upgrade to that new binary.

In release builds, `OTAUpdatePrompt` checks for updates on launch and when returning to the foreground, shows a download modal, then asks the user to **Restart** (or **Later**). Dev builds skip this (`expo-updates` is disabled in `__DEV__`).

### Baseline (one-time per app)

Do this once when wiring a new Expo app (pool is already done; darts needs its own dashboard app).

1. Open **https://ota.bkkleague.com/dashboard** and sign in.
2. **Create app** → copy the **App ID**.
3. **Download certificate** → save as `certs/certificate.pem` in the Expo project (commit this file).
4. **API tokens** → create a token → copy it once. Export it as `EOO_TOKEN` when publishing (do not commit it).
5. Install client deps and init (if starting from scratch):

   ```bash
   npx expo install expo-updates
   npx eoas init
   ```

   | Prompt | Answer |
   |--------|--------|
   | Project id | Dashboard App ID |
   | Update server URL | `https://ota.bkkleague.com` |
   | Already have certificates? | **Yes** |

6. **Fix config nesting if needed.** This repo uses `app.config.js` with an `{ expo: … }` wrapper. `updates` and `runtimeVersion` **must** live under `expo` — top-level siblings are ignored and `eoas publish` will say the update URL is not set. Current shape:

   ```js
   // app.config.js
   module.exports = () => ({
     expo: {
       ...applyEnvConfig(appJson.expo),
       runtimeVersion: { policy: 'appVersion' },
       updates: {
         url: 'https://ota.bkkleague.com/manifest',
         // code signing + requestHeaders (expo-channel-name, expo-app-id, xprem-branch)
       },
     },
   })
   ```

   Keep `expo-channel-name` as a literal or `process.env.RELEASE_CHANNEL || 'production'`. An unset env-only value is stripped at export time.

7. Publish the first update and map the channel:

   ```bash
   export EOO_TOKEN=eoo_your_api_key   # or put it in .env.local
   npm run ota_publish -- -m "Initial OTA baseline"
   ```

   Do **not** use bare `npx eoas publish` with the default `--platform all`: that also exports **web**, and native-only packages (e.g. Apple Auth) fail the export. `ota_publish` runs iOS then Android separately.

   In the dashboard: **Channels → Create Channel** `production` → point it at branch `production`.

8. Verify the manifest (reads URL / app id / runtime from Expo config):

   ```bash
   npm run ota_check
   # optional: PLATFORM=android CHANNEL=production npm run ota_check
   ```

   `runtimeVersion` must match the resolved app version (`appVersion` policy → `expo.version` in `app.json`).

9. **Ship a new native binary** so devices embed the update URL and cert:

   ```bash
   npm run deploy_ios          # device test
   npm run deploy_android
   # then store:
   npm run archive_ios
   npm run archive_android
   ```

### Publish an update (day-to-day)

For JavaScript / styling / asset-only changes:

```bash
# EOO_TOKEN from .env.local is sourced by the script
npm run ota_publish -- -m "Describe the fix"

# or one platform:
export EOO_TOKEN=eoo_your_api_key
npx eoas publish --branch production --platform ios -m "Describe the fix"
npx eoas publish --branch production --platform android -m "Describe the fix"
```

Notes:

- Prefer `npm run ota_publish` over default `eoas publish` (`--platform all` tries web and fails on native-only imports).
- `eoas` does **not** load `.env` files itself; `ota_publish` sources `.env.local` for `EOO_TOKEN`.
- A dirty git working tree blocks publish (untracked files count). Commit first, or pass `--disableRepositoryCheck` when you intentionally publish with local-only files.
- Unchanged bundles are not republished (`no changes detected`).
- Users typically need to force-quit and reopen the app (up to twice) for an update to download and apply.
- After publishing: `npm run ota_check`

### When you still need a store build

Bump `expo.version` in `app.json` (runtime version follows `appVersion`) and run `archive_*` when you change:

- Native dependencies / Expo SDK
- Config plugins, permissions, Firebase / LINE native config
- `updates.url`, signing certificate, or request headers that must be baked into the binary

### Related files

| Path | Purpose |
|------|---------|
| `app.config.js` | `updates.url`, headers, code signing, `runtimeVersion` |
| `certs/certificate.pem` | Public cert embedded in the app (committed) |
| `EOO_TOKEN` (env) | Dashboard API token for `eoas publish` (secret) |

Docs: [xprem configure app](https://mercure-technologies.gitbook.io/xprem/installation-guide/configure-your-application), [publish](https://mercure-technologies.gitbook.io/xprem/eoas/publish-an-update).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
