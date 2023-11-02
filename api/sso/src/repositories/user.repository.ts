import sql from 'mssql'
import * as jose from 'jose'
import db from '../db'
import nodemailer from 'nodemailer'
import fs from 'fs'

import config from './config'
import { SSO } from './sso.repository'
import { IAppUser, ISignUpBody } from '../controllers/users.controller'

const expiresIn = 900
const DB_NAME = 'brabopak'

export default class User {
  schema: string = '[sso]'
  sso: SSO

  constructor() {
    this.sso = new SSO()
  }
  /**
   * 
   */
  async getIdToken(authorization_code: { user_id: string, scope: string }): Promise<string> {
    const { audience, subject } = this.getAudSub(authorization_code.user_id)
    const userinfo = await this.sso.getUserInfo(authorization_code.user_id)

    let payload: any
    const scopes = authorization_code.scope.split(' ')
    // extract required data base on authorization_code.scope

    for (const [key, value] of Object.entries(userinfo)) {
      if (!payload)
        payload = {}
      if (scopes.indexOf(key) !== -1)
        payload[key] = value
    }

    if (!payload)
      throw new Error('Invalid payload')

    const privateKey = await jose.importJWK(config.key)
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.iss })
      .setIssuer(config.key.iss)
      .setAudience(audience)
      .setExpirationTime(expiresIn + 's')
      .setSubject(subject)
      .sign(privateKey)
  }

  async getAccessToken(authorization_code: { user_id: string, scope: string }) {
    const { audience, subject } = this.getAudSub(authorization_code.user_id)

    const privateKey = await jose.importJWK(config.key)
    return await new jose.SignJWT({})
      .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.iss })
      .setIssuer(config.key.iss)
      .setAudience(audience)
      .setExpirationTime(expiresIn + 's')
      .setSubject(subject)
      .sign(privateKey)
  }

  /**
   * Create a new refresh token for user_id
   */
  getRefreshToken(user_id: string, code: string, access_token: string): Promise<any> {
    return this.sso.createRefreshToken(
      user_id,
      code,
      access_token
    )
  }

  /**
   * Update `password` for id: `user_id`
   * @returns
   */
  updatePassword = (user_id: string, password: string) => this.sso.updatePassword(user_id, password)

  /**
   *
   */
  async create(username: string, password: string, given_name: string, family_name: string, usercode: number): Promise<boolean> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('username', sql.VarChar, username)
    request.input('password', sql.VarChar, password)
    request.input('given_name', sql.VarChar, given_name)
    request.input('family_name', sql.VarChar, family_name)
    request.input('usercode', sql.Int, usercode)

    const result = await request.execute(`${this.schema}.[usp_createUser]`)

    if (result.rowsAffected[0] > 0) {
      return true
    }
    return false
  }

  async checkSettings(settings: IAppUser): Promise<boolean> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('usercode', sql.Int, settings.usercode)
    request.input('user_type', sql.Int, settings.user_type)
    request.input('customer_id', sql.Int, settings.customer_id)
    request.input('address_id', sql.Int, settings.address_id)
    request.input('group_id', sql.Int, settings.group_id)
    request.input('promo', sql.Bit, settings.promo)
    request.input('bonus_percentage', sql.Numeric, settings.bonus_percentage)
    request.input('fostplus', sql.Bit, settings.fostplus)
    request.input('customer_type', sql.TinyInt, settings.customer_type)
    request.input('price_class', sql.Int, settings.price_class)

    const result = await request.execute(`${this.schema}.[usp_createOrUpdateSettings]`)

    if (result.rowsAffected[0] > 0) {
      return true
    }
    return false
  }

  async getCustomers(user_id: string): Promise<any[] | undefined> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('user_id', sql.Int, user_id)

    const result = await request.execute(`${this.schema}.[usp_getCustomers]`)
    if (result.recordset.length > 0) {
      return result.recordset[0]
    }
    return undefined
  }

  /**
   * get audience and subject for jwt
   * @param user_id id of the user
   * @returns 
   */
  getAudSub = (user_id: number | string) => ({
    audience: [
      process.env.CLIENT_ID ?? 'unknown'
    ],
    subject: user_id.toString()
  })

  signUp(user: ISignUpBody, culture: string = 'nl') {
    return new Promise(async (resolve, reject) => {
      const transporter = nodemailer.createTransport({
        host: 'debian-smtp.groupclaes.be',
        port: 25,
        secure: false
      })

      let html = fs.readFileSync(`./templates/template_${culture}.html`).toString('utf-8')
      let button = `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#ffffff" align="center" style="padding:30px 30px 40px"><table border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="border-radius:3px;" bgcolor="#001dbb"><a href="@Button.Url" target="_blank" style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;color:#ffffff;text-decoration:none;padding:15px 25px;border-radius:2px;border:1px solid #24704C;display:inline-block;">@Button.Text</a></td></tr></table></td></tr></table>`
      button = button.replace(
        '@Button.Url',
        `mailto:${user.step5.username}`
      )

      html = html.replace('@RenderTitle()', 'Registratie nieuwe klant')
      const body = `Er heeft zojuist iemand op de Brabopak webshop geregistreerd<br><br><h2>Bedrijfsinformatie</h2><p>Bedrijfsnaam: ${user.step1.companyName}</p><p>BTW nr: ${user.step1.companyVat}</p><p>Telefoon: ${user.step1.companyPhone}</p><h2>Facturatiegegevens</h2><p>adres: ${user.step2.address} ${user.step2.number}</p><p>Plaats: ${user.step2.zipCode} ${user.step2.city}</p><p>Land: ${user.step2.country}</p>` + (user.step2.alternateAddress === true ? `<h2>Levergegevens</h2><p>adres: ${user.step3.address} ${user.step3.number}</p><p>Plaats: ${user.step3.zipCode} ${user.step3.city}</p><p>Land: ${user.step3.country}</p>` : '') + `<h2>Leverschema</h2>${buildOpeningHoursList(user.step4)}<h2>Persoonsgegevens</h2><p>Naam: ${user.step5.givenName}</p><p>Achternaam: ${user.step5.familyName}</p><p>Email: ${user.step5.username}</p>`
      button = button.replace('@Button.Text', 'Email de nieuwe klant')
      const footer = `Als je vragen hebt of om welke reden dan ook hulp nodig hebt, neem dan contact op met ons via <a href="mailto:bestel@brabopak.com" style="color:#40ab86;text-decoration:underline;">bestel@brabopak.com</a>.<br><br>Met vriendelijke groeten<br>Team Brabopak`
      html = html.replace('@RenderHeader()', 'Nieuwe klant: bevestig registratie ✔')
      html = html.replace('@RenderBody()', body + button + footer)
      const info = await transporter.sendMail({
        from: 'Brabopak - webshop"<bestel@brabopak.com>',
        // to: 'jamie.vangeysel@groupclaes.be',
        to: 'karl@brabopak.com',
        subject: 'Registratie nieuwe klant',
        text: 'Een klant wil zich registreren op de eshop!',
        html
      }).catch(err => {
        reject(err.responseCode)
      })

      if (info)
        resolve(info.messageId)
    })
  }

  async sendResetToken(username: string, given_name: string, reset_token: string, culture: string = 'nl') {
    const transporter = nodemailer.createTransport({
      host: 'debian-smtp.groupclaes.be',
      port: 25,
      secure: false
    })

    const subject = culture === 'nl' ? `Wachtwoordherstel` : `Herstel de la woord de pass`

    let html = fs.readFileSync(`./templates/template_${culture}.html`).toString('utf-8')
    let button = `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#ffffff" align="center" style="padding:30px 30px 40px"><table border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="border-radius:3px;" bgcolor="#001dbb"><a href="https://shop.brabopak.com/${culture}/auth/reset-password?login_hint=${encodeURI(username)}&reset_token=${reset_token}"><span style="pointer-events:none;font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;color:#ffffff;text-decoration:none;padding:15px 25px;border-radius:2px;border:1px solid #24704C;display:inline-block;">@Button.Text</span></a></td></tr></table></td></tr></table>`
    html = html.replace('@RenderTitle()', subject)
    const body = `Hey ${given_name}, wachtwoord vergeten<br><br>Geen nood met 1 druk op de knop maak je een nieuw wachtwoord aan.`
    button = button.replace('@Button.Text', 'Wachtwoord opnieuw instellen')
    const footer = `Als je vragen hebt of om welke reden dan ook hulp nodig hebt, neem dan contact op met ons via <a href="mailto:info@brabopak.com" style="text-decoration:underline;">info@brabopak.com</a>.<br><br>Met vriendelijke groeten<br>Het ICT Team van Group Claes`

    html = html.replace('@RenderHeader()', subject) // + ' ✔'
    html = html.replace('@RenderBody()', body + button + footer)

    return await transporter.sendMail({
      from: '"Brabopak - webshop"<bestel@brabopak.com>',
      to: username,
      subject,
      text: subject,
      html
    })
  }
}

