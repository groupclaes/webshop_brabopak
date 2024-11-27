export const environment = {
  production: true,
  api: 'https://shop.brabopak.com/api/v1/',
  pcm: 'https://pcm.groupclaes.be/v4/',
  sso: {
    url: 'https://shop.brabopak.com/api/v1/sso/',
    client_id: 'hBK4c2uZK5',
    scope: 'openid offline_access name given_name family_name email email_verified usercode customer_id address_id promo fostplus user_type customers'
  },
  google_recaptcha: '6LcfW7MlAAAAAMkukyyfMYsVg4xuAf0eS6KhjHPv',
  storageKey: 'com.brabopak.shop',
  defaultLanguage: 'nl-BE',
  supportedLanguages: [
    'nl-BE',
    'fr-BE'
  ],
  performance: {
    delay_low: 20,
    delay_medium: 100,
    delay_high: 180,
    retries: 2,
    time_out: 3000
  }
}
