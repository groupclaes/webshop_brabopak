import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterEmpty'
})
export class FilterEmptyPipe implements PipeTransform {
  transform(value: any[]): any[] {
    if (value) {
      return value.filter(block => block[0].products && block[0].products.length > 0)
    }
    return []
  }
}