function buildOpeningHoursList(openingList) {
  let html = ''

  if (openingList.moAmFr && openingList.moAmFr.length > 0) {
    html += `<p>maandag: ${openingList.moAmFr} tot ${openingList.moAmTo}`
    if (openingList.moPmFr && openingList.moPmFr.length > 0) {
      html += ` en van ${openingList.moPmFr} tot ${openingList.moPmTo}`
    }
    html += `</p>`
  }
  if (openingList.tuAmFr && openingList.tuAmFr.length > 0) {
    html += `<p>dinsdag: ${openingList.tuAmFr} tot ${openingList.tuAmTo}`
    if (openingList.tuPmFr && openingList.tuPmFr.length > 0) {
      html += ` en van ${openingList.tuPmFr} tot ${openingList.tuPmTo}`
    }
    html += `</p>`
  }
  if (openingList.weAmFr && openingList.weAmFr.length > 0) {
    html += `<p>woensdag: ${openingList.weAmFr} tot ${openingList.weAmTo}`
    if (openingList.wePmFr && openingList.wePmFr.length > 0) {
      html += ` en van ${openingList.wePmFr} tot ${openingList.wePmTo}`
    }
    html += `</p>`
  }
  if (openingList.thAmFr && openingList.thAmFr.length > 0) {
    html += `<p>donderdag: ${openingList.thAmFr} tot ${openingList.thAmTo}`
    if (openingList.thPmFr && openingList.thPmFr.length > 0) {
      html += ` en van ${openingList.thPmFr} tot ${openingList.thPmTo}`
    }
    html += `</p>`
  }
  if (openingList.frAmFr && openingList.frAmFr.length > 0) {
    html += `<p>vrijdag: ${openingList.frAmFr} tot ${openingList.frAmTo}`
    if (openingList.frPmFr && openingList.frPmFr.length > 0) {
      html += ` en van ${openingList.frPmFr} tot ${openingList.frPmTo}`
    }
    html += `</p>`
  }

  return html + ''
}
