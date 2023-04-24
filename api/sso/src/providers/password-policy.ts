export class PasswordPolicy {
  /**
   * @type {string}
   * @memberof PasswordPolicy
   */
  _password: string

  // default settings
  _minLength: number = 8
  _maxLength: number = 128
  _requireLowercase: boolean = false
  _requireUppercase: boolean = false
  _requireDigits: boolean = false

  /**
   * Create a new instance of `PasswordPolicy`
   * @param {string} password 
   * @param {any} [config] Password configuration
   */
  constructor(password, config) {
    this._password = password

    if (config) {
      this._minLength = config.min_length || this._minLength
      this._maxLength = config.max_length || this._maxLength
      this._requireLowercase = config.require_digits || this._requireLowercase
      this._requireUppercase = config.require_uppercase || this._requireUppercase
      this._requireDigits = config.require_lowercase || this._requireDigits
    }
  }

  /**
   * Audit current password
   * @return {boolean}
   */
  audit(): boolean {
    if (this._password.length < this._minLength)
      throw this.resolveError(error_code.E_MIN_LENGTH)
    if (this._password.length > this._maxLength)
      throw this.resolveError(error_code.E_MAX_LENGTH)
    if (this._requireDigits && this._password.split('').some(e => e.charCodeAt(0) >= 48 && e.charCodeAt(0) <= 57))
      throw this.resolveError(error_code.E_REQUIRE_DIGITS)
    if (this._requireUppercase && this._password.split('').some(e => e.charCodeAt(0) >= 65 && e.charCodeAt(0) <= 90))
      throw this.resolveError(error_code.E_REQUIRE_UPPERCASE)
    if (this._requireLowercase && this._password.split('').some(e => e.charCodeAt(0) >= 97 && e.charCodeAt(0) <= 122))
      throw this.resolveError(error_code.E_REQUIRE_LOWECASE)

    return true
  }

  /**
   * Get error from `error_code`
   * @param {number} error_code
   * @return {PasswordPolicyError | Error} error
   */
  resolveError(error_code: number): PasswordPolicyError | Error {
    switch (error_code) {
      case 0:
        return new PasswordPolicyError(error_code, `Password length must be at least ${this._minLength} characters long.`, { length: this._minLength })
      case 1:
        return new PasswordPolicyError(error_code, `Password length must be at most ${this._maxLength} characters long.`, { length: this._maxLength })
      case 2:
        return new PasswordPolicyError(error_code, `Password must contain at least one digit.`)
      case 3:
        return new PasswordPolicyError(error_code, `Password must contain at least one uppercase character.`)
      case 4:
        return new PasswordPolicyError(error_code, `Password must contain at least one lowercase character.`)
    }
    return new Error('Unexpected error')
  }
}

const error_code = {
  E_MIN_LENGTH: 0,
  E_MAX_LENGTH: 1,
  E_REQUIRE_DIGITS: 2,
  E_REQUIRE_UPPERCASE: 3,
  E_REQUIRE_LOWECASE: 4
}

export class PasswordPolicyError extends Error {
  error: string = 'PasswordPolicy'
  error_code: number
  args?: any

  constructor(error_code: number, message: string, args?: any) {
    super(message)
    this.error_code = error_code
    if (args)
      this.args = args
  }

  toString = () => `[${this.error_code}]: ${this.message}`
}