import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'claes-thin-layout',
  templateUrl: './thin-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class ThinLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
