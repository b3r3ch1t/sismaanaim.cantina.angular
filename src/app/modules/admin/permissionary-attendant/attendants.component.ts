import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ApiResponse } from 'app/core/api/api-response.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'app/environments/environment';
import { catchError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AddUserFormComponent } from '../users/add-user-form/add-user-form.component';
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { UserProfile } from 'app/core/user/user-profile.enum';
import { UserDetailComponent } from '../users/user-detail/user-detail.component';
import { AddAttendantFormComponent } from './add-attendant-form/add-attendant-form.component';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { CustomDatePipe } from 'app/pipes/custom-date.pipe';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-permissionary-attendants',
    templateUrl: './attendants.component.html',
    styleUrls: ['./attendants.component.css'],
    imports: [
        MatTableModule,
        MatPaginator,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,

        CustomDatePipe],
    providers: [
        CurrencyPipe,
    ],
})

export class PermissionaryAttendantComponent implements OnInit {
    private readonly _httpClient = inject(HttpClient);
    private readonly _authService = inject(AuthService);
    private readonly _userService = inject(UserService);

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    users = signal([]);
    usersDataSource = signal(new MatTableDataSource([]))
    userProfiles = UserProfile


    displayedColumns = [
        "Nome",
        "CPF",
        "DataAlteracao",
        "Ações"
    ]
    evento: any;

    constructor(
        private readonly dialog: MatDialog,
        private readonly snackbarService: SnackbarService,
        private readonly confirmationService: ConfirmationService,
        private readonly router: Router
    ) { }


    ngOnInit(): void {

        this.fetchEvent();
    }


    addAttendant() {
        const dialogRef = this.dialog.open(AddAttendantFormComponent, {
            width: '400px',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.response.success) {
                    this.snackbarService.success("Forma de pagamento criado com sucesso")
                    this.fetchUsers()
                }
            }
        });
    }


    detailUser(user) {
        this.dialog.open(UserDetailComponent, {
            data: user,
            width: "700px"
        })
    }

    removeUser(user) {
        this.confirmationService.confirm("Confirmar", "Tem certeza de que deseja remover este atendente?").subscribe(result => {
            if (result) {
                this._httpClient.request('DELETE', `${environment.API_URL}permissionario/RemoverAtendentePermissionarioEvento/`, {
                    headers: {
                        "Authorization": `Bearer ${this._authService.accessToken}`,
                        "Content-Type": "application/json" // Ensure JSON is sent properly
                    },
                    body: {
                        eventoId: this.evento.id,
                        userId: user.id,
                    }
                }).subscribe({
                    next: (response: ApiResponse<any>) => {
                        if (response.success) {
                            console.log('Deleted Successfully:', response);
                            this.snackbarService.success("Usuário removido com sucesso")
                            this.fetchUsers()
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
        })
    }

    fetchEvent() {
        this._httpClient.get(`${environment.API_URL}evento/getcurrentevent`, {
            headers: {
                "Authorization": `Bearer ${this._authService.accessToken}`
            }
        })
            .pipe(catchError((error) => {
                console.log(error);
                throw error;
            }))
            .subscribe((data: ApiResponse<any>) => {

                if (data.code == 3) {

                    this.snackbarService.info("Não existe evento aberto.");

                    this.router.navigate(['/permissionary-dashboard']);
                    return;
                }


                if (data.success) {
                    this.evento = data.result;


                    this.fetchUsers();
                }
            });
    }

    fetchUsers() {

        const eventoId = this.evento.id;
        this._httpClient.get(`${environment.API_URL}permissionario/getatendentesporeventoporpermissionario/${eventoId}/`, {
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

                    console.log(data.result);

                    const dataSource = new MatTableDataSource(this.users());
                    if (dataSource) {



                        dataSource.sortingDataAccessor = (item: any, property) => {


                            console.log(property);
                            switch (property) {
                                case 'Nome':
                                    return item.nome;
                                case 'Email':
                                    return item.email;
                                case 'Ativo':
                                    return item.ativo;
                                case 'CPF':
                                    return item.cpf;
                                case 'DataAlteracao':
                                    return item.dataAlteracao;
                                default:
                                    return item.nome;
                            }
                        };

                        dataSource.paginator = this.paginator;
                        dataSource.sort = this.sort;
                        this.usersDataSource.set(dataSource);
                    }
                }
            });
    }

    handleCheckbox(e: MatCheckboxChange) {
        e.source.toggle()
    }

    hasClaim(user: any, perfil: number): boolean {
        return user.claims?.some(claim => claim.perfilUsuario === perfil);
    }
}
