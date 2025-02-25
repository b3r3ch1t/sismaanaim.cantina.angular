import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';

@Component({
  selector: 'app-payment-method-form',
  templateUrl: './payment-method-form.component.html',
  styleUrls: ['./payment-method-form.component.scss'],
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatCheckbox
  ]
})
export class PaymentMethodFormComponent {
  paymentForm: FormGroup;

  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentMethodFormComponent>
  ) {
    this.paymentForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.maxLength(50)]],
      aceitaEstorno: [false, Validators.required],
      ordemDebito: [1, [Validators.required, Validators.min(1)]]
    });
  }

  submitForm() {
    if (this.paymentForm.valid) {
      const payload = {
        descricao: this.paymentForm.value.descricao,
        aceitaEstorno: this.paymentForm.value.aceitaEstorno,
        ordemDebito: this.paymentForm.value.ordemDebito
      };

      this._httpClient.post(`${environment.API_URL}formapagamento/adicionarformapagamento`, payload, {
        headers: {
          "Authorization": `Bearer ${this._authService.accessToken}`
        }
      }).pipe(
        catchError((error) => {
          console.log(error);
          throw error
        })).subscribe((response: ApiResponse<any>) => {
          if (response.success) {
            this.dialogRef.close({
              response : response,
              value : this.paymentForm.value
            })
          }
        })

    }
  }

  closeModal() {
    this.dialogRef.close();
  }
}
