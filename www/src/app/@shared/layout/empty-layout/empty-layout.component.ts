import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'claes-empty-layout',
  templateUrl: './empty-layout.component.html',
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class EmptyLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
