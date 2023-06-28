import { HttpErrorResponse } from '@angular/common/http'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from '../auth.service'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'

@Component({
  selector: 'bra-signon-page',
  templateUrl: './signon-page.component.html'
})
export class SignonPageComponent implements OnInit {
  isLoading = false
  signonForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]], // info@brabopak.com  --  jamie.vangeysel@groupclaes.be
    password: ['', [Validators.required, Validators.minLength(8)]], // shop2069
    code: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern('^[A-Z]{12}$')]], // SGWQVXPQWZEM  --  FTPGIAPQDOSO
  })

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private translate: TranslateService,
    private modalCtrl: ModalsService
  ) { }

  ngOnInit(): void {
  }

  async signon() {
    if (!this.signonForm.valid)
      return

    await this.signonSso()
  }

  async signonSso() {
    try {
      const signonResponse: any = await this.auth.signon(this.signonForm.value)

      if (signonResponse.success === true) {
        const modal = new Modal('success', 'Registratie gelukt', 'Je hebt je succesvol aangemeld voor een account op de Brabopak webshop, je kan nu inloggen met deze gegevens')
        this.modalCtrl.show(modal)
      }
    } catch (err: any) {
      console.log(err)
      if (err.status && err.message) {
        const errRes = (err as HttpErrorResponse)

        switch (errRes.status) {
          case 0:
            alert(errRes.statusText)
            break

          case 403:
            const modal = new Modal('alert', 'Account al geregistreerd', 'Dit e-mailadres is al geregistreerd. Je kan met dit e-mailadres inloggen of een nieuw wachtwoord instellen')
            this.modalCtrl.show(modal)
            this.ref.markForCheck()
            break

          case 404:
            if (errRes.error.error === 'Username or password is incorrect!') {
              alert(this.translate.instant('errors.incorrect_credentials'))
            }
            break

          default:
            alert(errRes.error.reason)
            break
        }
      }
    } finally {
      this.ref.markForCheck()
    }
  }

  get currentUsername(): string | undefined {
    const { username } = this.signonForm.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
