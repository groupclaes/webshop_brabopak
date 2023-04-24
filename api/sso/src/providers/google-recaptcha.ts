import https from 'https'
import { env } from 'process'

/**
 * 
 * @param {string} token
 * @param {string} action to verify against
 * @return {Promise<boolean>}
 */
export default async function (token: string, action: string): Promise<boolean> {
  // https://www.google.com/recaptcha/api/siteverify
  // POST parameter | Description
  // secret         | The shared key between your site and reCAPTCHA.
  // response       | The user response token provided by the reCAPTCHA.
  // remoteip?      | The user's IP address.

  return new Promise((resolve, reject) => {
    let req = https.request(`https://www.google.com/recaptcha/api/siteverify?secret=${env['GOOGLE_API']}&response=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }, (res) => {
      let body: string | null = ''
      res.on('data', buffer => {
        body += buffer
      })
      res.on('end', _ => {
        const response = body && typeof body === 'string' ? JSON.parse(body) : body
        body = null

        if (!response) {
          reject('Could not verify reCAPTCHA!')
          return
        }

        if (action && response['action'] !== action) {
          reject('Actions do not match!')
        }

        if (response['error-codes'] && response['error-codes'].length > 0) {
          reject(response['error-codes'])
        }

        resolve(response.success)
      })
      res.on('error', e => {
        reject(e)
      })
    })

    req.on('error', error => {
      reject(error)
    })

    req.end()
  })
}