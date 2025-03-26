import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-attendant-form',
    templateUrl: './add-attendant-form.component.html',
    styleUrls: ['./add-attendant-form.component.scss'],
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
export class AddAttendantFormComponent {
    addUserForm: FormGroup;

    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);
    private readonly _fuseUtils = inject(FuseUtilsService);

    // Signals
    users = signal<any[]>([]);
    attendants = signal<any[]>([]);
    evento = signal<any | null>(null);

    // Computed signal: available users
    availableUsers = computed(() => {
        const allUsers = this.users();
        const assignedUserIds = new Set(this.attendants().map(u => u.id));

        const available = allUsers
        .filter(user => !assignedUserIds.has(user.userId))
        .sort((a, b) => a.nome.localeCompare(b.nome));


        return available;
    });

    constructor(
        private readonly fb: FormBuilder,
        private readonly dialogRef: MatDialogRef<AddAttendantFormComponent>,
        private readonly snackbarService: SnackbarService,
        private readonly confirmationService: ConfirmationService,
        private readonly router: Router,
    ) {
        this.addUserForm = this.fb.group({
            user: ['', [Validators.required]],
        });

        this.fetchEvent();
        this.fetchUsers();
    }

    fetchEvent() {
        this._httpClient.get<ApiResponse<any>>(`${environment.API_URL}evento/getcurrentevent`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
        .pipe(
            catchError((error) => {
                console.error(error);
                throw error;
            })
        )
        .subscribe((data) => {
            if (data.code === 3) {
                this.snackbarService.info("Não existe evento aberto.");
                this.router.navigate(['/permissionary-dashboard']);
                return;
            }

            if (data.success) {
                this.evento.set(data.result);
                this.fetchAttendants();
            }
        });
    }

    fetchUsers() {
        this._httpClient.get<ApiResponse<any>>(`${environment.API_URL}account/gettodosatendentes`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
        .pipe(catchError((error) => {
            console.error(error);
            throw error;
        }))
        .subscribe((data) => {

            if (data.success) {
                this.users.set(data.result);
            }
        });
    }

    fetchAttendants() {
        const eventoId = this.evento()?.id;
        if (!eventoId) return;

        this._httpClient.get<ApiResponse<any>>(`${environment.API_URL}permissionario/getatendentesporeventoporpermissionario/${eventoId}`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
        .pipe(catchError((error) => {
            console.error(error);
            throw error;
        }))
        .subscribe((data) => {

            if (data.success) {
                this.attendants.set(data.result);
            }
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

            const atendenteId = this.addUserForm.value.user.userId;

            this._httpClient.post<ApiResponse<any>>(`${environment.API_URL}account/addatendenteaopermissionario/${atendenteId}`, null, {
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

    closeModal(): void {
        this.dialogRef.close();
    }
}
