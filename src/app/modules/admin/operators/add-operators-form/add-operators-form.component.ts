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
    selector: 'app-add-operator-form',
    templateUrl: './add-operators-form.component.html',
    styleUrls: ['./add-operators-form.component.scss'],
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
export class AddOperatorFormComponent {
    addUserForm: FormGroup;

    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);
    private readonly _fuseUtils = inject(FuseUtilsService);

    users = signal([])
    operators = signal([])
    availableUsers = signal([])

    constructor(
        private readonly fb: FormBuilder,
        private readonly dialogRef: MatDialogRef<AddOperatorFormComponent>
    ) {
        this.fetchAttendants()
        this.fetchUsers()
        this.addUserForm = this.fb.group({
            user: ['', [Validators.required]],
        });
    }


    updateAvailableUsers() {
        // Extrai os IDs dos operadores que o usuário já possui
        const operators = new Set(this.operators().map(user => user.userId));

        // Filtra os usuários disponíveis que não estão na lista de operadores
        const available = this.users().filter(user => {
            return !operators.has(user.userId);
        });

        // Ordena os usuários disponíveis por nome
        available.sort((a, b) => a.nome.localeCompare(b.nome));


        this.availableUsers.set(available);
    }


    validateCPF(control: any) {
        if (!this._fuseUtils.validarCPF(control.value)) {
            return { invalidCPF: true };
        }
        return null;
    }

    submitForm(): void {
        console.log("HELLO WORLD")
        if (this.addUserForm.valid) {
            console.log("HELLO WORLD @")
            const payload = {
                userId: this.addUserForm.value.user.userId,
                claimType: "Profile",
                claimValue: "1"
            };

            this._httpClient.post<ApiResponse<any>>(`${environment.API_URL}account/addclaimaousuario`, payload, {
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
                        value: this.addUserForm.value
                    });
                }
            });
        }
    }

    fetchAttendants() {
        this._httpClient.get(`${environment.API_URL}account/gettodosoperadores`, {
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
                    this.operators.set(data.result)
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
                    console.log(this.users())
                    this.updateAvailableUsers()
                }
            });
    }


    closeModal(): void {
        this.dialogRef.close();
    }
}
