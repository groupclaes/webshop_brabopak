import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'claes-futuristic-layout',
  templateUrl: './futuristic-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class FuturisticLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
