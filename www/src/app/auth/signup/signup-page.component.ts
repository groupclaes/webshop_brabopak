import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { AuthService } from '../auth.service'

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
    companyVat: ['', [Validators.required, Validators.pattern('^((AT)?U\d{8}|(BE)?0\d{9}|(BG)?\d{9,10}|(CY)?\d{8}L|(CZ)?\d{8,10}|(DE)?\d{9}|(DK)?\d{8}|(EE)?\d{9}|(EL|GR)?\d{9}|(ES)?[0-9A-Z]\d{7}[0-9A-Z]|(FI)?\d{8}|(FR)?[0-9A-Z]{2}\d{9}|(GB)?(\d{9}(\d{3})?|[A-Z]{2}\d{3})|(HU)?\d{8}|(IE)?\dS\d{5}L|(IT)?\d{11}|(LT)?(\d{9}|\d{12})|(LU)?\d{8}|(LV)?\d{11}|(MT)?\d{8}|(NL)?\d{9}B\d{2}|(PL)?\d{10}|(PT)?\d{9}|(RO)?\d{2,10}|(SE)?\d{12}|(SI)?\d{8}|(SK)?\d{10})$')]], // BE0646994651
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
    moAmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    moAmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    moPmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    moPmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    tuAmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    tuAmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    tuPmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    tuPmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    weAmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    weAmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    wePmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    wePmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    thAmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    thAmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    thPmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    thPmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    frAmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    frAmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    frPmFr: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]],
    frPmTo: ['', [Validators.pattern(/^([01]?\d|2[0-3]):[0-5]\d$/)]]
  })
  signupForm5: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    surname: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.email]], // info@brabopak.com
    password: ['', [Validators.required, Validators.minLength(8)]], // shop2069
    password2: ['', [Validators.required, Validators.minLength(8)]], // shop2069
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
    private translate: TranslateService
  ) { }

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
    }
    if (step2) {
      this.signupForm2.setValue(JSON.parse(step2))
      this.signupForm2.updateValueAndValidity()
      if (this.signupForm2.valid) {
        this.currentStep = this.signupForm2.value.alternateAddress ? 3 : 4
      }
    }
    if (step3) {
      this.signupForm3.setValue(JSON.parse(step3))
      this.signupForm3.updateValueAndValidity()
      if (this.signupForm3.valid) {
        this.currentStep = 4
      }
    }
    if (step4) {
      this.signupForm4.setValue(JSON.parse(step4))
      this.signupForm4.updateValueAndValidity()
      if (this.signupForm4.valid) {
        this.currentStep = 5
      }
    }
    if (step5) {
      this.signupForm5.setValue(JSON.parse(step5))
      this.signupForm5.updateValueAndValidity()
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

  async signup() {
    if (!this.signupForm1.valid)
      return

    await this.signupSso()
  }

  async signupSso() {

  }

  get currentUsername(): string | undefined {
    const { username } = this.signupForm5.value
    if (username && username.length > 0) {
      return username
    }
    return undefined
  }
}
