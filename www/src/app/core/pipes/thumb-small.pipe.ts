import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'thumbSmall'
})
export class ThumbSmallPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace('s=thumb_l', 's=thumb')
  }

}
