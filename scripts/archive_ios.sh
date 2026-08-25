#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ARCHIVE_PATH="${ARCHIVE_PATH:-build/BangkokPoolLeague.xcarchive}"
EXPORT_PATH="${EXPORT_PATH:-build}"
EXPORT_OPTIONS="${EXPORT_OPTIONS:-ios-export/ExportOptions.plist}"
PRIVATE_KEYS_DIR="${PRIVATE_KEYS_DIR:-private_keys}"
ARCHIVE_ONLY="${ARCHIVE_ONLY:-0}"

# Load local secrets if present (ASC_KEY_ID, ASC_ISSUER_ID)
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

require_upload_credentials() {
  if [ -z "${ASC_KEY_ID:-}" ] || [ -z "${ASC_ISSUER_ID:-}" ]; then
    cat >&2 <<'MSG'
Missing App Store Connect API credentials.

Create an API key in App Store Connect → Users and Access → Integrations → App Store Connect API,
then set in .env.local (or your environment):

  ASC_KEY_ID=XXXXXXXXXX
  ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Place the downloaded key at:

  private_keys/AuthKey_${ASC_KEY_ID}.p8

Or skip upload with:

  ARCHIVE_ONLY=1 npm run archive_ios
MSG
    exit 1
  fi

  local key_file="${PRIVATE_KEYS_DIR}/AuthKey_${ASC_KEY_ID}.p8"
  if [ ! -f "$key_file" ]; then
    # altool also searches ~/.appstoreconnect/private_keys
    local home_key="${HOME}/.appstoreconnect/private_keys/AuthKey_${ASC_KEY_ID}.p8"
    if [ ! -f "$home_key" ]; then
      echo "Missing API key file: ${key_file}" >&2
      echo "(also checked ${home_key})" >&2
      exit 1
    fi
  fi
}

if [ "$ARCHIVE_ONLY" != "1" ]; then
  require_upload_credentials
fi

echo "Syncing version from app.json → src/config.js…"
node <<'EOF'
const fs = require('fs')
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'))
const version = app.expo.version
const build = Number(app.expo.ios.buildNumber)
if (!version || !Number.isFinite(build)) {
  console.error('Missing expo.version or expo.ios.buildNumber in app.json')
  process.exit(1)
}
const path = 'src/config.js'
let config = fs.readFileSync(path, 'utf8')
config = config.replace(/build:\s*\d+/, `build: ${build}`)
config = config.replace(/version:\s*['"][^'"]*['"]/, `version: '${version}'`)
fs.writeFileSync(path, config)
console.log(`Updated src/config.js → version ${version}, build ${build}`)
EOF

echo "Unlocking login keychain for code signing…"
security unlock-keychain ~/Library/Keychains/login.keychain-db

echo "Running prebuild…"
npx expo prebuild --platform ios

mkdir -p "$(dirname "$ARCHIVE_PATH")" "$EXPORT_PATH" "$PRIVATE_KEYS_DIR"

echo "Archiving Release build (iPhone only) → ${ARCHIVE_PATH}…"
# Transient Sentry TLS/network errors should not fail the App Store build.
export SENTRY_ALLOW_FAILURE="${SENTRY_ALLOW_FAILURE:-true}"
# Cap parallelism so the archive doesn't pin every core.
MAX_CPUS="${MAX_CPUS:-4}"
xcodebuild -workspace ios/BangkokPoolLeague.xcworkspace \
  -scheme BangkokPoolLeague \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  -jobs "$MAX_CPUS" \
  -IDEBuildOperationMaxNumberOfConcurrentCompileTasks="$MAX_CPUS" \
  TARGETED_DEVICE_FAMILY=1 \
  archive \
  "$@"

echo "Archive ready: ${ARCHIVE_PATH}"

if [ "$ARCHIVE_ONLY" = "1" ]; then
  echo "ARCHIVE_ONLY=1 — skipping export/upload."
  exit 0
fi

echo "Exporting IPA → ${EXPORT_PATH}…"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates

IPA_PATH="$(find "$EXPORT_PATH" -maxdepth 1 -name '*.ipa' | head -n 1)"
if [ -z "$IPA_PATH" ]; then
  echo "error: No .ipa found in ${EXPORT_PATH}" >&2
  exit 1
fi

echo "Uploading ${IPA_PATH} to App Store Connect…"
# Prefer project private_keys/ so AuthKey_*.p8 next to the repo works with altool
export API_PRIVATE_KEYS_DIR
API_PRIVATE_KEYS_DIR="$(cd "$PRIVATE_KEYS_DIR" && pwd)"

xcrun altool --upload-app \
  -f "$IPA_PATH" \
  -t ios \
  --apiKey "$ASC_KEY_ID" \
  --apiIssuer "$ASC_ISSUER_ID"

echo "Upload complete. Processing will appear in App Store Connect / TestFlight shortly."
