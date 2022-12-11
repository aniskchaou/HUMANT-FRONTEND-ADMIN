import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecapital',
})
export class TitlecapitalPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    if (!value) return value;
    return value[0].toUpperCase() + value.substr(1).toLowerCase();
  }
}
