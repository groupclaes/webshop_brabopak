import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'claes-material-layout',
  templateUrl: './material-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class MaterialLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
