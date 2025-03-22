import { Component, inject } from '@angular/core';
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
import { SnackbarService } from 'app/services/snackbar.service';

@Component({
    selector: 'app-add-user-form',
    templateUrl: './add-user-form.component.html',
    styleUrls: ['./add-user-form.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule
    ]
})
export class AddUserFormComponent {
    addUserForm: FormGroup;

    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);
    private _fuseUtils = inject(FuseUtilsService);

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddUserFormComponent>,
        private snackbar: SnackbarService,
    ) {
        this.addUserForm = this.fb.group({
            nome: ['', [Validators.required, Validators.maxLength(50)]],
            cpf: ['', [Validators.required, this.validateCPF.bind(this)]],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    validateCPF(control: any) {
        if (!this._fuseUtils.validarCPF(control.value)) {
            return { invalidCPF: true };
        }
        return null;
    }

    submitForm(): void {
        if (this.addUserForm.valid) {


            const payload = this.addUserForm.value;


            this._httpClient.post<ApiResponse<any>>(`${environment.API_URL}account/createuser`, payload, {
                headers: {
                    "Authorization": `Bearer ${this._authService.accessToken}`
                }
            }).pipe(
                catchError((error) => {
                    console.error("Error submitting form:", error);
                    return throwError(() => error);
                })
            ).subscribe((response) => {
                this.snackbar.success("Usuário criado com sucesso!", 30 * 1000)


                if (response.success) {
                    this.dialogRef.close({
                        value: this.addUserForm.value
                    });
                } else {

                    this.snackbar.error(response.message, 30 * 1000)

                    this.dialogRef.close({
                        response: response.message,
                        value: this.addUserForm.value
                    });
                }
            });
        }
    }

    closeModal(): void {
        this.dialogRef.close();
    }
}
