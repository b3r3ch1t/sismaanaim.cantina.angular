import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SnackbarService } from 'app/services/snackbar.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  imports : [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatButtonModule,
    MatInputModule
  ]
})
export class EventFormComponent {

  private readonly _httpClient = inject(HttpClient)
  private readonly  _authService = inject(AuthService)

  eventForm: FormGroup;
  isEditMode = false;  // Flag to check if it's editing mode

  constructor(
    private readonly  fb: FormBuilder,
    private readonly  dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public eventData: any, // Receive event data,
    private readonly  snackbarService: SnackbarService
  ) {
    this.eventForm = this.fb.group({
      id: [null], // Keep track of event ID
      nome: ['', [Validators.required, Validators.maxLength(50)]],
      dataInicial: ['', [Validators.required, this.futureDateValidator]],
      dataFinal: ['', [Validators.required]]
    });

    if (eventData) {
      this.isEditMode = true;
      this.eventForm.patchValue({
        id: eventData.id,
        nome: eventData.nome,
        dataInicial: this.formatDate(eventData.dataInicial), // Convert date to proper format
        dataFinal: this.formatDate(eventData.dataFinal)
      }); // Prefill form for editing
    }
  }

   // **Ensure date format is 'YYYY-MM-DD'**
   formatDate(date: string | Date): string {
    if (!date) return ''; // Prevent null/undefined errors
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  //  Custom Validator: Start Date must be at least D+1
  futureDateValidator(control: any) {
    if (!control.value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera horário

    const selectedDate = new Date(control.value);
    selectedDate.setHours(selectedDate.getHours() + 3); // Ajusta para UTC-3


    selectedDate.setHours(0, 0, 0, 0); // Zera horário


    return selectedDate >= today ? null : { invalidDate: true };
  }

  //  Ensure End Date is at least Start Date +1 day
  validateEndDate() {
    const startDate = new Date(this.eventForm.value.dataInicial);
    const endDate = new Date(this.eventForm.value.dataFinal);

    if (endDate <= startDate) {
      this.eventForm.get('dataFinal')?.setErrors({ invalidEndDate: true });
    }
  }

  // Submit the form (Create or Update)
  submitForm() {
    if (this.eventForm.valid) {
      const payload = {id : this.eventData?.id, ...this.eventForm.value};
      console.log(payload)

      const url = this.isEditMode
        ? `${environment.API_URL}evento/editarevento` // PUT for update
        : `${environment.API_URL}evento/adicionarevento`; // POST for create

      const httpMethod = this.isEditMode ? this._httpClient.put : this._httpClient.post;

      httpMethod.call(this._httpClient, url, payload, {
        headers: { Authorization: `Bearer ${this._authService.accessToken}` }
      })
      .pipe(catchError(error => {
        console.log(error);
        throw error;
      }))
      .subscribe((response: ApiResponse<any>) => {
        console.log(response);
        if (response.success) {
          this.dialogRef.close({
            value: payload,
            response: response
          });
        }else{
          this.snackbarService.error(response.errors.join(", "))
        }
      });
    }
  }
}
