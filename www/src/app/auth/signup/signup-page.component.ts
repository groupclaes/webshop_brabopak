import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { Subscription, firstValueFrom } from 'rxjs'
import { AuthService } from '../auth.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Modal, ModalsService } from 'src/app/@shared/modals/modals.service'
import { LocalizeRouterService } from '@gilsdav/ngx-translate-router'

@Component({
  selector: 'bra-signup-page',
  templateUrl: './signup-page.component.html',
  styles: [
  ]
})
export class SignupPageComponent implements OnInit {
  isLoading = false
  currentStep: number = 1

  signupForm1: FormGroup = this.fb.group({
    companyName: ['', [Validators.required]], // Simplintho
    companyVat: ['', [Validators.required, Validators.pattern('^((AT)?U[0-9]{8}|(BE)?0[0-9]{9}|(BG)?[0-9]{9,10}|(CY)?[0-9]{8}L|(CZ)?[0-9]{8,10}|(DE)?[0-9]{9}|(DK)?[0-9]{8}|(EE)?[0-9]{9}|(EL|GR)?[0-9]{9}|(ES)?[0-9A-Z][0-9]{7}[0-9A-Z]|(FI)?[0-9]{8}|(FR)?[0-9A-Z]{2}[0-9]{9}|(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})|(HU)?[0-9]{8}|(IE)?[0-9]S[0-9]{5}L|(IT)?[0-9]{11}|(LT)?([0-9]{9}|[0-9]{12})|(LU)?[0-9]{8}|(LV)?[0-9]{11}|(MT)?[0-9]{8}|(NL)?[0-9]{9}B[0-9]{2}|(PL)?[0-9]{10}|(PT)?[0-9]{9}|(RO)?[0-9]{2,10}|(SE)?[0-9]{12}|(SI)?[0-9]{8}|(SK)?[0-9]{10})$')]], // BE0646994651
    companyPhone: ['', [Validators.required]], // 0471389116
  })
  signupForm2: FormGroup = this.fb.group({
    address: ['', [Validators.required]], // Oude Spoorbaan
    number: ['', [Validators.required]], // 26
    zipCode: ['', [Validators.required]], // 3500
    searchcity: ['', []],
    city: ['', [Validators.required]], // Hasselt
    country: ['', [Validators.required]], // België
    alternateAddress: [false, []]
  })
  signupForm3: FormGroup = this.fb.group({
    address: ['', [Validators.required]], // Oude Spoorbaan
    number: ['', [Validators.required]], // 6
    zipCode: ['', [Validators.required]], // 3500
    searchcity: ['', []],
    city: ['', [Validators.required]], // Hasselt
    country: ['', [Validators.required]], // België
  })
  signupForm4: FormGroup = this.fb.group({
    moAmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    moAmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    moPmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    moPmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    tuAmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    tuAmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    tuPmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    tuPmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    weAmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    weAmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    wePmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    wePmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    thAmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    thAmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    thPmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    thPmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    frAmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    frAmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    frPmFr: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    frPmTo: ['', [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]]
  })
  signupForm5: FormGroup = this.fb.group({
    givenName: ['', [Validators.required]],
    familyName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.email]]
  })

  countries: any[] = [
    {
      code: 'BE',
      name: 'countries.be'
    },
    {
      code: 'NL',
      name: 'countries.nl'
    },
    {
      code: 'FR',
      name: 'countries.fr'
    },
    {
      code: 'LU',
      name: 'countries.lu'
    }
  ]

  subs: Subscription[] = []
  init = true

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private translate: TranslateService,
    private modalCtrl: ModalsService,
    private router: Router,
    private localize: LocalizeRouterService,
    route: ActivatedRoute
  ) {
    firstValueFrom(route.queryParams).then(params => {
      if (params['username'])
        this.signupForm5.controls['username'].setValue(params['username'])
      if (params['login_hint'])
        this.signupForm5.controls['username'].setValue(params['login_hint'])
    })
  }

  ngOnInit(): void {
    // check if there was any previously saved data and sjip steps accordingly
    const step1 = localStorage.getItem('com.brabopak.shop.new-customer.step1')
    const step2 = localStorage.getItem('com.brabopak.shop.new-customer.step2')
    const step3 = localStorage.getItem('com.brabopak.shop.new-customer.step3')
    const step4 = localStorage.getItem('com.brabopak.shop.new-customer.step4')
    const step5 = localStorage.getItem('com.brabopak.shop.new-customer.step5')

    if (step1) {
      this.signupForm1.setValue(JSON.parse(step1))
      this.signupForm1.updateValueAndValidity()
      if (this.signupForm1.valid) {
        this.currentStep = 2
      }
      if (step2) {
        this.signupForm2.setValue(JSON.parse(step2))
        this.signupForm2.updateValueAndValidity()
        if (this.signupForm2.valid) {
          this.currentStep = this.signupForm2.value.alternateAddress ? 3 : 4
        }
        if (step3 && this.currentStep === 3) {
          this.signupForm3.setValue(JSON.parse(step3))
          this.signupForm3.updateValueAndValidity()
          if (this.signupForm3.valid) {
            this.currentStep = 4
          }
        }
        if (step4 && this.currentStep === 4) {
          this.signupForm4.setValue(JSON.parse(step4))
          this.signupForm4.updateValueAndValidity()
          if (this.signupForm4.valid) {
            this.currentStep = 5
          }
        }
        if (step5 && this.currentStep === 5) {
          this.signupForm5.setValue(JSON.parse(step5))
          this.signupForm5.updateValueAndValidity()
        }
      }
    }

    setTimeout(() => {
      this.init = false
    })
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => {
      if (sub) {
        sub.unsubscribe()
      }
    })
  }

  setStep(id: number) {
    this.currentStep = id
  }

  back() {
    switch (this.currentStep) {
      case 2:
        return this.setStep(1)

      case 3:
        return this.setStep(2)

      case 4:
        return this.setStep(this.signupForm2.value.alternateAddress ? 3 : 2)

      case 5:
        return this.setStep(4)
    }
    this.ref.markForCheck()
  }

  async submit(step: number) {
    if (this.isLoading) return

    switch (step) {
      case 1:
        if (!this.signupForm1.valid) return
        await this.Step1Complete()
        break

      case 2:
        if (!this.signupForm2.valid) return
        await this.Step2Complete()
        break

      case 3:
        if (!this.signupForm3.valid) return
        await this.Step3Complete()
        break

      case 4:
        if (!this.signupForm4.valid || !this.areOpeningHoursValid) return
        await this.Step4Complete()
        break

      case 5:
        if (!this.signupForm5.valid) return
        await this.Step5Complete()
        break
    }
  }

  correct(element: AbstractControl | null) {
    if (!element) return
    const currentvalue = element.value

    if (+currentvalue) {
      const number = +currentvalue
      if (number >= 1 && number <= 23) {
        element.setValue(`${number < 10 ? '0' : ''}${number}:00`)
      }
    }
  }

  async Step1Complete() {
    // validate values and continue when validated
    try {
      // const response = await this.api.postValidate('step1', this.newCustomerStep1Form.value).toPromise()

      // this.newCustomerStep1Form.setErrors(null)
      // if (response['companyName'] == false) {
      //   this.newCustomerStep1Form.setErrors({ 'companyName-invalid': true, ...this.newCustomerStep1Form.errors })
      // }
      // if (response['companyVat'] == false) {
      //   this.newCustomerStep1Form.setErrors({ 'companyVat-invalid': true, ...this.newCustomerStep1Form.errors })
      // }
      // if (response['companyPhone'] == false) {
      //   this.newCustomerStep1Form.setErrors({ 'companyPhone-invalid': true, ...this.newCustomerStep1Form.errors })
      // }

      // if (this.newCustomerStep1Form.valid) {
      //   // take form value and 1:1 copy to localstore if user browser crashes or is closed
      //   localStorage.setItem('com.brabopak.shop.new-customer.step1', JSON.stringify(this.newCustomerStep1Form.value))

      //   this.currentStep = 2
      // }
      localStorage.setItem('com.brabopak.shop.new-customer.step1', JSON.stringify(this.signupForm1.value))
      this.currentStep = 2
    } catch (err) {
      // alert(err.message)
    } finally {
      this.ref.markForCheck()
    }
  }

  async Step2Complete() {
    try {
      // const response = await this.api.postValidate('step2', this.newCustomerStep2Form.value).toPromise()

      // this.newCustomerStep2Form.setErrors(null)
      // if (response['companyName'] == false) {
      //   this.newCustomerStep2Form.setErrors({ 'companyName-invalid': true, ...this.newCustomerStep2Form.errors })
      // }
      // if (response['companyVat'] == false) {
      //   this.newCustomerStep2Form.setErrors({ 'companyVat-invalid': true, ...this.newCustomerStep2Form.errors })
      // }
      // if (response['companyVatUsed'] == true) {
      //   this.newCustomerStep2Form.setErrors({ 'companyVat-used': true, ...this.newCustomerStep2Form.errors })
      // }
      // if (response['companyVatExempt'] == true) {
      //   this.newCustomerStep2Form.setErrors({ 'companyVat-exempt': true, ...this.newCustomerStep2Form.errors })
      // }
      // if (response['companyPhone'] == false) {
      //   this.newCustomerStep2Form.setErrors({ 'companyPhone-invalid': true, ...this.newCustomerStep2Form.errors })
      // }

      // if (this.newCustomerStep2Form.valid) {
      //   // take form value and 1:1 copy to localstore if user browser crashes or is closed
      //   localStorage.setItem('com.brabopak.shop.new-customer.step2', JSON.stringify(this.newCustomerStep2Form.value))

      //   this.currentStep = this.newCustomerStep2Form.value.alternateAddress ? 3 : 4
      // }
      localStorage.setItem('com.brabopak.shop.new-customer.step2', JSON.stringify(this.signupForm2.value))
      this.currentStep = this.signupForm2.value.alternateAddress ? 3 : 4
    } catch (err) {

    } finally {
      this.ref.markForCheck()
    }
  }

  async Step3Complete() {
    try {
      this.currentStep = 4
    } catch (err) {

    } finally {
      // take form value and 1:1 copy to localstore if user browser crashes or is closed
      localStorage.setItem('com.brabopak.shop.new-customer.step3', JSON.stringify(this.signupForm3.value))
      this.ref.markForCheck()
    }
  }

  async Step4Complete() {
    try {
      this.currentStep = 5
    } catch (err) {

    } finally {
      // take form value and 1:1 copy to localstore if user browser crashes or is closed
      localStorage.setItem('com.brabopak.shop.new-customer.step4', JSON.stringify(this.signupForm4.value))
      this.ref.markForCheck()
    }
  }

  async Step5Complete() {
    this.isLoading = true
    this.ref.markForCheck()

    // take form value and 1:1 copy to localstore if user browser crashes or is closed
    localStorage.setItem('com.brabopak.shop.new-customer.step5', JSON.stringify(this.signupForm5.value))


    const signupResponse: any = await this.auth.signup({
      step1: this.signupForm1.value,
      step2: this.signupForm2.value,
      step3: this.signupForm3.value,
      step4: this.signupForm4.value,
      step5: this.signupForm5.value
    })

    if (signupResponse.data.success === true) {
      const modal = new Modal('success', 'Registratie gelukt', 'Je hebt je succesvol aangemeld voor een account op de Brabopak webshop, dit verzoek word manueel behandeld, je word zo snel mogelijk gecontacteerd door een van onze medewerkers.')
      this.signupForm1.reset()
      this.signupForm2.reset()
      this.signupForm3.reset()
      this.signupForm4.reset()
      this.signupForm5.reset()

      localStorage.removeItem('com.brabopak.shop.new-customer.step1')
      localStorage.removeItem('com.brabopak.shop.new-customer.step2')
      localStorage.removeItem('com.brabopak.shop.new-customer.step3')
      localStorage.removeItem('com.brabopak.shop.new-customer.step4')
      localStorage.removeItem('com.brabopak.shop.new-customer.step5')

      await this.modalCtrl.show(modal)
      this.router.navigate([this.localize.translateRoute('/products')])
    } else
      this.modalCtrl.show(new Modal('alert', 'Interne serverfout!', 'Er is een probleem opgetreden bij het behandelen van je verzoek, probeer later opnieuw of gelieve contact op te nemen met ons support team.'))

    this.ref.markForCheck()
  }

  get areOpeningHoursValid(): boolean {
    let daysComplete = 0

    if (this.signupForm4.controls['moAmFr'].valid && this.signupForm4.controls['moAmTo'].valid && this.signupForm4.controls['moAmFr'].value && this.signupForm4.controls['moAmTo'].value) {
      daysComplete++
    }
    if (this.signupForm4.controls['tuAmFr'].valid && this.signupForm4.controls['tuAmTo'].valid && this.signupForm4.controls['tuAmFr'].value && this.signupForm4.controls['tuAmTo'].value) {
      daysComplete++
    }
    if (this.signupForm4.controls['weAmFr'].valid && this.signupForm4.controls['weAmTo'].valid && this.signupForm4.controls['weAmFr'].value && this.signupForm4.controls['weAmTo'].value) {
      daysComplete++
    }
    if (this.signupForm4.controls['thAmFr'].valid && this.signupForm4.controls['thAmTo'].valid && this.signupForm4.controls['thAmFr'].value && this.signupForm4.controls['thAmTo'].value) {
      daysComplete++
    }
    if (this.signupForm4.controls['frAmFr'].valid && this.signupForm4.controls['frAmTo'].valid && this.signupForm4.controls['frAmFr'].value && this.signupForm4.controls['frAmTo'].value) {
      daysComplete++
    }

    return daysComplete > 1
  }

  get currentUsername(): string | undefined {
    const { username } = this.signupForm5.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
