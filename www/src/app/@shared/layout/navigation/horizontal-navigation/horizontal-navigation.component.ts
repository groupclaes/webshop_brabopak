import { Component, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'claes-horizontal-navigation',
  templateUrl: './horizontal-navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center md:space-x-4 text-secondary'
  }
})
export class HorizontalNavigationComponent {
  categories: any[] = [
    {
      id: 1,
      name: 'Verpakking'
    },
    {
      id: 2,
      name: 'Bedrukkingen'
    },
    {
      id: 3,
      name: 'Voeding'
    },
    {
      id: 4,
      name: 'Onderhoud' //  en hulpmaterialen
    }
  ]
  constructor() { }
}
