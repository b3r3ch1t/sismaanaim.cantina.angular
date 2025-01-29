import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from "@angular/material/select"
import { HttpClient } from "@angular/common/http"
import { AuthService } from 'app/core/auth/auth.service';
import { catchError } from 'rxjs';
import { ApiResponse } from 'app/core/api/api-response.types';

@Component({
  selector: 'app-replenishment',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './replenishment.component.html',
  styleUrl: './replenishment.component.scss'
})

export class ReplenishmentComponent implements OnInit {
  private _httpClient = inject(HttpClient)
  private _authService = inject(AuthService)

  clients = signal([]);

  ngOnInit(): void {
    this._httpClient.get("https://apicantina.berechit.com.br/v1/sismaanaim/clientes/getclientesbynome/davi", {
      headers: {
        "Authorization": `Bearer ${this._authService.accessToken}`
      }
    })
      .pipe(catchError((error) => {
        console.log(error);
        throw error;
      }))
      .subscribe((data: ApiResponse<{ id: string, nome: string }>) => {
        if (data.result) {
          const clients = data.result
          this.clients.set(clients)
        }
      });
  }

  

}
