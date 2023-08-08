import sql from 'mssql'
import nodemailer from 'nodemailer'
import fs from 'fs'

import crypto from 'crypto'

import db from '../db'

const DB_NAME = 'brabopak'

export class MFA {
  _user
  _client_id: string
  _info

  constructor(user, client_id: string, info) {
    this._user = user
    this._client_id = client_id
    this._info = info
  }

  /**
   * Check if the user needs to complete challenge before login
   * basically this should always be true
   * @returns boolean
   */
  challengeRequired() {
    return false // this._client_id === 'hBK4c2uZK5' /* Brabopak shop */
  }

  /**
   * Send a challenge code to the user via email.
   * This code must be entered when logging in
   */
  async challenge(culture: 'nl' | 'fr' = 'nl') {
    if (!this._user.email) {
      throw this.resolveError(error_code.E_CHALLENGE_NOT_SEND)
    }

    const mfa_code = generate_code()

    // create record in db
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('mfa_code', sql.VarChar, mfa_code)
    request.input('user_id', sql.Int, this._user.id)
    request.input('authorization_code', sql.VarChar, this._info.authorization_code)

    const result = await request.query(`INSERT INTO [sso].[mfaCodes] (code, userId, authorizationCode) VALUES (@mfa_code, @user_id, @authorization_code)`)

    if (result.rowsAffected[0] <= 0) {
      throw this.resolveError(error_code.E_CHALLENGE_NOT_SEND)
    }

    let transporter = nodemailer.createTransport({
      host: 'debian-smtp.groupclaes.be',
      port: 25,
      secure: false
    })

    const subject = culture === 'nl' ? `Meervoudige authenticatie` :
      `Authentification multiple`

    let html = fs.readFileSync(`./templates/template_${culture}.html`).toString('utf-8')
    let button = `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#ffffff" align="center" style="padding:30px 30px 40px"><table border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="border-radius:3px;" bgcolor="#40ab86"><span style="pointer-events:none;font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;color:#ffffff;text-decoration:none;padding:15px 25px;border-radius:2px;border:1px solid #24704C;display:inline-block;">@Button.Text</span></td></tr></table></td></tr></table>`
    html = html.replace('@RenderTitle()', subject)
    const body = `Geef onderstaande code in om toegang te krijgen tot de applicatie.`
    button = button.replace('@Button.Text', mfa_code)
    const footer = `Als je vragen hebt of om welke reden dan ook hulp nodig hebt, neem dan contact op met ons via <a href="mailto:it@groupclaes.be" style="color:#40ab86;text-decoration:underline;">it@groupclaes.be</a>.<br><br>Met vriendelijke groeten<br>Het ICT Team van Group Claes`

    html = html.replace('@RenderHeader()', subject + ' ✔')
    html = html.replace('@RenderBody()', body + button + footer)

    await transporter.sendMail({
      from: '"Brabopak - webshop"<bestel@brabopak.com>',
      to: this._user.email,
      subject,
      text: subject,
      html
    })
  }

  /**
   * Check if the user entered the right code
   * @param {string} mfa_code
   */
  complete(mfa_code: string): boolean {
    if (mfa_code.length !== 8)
      throw this.resolveError(error_code.E_INVALLID_CHALLENGE)

    if (this._info.code === mfa_code && this._info.user_id === this._user.id)
      return true

    throw this.resolveError(error_code.E_CHALLENGE_FAILED)
  }

  async use(mfa_code: string): Promise<boolean> {
    const request = new sql.Request(await db.get(DB_NAME))
    request.input('mfa_code', sql.VarChar, mfa_code)
    const result = await request.query(`UPDATE [sso].[mfaCodes] SET used = CAST(1 AS BIT) WHERE code = @mfa_code`)
    return result.rowsAffected[0] > 0
  }

  /**
   * Get error from `error_code`
   * @param {number} error_code
   * @return {MFAError | Error} error
   */
  resolveError(error_code: number): MFAError | Error {
    switch (error_code) {
      case 0:
        return new MFAError(error_code, `Failed to send challenge.`)
      case 1:
        return new MFAError(error_code, `Challenge already send.`)
      case 2:
        return new MFAError(error_code, `Challenge failed.`)
      case 3:
        return new MFAError(error_code, `Invallid challenge.`)
    }
    return new Error('Unexpected error')
  }
}

const error_code = {
  E_CHALLENGE_NOT_SEND: 0,
  E_CHALLENGE_ALREADY_SEND: 1,
  E_CHALLENGE_FAILED: 2,
  E_INVALLID_CHALLENGE: 3
}

const generate_code = (): string => {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  var charactersLength = characters.length
  crypto.getRandomValues(new Uint32Array(characters.length))
  for (var i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(randomFloat() *
      charactersLength));
  }
  return result;
}

const randomFloat = function () {
  const int = window.crypto.getRandomValues(new Uint32Array(1))[0]
  return int / 2 ** 32
}

export class MFAError extends Error {
  error: string = 'MFA'
  error_code: number
  args: any

  constructor(error_code: number, message: string, args?: any) {
    super(message)
    this.error_code = error_code
    if (args)
      this.args = args
  }

  toString = () => `[${this.error_code}]: ${this.message}`
}