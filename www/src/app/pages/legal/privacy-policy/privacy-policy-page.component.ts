import { Component, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'bra-privacy-policy-page',
  templateUrl: './privacy-policy-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class PrivacyPolicyPageComponent {

}
