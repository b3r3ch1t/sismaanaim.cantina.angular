import { Component, Inject, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { SnackbarService } from 'app/services/snackbar.service';

@Component({
    selector: 'app-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss'],
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatTableModule,
        MatSelectModule
    ]
})

export class UserDetailComponent {
    private readonly _httpClient = inject(HttpClient)
    private readonly  _authService = inject(AuthService)

    displayedColumns: string[] = ['claimType', 'claimValue', 'perfilUsuario', 'descriptionPerfilUsuario'];

    claimList = signal<{ id: number, name: string }[]>([]);
    userClaims = signal([]);
    availableClaims: { id: number, name: string }[] = [];

    claimForm: FormGroup;

    constructor(
        private readonly fb: FormBuilder,
        private readonly dialogRef: MatDialogRef<UserDetailComponent>,
        private readonly snackbar: SnackbarService,

        @Inject(MAT_DIALOG_DATA) public user: any // Receive user data
    ) {
        this.userClaims.set(user.claims)
        this.updateAvailableClaims();
        this.claimForm = this.fb.group({
            selectedClaim: [null, Validators.required]
        });

        this.fetchClaimList()
    }

    addClaim() {
        const selectedClaim = this.claimForm.value.selectedClaim;
        if (selectedClaim) {
            const payload = {
                userId: this.user.userId,
                claimType: "Profile",
                claimValue: selectedClaim.id.toString()
            }

            // Add to userClaims and reset the form
            this._httpClient.post(`${environment.API_URL}account/addclaimaousuario`, payload, {
                headers: {
                    Authorization: 'Bearer ' + this._authService.accessToken
                }
            }).pipe(catchError(error => {
                throw error
            })).subscribe((response: ApiResponse<any>) => {


                if (response.success) {
                    this.snackbar.success("Adicionado com sucesso", 30 * 1000);

                } else {

                    this.snackbar.error(response.message, 30 * 1000)
                }


                this.userClaims.set(this.user.claims)
                this.updateAvailableClaims();
                this.claimForm = this.fb.group({
                    selectedClaim: [null, Validators.required]
                });

                this.fetchClaimList()

            })
        }
    }

    fetchClaimList() {
        this._httpClient.get(`${environment.API_URL}enum/listarperfilusuario`, {
            headers: {
                Authorization: 'Bearer ' + this._authService.accessToken
            }
        }).pipe(catchError(error => {
            throw error
        })).subscribe((response: ApiResponse<any>) => {
            if (response.success) {
                this.claimList.set(response.result)
                this.updateAvailableClaims();
            }
        })
    }


    updateAvailableClaims() {
        // Extract claim IDs the user already has
        const userClaimKeys = new Set(this.userClaims().map(claim => parseInt(claim.claimValue, 10)));

        // Filter out claims that the user already has
        this.availableClaims = this.claimList().filter(claim => {
            return !userClaimKeys.has(claim.id);
        });

    }

    closeDialog() {
        this.dialogRef.close();
    }

}
