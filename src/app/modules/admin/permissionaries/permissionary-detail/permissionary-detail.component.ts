import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { ConfirmationService } from 'app/services/confirmation.service';
import { SnackbarService } from 'app/services/snackbar.service';
import { catchError, throwError } from 'rxjs';

@Component({
    selector: 'app-permissionary-detail',
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatIconModule
    ],
    templateUrl: './permissionary-detail.component.html',
    styleUrl: './permissionary-detail.component.scss'
})
export class PermissionaryDetailComponent {
    permissionary: any;


    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);

    userPermissionary = signal([]);
    permissionaryForm: FormGroup;
    users = signal([]);
    availableUsers = signal([]);

    displayedColumns: string[] = ['nome', 'cpf', 'actions'];


    constructor(


        private readonly snackbarService: SnackbarService,
        private readonly confirmationService: ConfirmationService,
        private readonly fb: FormBuilder,
        private readonly dialogRef: MatDialogRef<PermissionaryDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any

    ) {
        this.permissionary = data;


        this.fetchUsersWithProfile();
        this.fetchUsers();

        this.permissionaryForm = this.fb.group({
            selectedUser: [null, Validators.required]
        });

    }


    fetchUsersWithProfile() {

        this._httpClient.get(`${environment.API_URL}permissionario/getusuariosvinculadosaopermissionario/${this.permissionary.id}`, {
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
                    // Ordena por propriedade 'nome' (caso-insensitivo)
                    const sortedResult = data.result.sort((a, b) =>
                        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
                    );

                    this.userPermissionary.set(sortedResult);
                    this.updateAvailableUsers();
                }
            });
    }


    addUser() {

        console.log("userId", this.permissionaryForm.value);


        const payload = {
            permissionarioId: this.permissionary.id ,
            userId: this.permissionaryForm.value.selectedUser.userId,
        };

        console.log("payload", payload);


        this._httpClient.post<ApiResponse<any>>(`${environment.API_URL}permissionario/vincularusuariopermissionario`, payload, {
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

                this.fetchUsersWithProfile();
                this.fetchUsers();
            }

            if (response.error) {
                this.snackbarService.error(response.errors.join(", "))
            }
        });


    }


    closeDialog() {
        this.dialogRef.close();
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

                    this.users.set(data.result);
                    this.updateAvailableUsers();
                }
            });
    }


    updateAvailableUsers() {
        // Extrai os IDs dos operadores que o usuário já possui
        const operators = new Set(this.userPermissionary().map(user => user.userId));

        // Filtra os usuários disponíveis que não estão na lista de operadores
        const available = this.users().filter(user => {
            return !operators.has(user.userId);
        });

        // Ordena os usuários disponíveis por nome
        available.sort((a, b) => a.nome.localeCompare(b.nome));


        this.availableUsers.set(available);

        console.log("available", available);
    }


    removeUser(user) {

        this.confirmationService.confirm("Confirmar", "Tem certeza de que deseja remover este usuário?").subscribe(result => {
            if (result) {


                this._httpClient.request('DELETE', `${environment.API_URL}permissionario/desvincularusuariopermissionario`, {
                    headers: {
                        "Authorization": `Bearer ${this._authService.accessToken}`,
                        "Content-Type": "application/json" // Ensure JSON is sent properly
                    },
                    body: {
                        permissionarioId: this.permissionary.id,
                        userId: user.userId
                    }
                }).subscribe({
                    next: (response: ApiResponse<any>) => {
                        if (response.success) {


                            this.snackbarService.success("Usuário removido com sucesso")
                            this.fetchUsersWithProfile();
                            this.fetchUsers();
                        }

                        if (response.error) {
                            this.snackbarService.error(response.errors.join(", "))
                        }
                    },
                    error: (error) => {
                        console.error('Error:', error);
                    }
                });

            }

        });
    }



}
