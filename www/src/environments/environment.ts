export const environment = {
  production: false,
  api: 'https://shop.brabopak.com/api/v1/',
  pcm: 'https://pcm.groupclaes.be/v3/',
  sso: {
    url: 'https://sso.groupclaes.be/v1/',
    client_id: 'OHlcC7vc2hEzNV',
    scope: 'openid offline_access name email preferred_username picture permissions',
  },
  storageKey: 'com.brabopak.shop-test',
  defaultLanguage: 'nl-BE',
  supportedLanguages: [
    'nl-BE',
    'fr-BE'
  ],
  performance: {
    delay_low: 30,
    delay_medium: 60,
    delay_high: 120,
    retries: 1,
    time_out: 3000
  }
}
