import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseUtilsService } from '@fuse/services/utils';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from 'app/environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';

@Component({
  selector: 'app-client-registration',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './client-registration.component.html',
  styleUrl: './client-registration.component.scss'
})

export class ClientRegistrationComponent implements OnInit {

  clientForm: FormGroup;
  showAdditionalFields = false;
  isUpdate = false;
  emailTypes: any[] = [];
  isValidEmail = false;


  client = signal(null)

  constructor(
    private fb: FormBuilder,
    private fuseUtils: FuseUtilsService,
    private http: HttpClient,
    private _authService : AuthService,
    private _confirmationService : ConfirmationService,
    private _snackbarService : SnackbarService
  ) {
    this.clientForm = this.fb.group({
      cpf: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
      telefoneContato: ['', [Validators.pattern(/^\(?([1-9]{2})\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/)]],
      email: ['', [Validators.email]],
      tipoEnvioEmailCliente: [0]
    });
  }

  ngOnInit(): void {
    this.loadEmailTypes()
  }

  onCpfInput(event: any) {
    const cpf = event.target.value.replace(/\D/g, '');
    if (cpf.length === 11) {
      if (this.fuseUtils.validarCPF(cpf)) {
        this.checkExistingClient(cpf);
      } else {
        this.clientForm.get('cpf')?.setErrors({ invalidCpf: true });
      }
    }
  }

  checkExistingClient(cpf: string) {
    this.http.get(`${environment.API_URL}clientes/getclientesbycpf/${cpf}`).subscribe({
      next: (response: any) => {
        this.clientForm.disable();
        if (response.success && response.result.length) {
          this.isUpdate = true;
          this.showAdditionalFields = true;
          const data = {...response.result[0], telefoneContato: response.result[0].telefoneContato.replace("+55", '')}
          this.clientForm.patchValue(data);
        } else {
          this.isUpdate = false;
          this.showAdditionalFields = true;
          this.clientForm.patchValue({
            nome: '',
            telefoneContato: '',
            email: '',
            tipoEnvioEmailCliente: 0
          });
        }
        this.clientForm.enable()
      },
      error: (error) => {
        console.error('Error checking client:', error);
      }
    });
  }

  formatPhone(event: any) {
    let phone = event.target.value.replace(/\D/g, '');
    if (phone.length >= 10) {
      phone = phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
      this.clientForm.get('telefoneContato')?.setValue(phone, { emitEvent: false });
    }
  }

  loadEmailTypes() {
    this.http.get(`${environment.API_URL}enum/listartipoenvioemailcliente`).subscribe({
      next: (types: any) => {
        this.emailTypes = types;
      },
      error: (error) => {
        console.error('Error loading email types:', error);
      }
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      const confirmationMessage = `
        CPF: ${this.clientForm.get('cpf')?.value} <br>
        Nome: ${this.clientForm.get('nome')?.value} <br>
        Telefone Contato: ${this.clientForm.get('telefoneContato').value !== '' ? '+55' + this.clientForm.get('telefoneContato').value.toString() : ''} <br>
        Email: ${this.clientForm.get('email')?.value} <br>` ;

        this._confirmationService.confirm("Confirma os dados?", confirmationMessage).subscribe((result) => {
          if (result) { 
            const endpoint = this.isUpdate ? 'clientes/updatecliente' : 'clientes/addcliente';
            if (this.isUpdate) {
              this.http.put(`${environment.API_URL}${endpoint}`, this.clientForm.value, { headers: { "Authorization": `Bearer ${this._authService.accessToken}` } }).subscribe({
                next: (response: any) => {
                  if (response.success) {
                    this._snackbarService.success('Operação realizada com sucesso!');
                  } else {
                    this._snackbarService.error(response.message);
                  }
                  this.clientForm.reset()
                },
                error: (error) => {
                  this._snackbarService.error('Erro ao processar a requisição');
                }
              });

            } else {
              this.http.post(`${environment.API_URL}${endpoint}`, this.clientForm.value, { headers: { "Authorization": `Bearer ${this._authService.accessToken}` } }).subscribe({
                next: (response: any) => {
                  if (response.success) {
                    this._snackbarService.success('Operação realizada com sucesso!');
                  } else {
                    this._snackbarService.error(response.message);
                  }

                  this.clientForm.reset()
                },
                error: (error) => {
                  this._snackbarService.error('Erro ao processar a requisição');
                }
              });

            }
    
          }
        })


    }
  }

}
