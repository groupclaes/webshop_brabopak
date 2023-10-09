import { Component, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'bra-terms-and-conditions-page',
  templateUrl: './terms-and-conditions-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class TermsAndConditionsPageComponent {

}
