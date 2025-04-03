import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
    name: 'customCurrency',
    standalone: true,
})
export class CustomCurrencyPipe implements PipeTransform {
    private currencyPipe = inject(CurrencyPipe);
    constructor() { }

    transform(value: number): string {

        if(value === null || value === undefined) {

            return '';
        }

        if(value === 0) {
            return 'R$ 0,00';

        }

        return this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2', 'pt-BR');
    }
}
