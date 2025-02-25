import { Injectable } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FuseUtilsService {
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = true".
     */
    get exactMatchOptions(): IsActiveMatchOptions {
        return {
            paths: 'exact',
            fragment: 'ignored',
            matrixParams: 'ignored',
            queryParams: 'exact',
        };
    }

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = false".
     */
    get subsetMatchOptions(): IsActiveMatchOptions {
        return {
            paths: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
            queryParams: 'subset',
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generates a random id
     *
     * @param length
     */
    randomId(length: number = 10): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';

        for (let i = 0; i < 10; i++) {
            name += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return name;
    }

    validarCPF(cpf: string): boolean {
        // Remove caracteres não numéricos
        const cpfLimpo = cpf.replace(/\D/g, '');

        // Verifica se o CPF tem 11 dígitos ou é inválido
        if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
            return false;
        }

        // Função auxiliar para cálculo do dígito verificador
        const calcularDigito = (base: string, pesoInicial: number): number => {
            const soma = base
                .split('')
                .reduce((acc, num, index) => acc + parseInt(num) * (pesoInicial - index), 0);
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        // Calcula os dois dígitos verificadores
        const base = cpfLimpo.substring(0, 9);
        const digito1 = calcularDigito(base, 10);
        const digito2 = calcularDigito(base + digito1, 11);

        // Verifica se os dígitos calculados são iguais aos fornecidos
        return cpfLimpo === base + digito1 + digito2;
    }


    validarCNPJ(cnpj: string): boolean {
        if (!cnpj) return false;

        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/[^\d]+/g, '');

        if (cnpj.length !== 14) return false;

        // Elimina CNPJs com todos os dígitos iguais (ex: 00000000000000)
        if (/^(\d)\1+$/.test(cnpj)) return false;

        // Cálculo dos dígitos verificadores
        const validarDigito = (cnpj: string, pesoInicial: number) => {
          let soma = 0;
          let peso = pesoInicial;

          for (let i = 0; i < cnpj.length; i++) {
            soma += parseInt(cnpj[i]) * peso--;
            if (peso < 2) peso = 9;
          }

          const resto = soma % 11;
          return resto < 2 ? 0 : 11 - resto;
        };

        const cnpjBase = cnpj.slice(0, 12);
        const primeiroDV = validarDigito(cnpjBase, 5);
        const segundoDV = validarDigito(cnpjBase + primeiroDV, 6);

        return primeiroDV === parseInt(cnpj[12]) && segundoDV === parseInt(cnpj[13]);
      }


}
