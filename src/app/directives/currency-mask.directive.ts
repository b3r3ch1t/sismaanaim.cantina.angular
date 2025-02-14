import { Directive, HostListener, ElementRef } from '@angular/core';
import { CustomCurrencyPipe } from 'app/pipes/custom-currency.pipe';

@Directive({
  selector: '[appCurrencyMask]'
})
export class CurrencyMaskDirective {
  constructor(private el: ElementRef, private _currencyPipe: CustomCurrencyPipe) {}

  @HostListener('change', ['$event'])
  onInput(event: KeyboardEvent) {
    const input = this.el.nativeElement;
    let value = input.value
      .replace('R$ ', '')   // Remove currency symbol
      .replace(/[^\d-]/g, '') // Remove all non-numeric characters except '-'
      .replace(/^0+/, '');  // Remove leading zeros

    if (value) {
      if (input.value.includes(',')) {
        value = value / 100
      }
      if(input.value == "-"){
        return
      }
      value = this._currencyPipe.transform(value)
      value = value.replace(/R\$\s*/, '').replace(/^0+/, '')
      input.value = `${value}`
    }
  }
}