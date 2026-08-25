#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

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

echo "Building and installing on device…"
npx expo run:ios --device "$@"
