import { Component, ElementRef, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { SnackbarService } from 'app/services/snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-client-update-telephone',
  templateUrl: './client-update-telephone.component.html',
  styleUrls: ['./client-update-telephone.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatButtonToggleModule

  ]
})
export class ClientUpdateTelephoneComponent implements OnInit {
   @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
    otpForm: FormGroup;
    loading = false;
    readonly clienteSignal = signal<any | null>(null);
    displayedColumns: string[] = ['nome', 'acoes'];
    dataSource = new MatTableDataSource<any>([]);
    cpf: any;
    registrationTelefoneForm: FormGroup;
    registrationCodigoForm: FormGroup;
    selectedOption: string = 'registrar';

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly authService: AuthService,
        private readonly snackbarService: SnackbarService,
        private readonly _snackBar: MatSnackBar,

    ) {
        this.otpForm = this.fb.group({
            digit0: ['', [Validators.required, Validators.pattern('[0-9]')]],
            digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
            digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
            digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
            digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
            digit5: ['', [Validators.required, Validators.pattern('[0-9]')]]
        });
    }

    ngOnInit(): void {
        // Criação independente dos dois FormGroups
        this.registrationTelefoneForm = this.fb.group({
            telefone: ['', [
                Validators.required,
                // Regex para validar apenas números de celular brasileiros: DDD (2 dígitos) + 9 + 8 dígitos
                // Aceita formatos com ou sem máscara, com ou sem espaços/parênteses/hífen
                Validators.pattern(/^(\(?\d{2}\)?\s?)?(9\d{4})-?(\d{4})$/)
            ]],
        });

        this.registrationCodigoForm = this.fb.group({
            codigo: ['', [
                Validators.required,
                Validators.pattern(/^\d{6}$/) // Aceita apenas 6 dígitos
            ]]
        });

        this.dataSource.data = [];

        // TODO: Implementar busca de cliente
        /*
        this.clienteService.getClienteByEmail().subscribe({
            next: cliente => {

                if (!cliente) {
                    console.log('Cliente não encontrado');
                    // Adiciona a rota de origem para uso posterior
                    localStorage.setItem('origem-efichas', window.location.pathname);
                    window.location.href = '/atualizarcpf';
                    this.clienteSignal.set(null);
                    return;
                }
                console.log(cliente);
                this.clienteSignal.set(cliente);
            },
            error: error => {
                console.log(error);
                localStorage.setItem('origem-efichas', window.location.pathname);
                window.location.href = '/atualizarcpf';
                this.clienteSignal.set(null);
            }
        });
        */
    }

    onOtpInput(index: number, event: any) {
        const input = event.target as HTMLInputElement;
        let value = input.value;

        // Only allow numbers
        value = value.replace(/[^0-9]/g, '');
        input.value = value;

        const otpInputsArr = this.otpInputs.toArray();

        // Auto-focus next input if it exists
        if (value.length === 1 && index < otpInputsArr.length - 1) {
            otpInputsArr[index + 1].nativeElement.focus();
        }

        // Handle backspace/delete (consider using keydown event for this)
        if ((event.key === 'Backspace' || event.key === 'Delete') && index > 0 && value === '') {
            otpInputsArr[index - 1].nativeElement.focus();
        }
    }

    onOtpPaste(event: ClipboardEvent, index: number) {
        event.preventDefault();
        const pasteData = event.clipboardData?.getData('text/plain').slice(0, 6);
        if (!pasteData?.match(/^\d{6}$/)) return;

        const digits = pasteData.split('');
        this.otpForm.patchValue({
            digit0: digits[0],
            digit1: digits[1],
            digit2: digits[2],
            digit3: digits[3],
            digit4: digits[4],
            digit5: digits[5]
        });

        // Focus last input after paste
        this.otpInputs.last.nativeElement.focus();
    }

    onSubmitTelefone() {

        let clienteSignal = this.clienteSignal();
        if (!clienteSignal) {
            this.openSnackBar("Cliente não encontrado. Por favor, tente novamente.", "error", "error");
            return;
        }

        const telefone = this.registrationTelefoneForm.get('telefone')?.value;
        const clienteId = clienteSignal.id;

        // TODO: Implementar atualização de telefone
        /*
        this.clienteService.atualizarTelefone(telefone, clienteId).subscribe({
            next: (result) => {
                this.openSnackBar("Código enviado para o seu celular. Favor conferir no Whatsapp o código enviado!", "success", "success");
                this.registrationTelefoneForm.patchValue({ telefone: "" });
            },
            error: (error) => {
                console.error('Error atualizando o Celular:', error);
                this.openSnackBar("Erro ao atualizar Celular", "error", "error");
            }
        });
        */

        this.openSnackBar(telefone, "success", "success");

    }

    onSubmitCodigo() {

        const otpValue = this.otpForm.value;
        const codigo = Object.values(otpValue).join('');

        let clienteSignal = this.clienteSignal();
        if (!clienteSignal) {
            this.openSnackBar("Cliente não encontrado. Por favor, tente novamente.", "error", "error");
            return;
        }

        const clienteId = clienteSignal.id;

        this.loading = true;

        // TODO: Implementar envio de código
        /*
        this.clienteService.informarCodigo(codigo, clienteId).subscribe({
            next: (result) => {
                this.loading = false;
                this.openSnackBar("Telefone atualizado com sucesso!", "success", "success");
                 this.registrationTelefoneForm.patchValue({ cpf: "" });
            },
            error: (error) => {
                this.loading = false;
                console.error('Error atualizando o Telefone:', error);
                this.openSnackBar("Erro ao atualizar Telefone", "error", "error");
            }
        });
        */

        this.loading = false;
        this.openSnackBar("Telefone atualizado com sucesso!", "success", "success");

    }

    openSnackBar(message: string, type: string, classCSS: string) {
        this._snackBar.open(message, 'Fechar', {
            duration: 5000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: [classCSS],
        });
    }

    reenviarCodigo() {

        // Implementar lógica para reenviar o código
        this.openSnackBar("Código reenviado com sucesso!", "success", "success");
    }

    clearForms() {
        this.registrationTelefoneForm?.reset();
        this.registrationCodigoForm?.reset();
    }
}
