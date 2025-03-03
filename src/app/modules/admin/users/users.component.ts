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
import { AddUserFormComponent } from './add-user-form/add-user-form.component';
import { SnackbarService } from 'app/services/snackbar.service';
import { ConfirmationService } from 'app/services/confirmation.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { UserProfile } from 'app/core/user/user-profile.enum';
import { UserDetailComponent } from './user-detail/user-detail.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [MatTableModule, MatPaginator, MatSortModule, MatButtonModule, MatIconModule, MatCheckboxModule]
})

export class UsersComponent implements OnInit {
  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  users = signal([])
  usersDataSource = signal(new MatTableDataSource([]))
  userProfiles = UserProfile

  displayedColumns = [
    "Nome",
    "Email",
    "Ativo",
    "CPF",
    "Revisor",
    "Atendente",
    "Permissionário",
    "Auditoria",
    "Caixa",
    "Ações"
  ]

  constructor(
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.fetchUsers()
  }


  addUser() {
    const dialogRef = this.dialog.open(AddUserFormComponent, {
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


  detailUser(user){
    this.dialog.open(UserDetailComponent, {
      data : user,
      width : "700px"
    })
  }

  removeUser(user) {
    this.confirmationService.confirm("Confirmar", "Tem certeza de que deseja remover este usuário?").subscribe(result => {
      if (result) {
        this._httpClient.request('DELETE', `${environment.API_URL}account/deleteuser`, {
          headers: {
            "Authorization": `Bearer ${this._authService.accessToken}`,
            "Content-Type": "application/json" // Ensure JSON is sent properly
          },
          body: user.id
        }).subscribe({
          next: (response: ApiResponse<any>) => {
            console.log(response)
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
          const dataSource = new MatTableDataSource(this.users())
          if (dataSource) {



            dataSource.sortingDataAccessor = (item: any, property) => {
              switch (property) {
                case 'Nome':
                  return item.nome;
                case 'Email':
                  return item.email;
                case 'Ativo':
                  return item.ativo;
                case 'CPF':
                  return item.cpf;
                default:
                  return item[property];
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
