export const environment = {
  production: false,
  api: 'https://shop.brabopak.com/api/uat/',
  pcm: 'https://pcm.groupclaes.be/v4/',
  sso: {
    url: 'https://shop.brabopak.com/api/uat/sso/',
    client_id: 'hBK4c2uZK5',
    scope: 'openid offline_access name given_name family_name email email_verified usercode customer_id address_id promo fostplus user_type customers'
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
