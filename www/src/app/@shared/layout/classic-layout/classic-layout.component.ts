import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'claes-classic-layout',
  templateUrl: './classic-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class ClassicLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
