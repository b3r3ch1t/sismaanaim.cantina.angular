import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { FuseUtilsService } from '@fuse/services/utils';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-permissionary-form',
  templateUrl: './add-permissionary-form.component.html',
  styleUrls: ['./add-permissionary-form.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class AddPermissionaryComponent {
  addPermissionario: FormGroup;

  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _fuseUtils = inject(FuseUtilsService);

  users = signal([])
  attendants = signal([])
  availableUsers = signal([])
  tiposPermissionario = signal([]);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPermissionaryComponent>
  ) {
    this.fetchAttendants()
    this.fetchUsers()
    this.fetchTiposPermissionario()
    this.addPermissionario = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      codigo: ['', [Validators.required, Validators.maxLength(14)]],
      tipoPermissionario: ['', [Validators.required]],
      responsavel: ['', [Validators.required, Validators.maxLength(100)]],
      percentualPermissionario: [0, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }


  updateAvailableUsers() {
    // Extract claim IDs the user already has
    const attendants = new Set(this.attendants().map(user => user.userId));

    // Filter out claims that the user already has
    const available = this.users().filter(user => {
      return !attendants.has(user.userId);
    })
 
    this.availableUsers.set(available)
  }

  validateCPF(control: any) {
    if (!this._fuseUtils.validarCPF(control.value)) {
      return { invalidCPF: true };
    }
    return null;
  }

  onCodigoInput(event: any) {
    const codigo = event.target.value.replace(/\D/g, '');

    this.addPermissionario.get('codigo')?.setValue(codigo);

    if (codigo.length === 11) {
      // Valida CPF
      if (this._fuseUtils.validarCPF(codigo)) {
        this.addPermissionario.get('codigo')?.setErrors(null);
      } else {
        this.addPermissionario.get('codigo')?.setErrors({ invalidCodigo: true });
      }
    } else if (codigo.length === 14) {
      // Valida CNPJ
      if (this._fuseUtils.validarCNPJ(codigo)) {
        this.addPermissionario.get('codigo')?.setErrors(null);
      } else {
        this.addPermissionario.get('codigo')?.setErrors({ invalidCodigo: true });
      }
    } else if (codigo.length > 0 && codigo.length !== 11 && codigo.length !== 14) {
      this.addPermissionario.get('codigo')?.setErrors({ invalidCodigo: true });
    }
  }

  submitForm(): void {
    if (this.addPermissionario.valid) {

      console.log("Submitting form with data:", this.addPermissionario.value);

      const formValue = this.addPermissionario.value;
      
      const payload = {
        nome: formValue.nome,
        codigo: formValue.codigo,
        tipoPermissionario: formValue.tipoPermissionario,
        responsavel: formValue.responsavel,
        percentualPermissionario: formValue.percentualPermissionario
      };

      // Aqui você deve substituir pela URL correta da sua API
      this._httpClient.post<ApiResponse<any>>(`${environment.API_URL}permissionario/AdicionarPermissionario`, payload, {
        headers: {
          "Authorization": `Bearer ${this._authService.accessToken}`
        }
      }).pipe(
        catchError((error) => {
          console.error("Error submitting form:", error);
          return throwError(() => error);
        })
      ).subscribe((response) => {
        if (response.success) {
          this.dialogRef.close({
            response,
            value: this.addPermissionario.value
          });
        }
      });
    }
  }

  fetchAttendants() {
    this._httpClient.get(`${environment.API_URL}account/gettodosatendentes`, {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.log(error);
        throw error;
      }))
      .subscribe((data: ApiResponse<any>) => {
        if (data.success) {
          this.attendants.set(data.result) 
          this.updateAvailableUsers()
        }
      });
  }

  fetchUsers() {
    this._httpClient.get(`${environment.API_URL}account/gettodosusuarios`, {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.log(error);
        throw error;
      }))
      .subscribe((data: ApiResponse<any>) => {
        if (data.success) {
          this.users.set(data.result) 
          this.updateAvailableUsers()
        }
      });
  }

  fetchTiposPermissionario() {
    this._httpClient.get(`${environment.API_URL}permissionario/gettipospermissionarios`, {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.log(error);
        throw error;
      }))
      .subscribe((data: ApiResponse<any>) => { 
        
        console.log("Tipos de Permissionário fetched:", data);

        if (data.success) {
          this.tiposPermissionario.set(data.result)
        }
      });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
