import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activePages'
})
export class ActivePagesPipe implements PipeTransform {
  transform(value: number[], arg?: number): number[] {
    if (!value) return []

    // if there are no more than 6 pages, there is no use doing anything special here
    if (value.length <= 6) {
      return value
    }

    if (arg) {
      if (arg > 2 && arg < value.length - 3)
        return [...value.slice(0, 3), arg + 1, ...value.slice(-3, value.length)]
    }

    // default first page get first 6 pages
    return [...value.slice(0, 3), ...value.slice(-3, value.length)]
  }
}
