const fs = require('fs')
const path = require('path')

const SENTRY_PLUGIN = '@sentry/react-native/expo'
const BUILD_PROPERTIES_PLUGIN = 'expo-build-properties'

/** Same UUID as updates.requestHeaders['expo-app-id'] / xprem app id. */
const EAS_PROJECT_ID = 'bd2821b1-58ee-4362-94bc-9cf6609b2e24'

const ANDROID_PROGUARD_RULES = fs.readFileSync(
  path.join(__dirname, 'plugins/android-proguard-rules.pro'),
  'utf8',
)

/** Inject app-level R8 keeps into expo-build-properties (minify stays on). */
function withAndroidProguardRules(plugins) {
  return (plugins ?? []).map(entry => {
    const name = Array.isArray(entry) ? entry[0] : entry
    if (name !== BUILD_PROPERTIES_PLUGIN) return entry
    const opts = Array.isArray(entry) ? {...(entry[1] ?? {})} : {}
    const android = {...(opts.android ?? {})}
    android.extraProguardRules = ANDROID_PROGUARD_RULES
    return [name, {...opts, android}]
  })
}

function applyEnvConfig(expo) {
  const plugins = withAndroidProguardRules(
    (expo.plugins ?? []).filter(entry => {
      const name = Array.isArray(entry) ? entry[0] : entry
      return name !== SENTRY_PLUGIN
    }),
  )

  const sentryOrg = process.env.SENTRY_ORG
  const sentryProject = process.env.SENTRY_PROJECT
  if (sentryOrg && sentryProject) {
    plugins.push([
      SENTRY_PLUGIN,
      {
        url: 'https://sentry.io/',
        organization: sentryOrg,
        project: sentryProject,
      },
    ])
  }

  const ios = {...expo.ios}
  if (process.env.APPLE_TEAM_ID) {
    ios.appleTeamId = process.env.APPLE_TEAM_ID
  } else {
    delete ios.appleTeamId
  }

  // expo-observe Android crashes at native OnCreate without this
  // ("Project ID is required to send observability metrics").
  const extra = {
    ...(expo.extra ?? {}),
    eas: {
      ...(expo.extra?.eas ?? {}),
      projectId: expo.extra?.eas?.projectId ?? EAS_PROJECT_ID,
    },
  }

  return {
    ...expo,
    ios,
    plugins,
    extra,
  }
}

/** @type {(ctx: import('expo/config').ConfigContext) => import('expo/config').ExpoConfig} */
module.exports = ({config}) => ({
  ...applyEnvConfig(config),
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://ota.bkkleague.com/manifest',
    enabled: true,
    // OTAUpdatePrompt owns check/fetch/reload. Native ON_LOAD races the JS
    // API on iOS and can hang reloadAsync on fresh installs.
    checkAutomatically: 'NEVER',
    codeSigningMetadata: process.env.DISABLE_CODE_SIGNING
      ? undefined
      : {keyid: 'main', alg: 'rsa-v1_5-sha256'},
    codeSigningCertificate: process.env.DISABLE_CODE_SIGNING
      ? undefined
      : './certs/certificate.pem',
    requestHeaders: {
      // Literal (or RELEASE_CHANNEL with a default). An unset env key is
      // stripped at export time and breaks channel resolution.
      'expo-channel-name': process.env.RELEASE_CHANNEL || 'production',
      'expo-app-id': EAS_PROJECT_ID,
      // Branch surfing — empty means the channel decides.
      'xprem-branch': '',
    },
  },
})
