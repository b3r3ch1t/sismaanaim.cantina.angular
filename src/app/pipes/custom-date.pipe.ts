import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    
    try {
      return formatDate(value, 'dd/MM/yyyy HH:mm', 'pt-BR');
    } catch (error) {
      console.error('Invalid date:', error);
      return '';
    }
  }
}
