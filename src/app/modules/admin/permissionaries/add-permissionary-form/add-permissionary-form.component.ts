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
  addUserForm: FormGroup;

  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _fuseUtils = inject(FuseUtilsService);

  users = signal([])
  attendants = signal([])
  availableUsers = signal([])

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPermissionaryComponent>
  ) {
    this.fetchAttendants()
    this.fetchUsers()
    this.addUserForm = this.fb.group({
      user: ['', [Validators.required]],
    });
  }


  updateAvailableUsers() {
    // Extract claim IDs the user already has
    const attendants = new Set(this.attendants().map(user => user.userId));

    // Filter out claims that the user already has
    const available = this.users().filter(user => {
      return !attendants.has(user.userId);
    })

    console.log(available)
    this.availableUsers.set(available)
  }

  validateCPF(control: any) {
    if (!this._fuseUtils.validarCPF(control.value)) {
      return { invalidCPF: true };
    }
    return null;
  }

  submitForm(): void {
    if (this.addUserForm.valid) {
      const payload = {
        userId: this.addUserForm.value.user.userId,
        claimType: "Profile",
        claimValue: "3"
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
          console.log(this.attendants())
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
