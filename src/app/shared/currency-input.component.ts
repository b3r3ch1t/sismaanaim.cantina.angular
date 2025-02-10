import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-currency-input',
  template: `
  <mat-form-field>
      <input 
        #inputElement
        matInput
        [formControl]="currencyControl"
        [disabled]="disabled"
        (input)="onInput($event)"
        (change)="onChange($event)"
        (keypress)="onKeyPress($event)"
        (blur)="onBlur()"
        type="text"
        [placeholder]="placeholder"
      >
  </mat-form-field>
  `,
  standalone : true,
  imports  : [
    ReactiveFormsModule, 
    MatInputModule
  ],
  providers: [
    { provide: MatFormFieldControl, useExisting: CurrencyInputComponent }
  ]
})
export class CurrencyInputComponent {
  @Input() disabled = false;
  @Input() allowNegative = false;
  @Input() placeholder = 'Informe o Valor Devolvido';
  @Output() change = new EventEmitter<Event>();
  @Output() keypress = new EventEmitter<KeyboardEvent>();

  currencyControl = new FormControl('');

  // ✅ Use ViewChild to get the native input element
  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef<HTMLInputElement>;

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace('R$', '').trim();
    const isNegative = value.startsWith('-');
    value = value.replace(/[^\d,]/g, '');

    if (value === '') {
      input.value = '';
      return;
    }

    value = value.replace(',', '.');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts[1]?.length > 2) {
      value = parts[0] + '.' + parts[1].slice(0, 2);
    }

    const num = value.split('.');
    num[0] = num[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const formattedValue = num.join(',');
    input.value = `R$ ${isNegative && this.allowNegative ? '-' : ''}${formattedValue}`;
    this.currencyControl.setValue(input.value, { emitEvent: false });
  }

  onChange(event: Event) {
    this.change.emit(event);
  }

  onKeyPress(event: KeyboardEvent) {
    if (this.allowNegative && event.key === '-' && !this.currencyControl.value.includes('-')) {
      return;
    }

    if (!/[\d,]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
      return;
    }
    this.keypress.emit(event);
  }

  onBlur() {
    let value = this.currencyControl.value;
    if (!value) {
      this.currencyControl.setValue('R$ 0,00');
      return;
    }

    const isNegative = value.includes('-');
    value = value.replace('R$', '').replace(/[^\d,]/g, '');

    const number = parseFloat(value.replace(',', '.')) * (isNegative && this.allowNegative ? -1 : 1);
    if (!isNaN(number)) {
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Math.abs(number));

      this.currencyControl.setValue(`${isNegative && this.allowNegative ? '-' : ''}${formatted}`);
    }
  }

  // ✅ Get native input element safely
  focusInput() {
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }
}
