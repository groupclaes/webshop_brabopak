export const environment = {
  production: false,
  api: 'https://shop.brabopak.com/api/v1/',
  pcm: 'https://pcm.groupclaes.be/v3/',
  sso: {
    url: 'https://shop.brabopak.com/api/v1/sso/',
    client_id: 'hBK4c2uZK5',
    scope: 'openid offline_access email email_verified usercode customer_id address_id promo fostplus user_type customer_type',
  },
  google_recaptcha: '6LcfW7MlAAAAAMkukyyfMYsVg4xuAf0eS6KhjHPv',
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
