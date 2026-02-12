import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { environment } from 'app/environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

interface QRCodeResponse {
  recargaId: string;
  valor: number;
  clienteNome: string;
  clienteCpf: string;
  pixCodigoQrCode: string;
  qrCodeImage: string;
  dataExpiracao: string;
  eventoId: string;
  eventoNome: string;
}

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    ClipboardModule
  ]
})
export class QRCodeComponent implements OnInit {
  qrCodeData: QRCodeResponse | null = null;
  loading = false;
  error = false;
  pixId: string | null = null;
  isExpired = false;

  constructor(
    private http: HttpClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.pixId = this.route.snapshot.paramMap.get('id');
    this.fetchQRCode();
  }

  fetchQRCode(): void {
    if (!this.pixId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.loading = true;
    this.http.get<any>(
      `${environment.API_URL}clientes/getdetalhepix/${this.pixId}`,
      { headers: { "Authorization": `Bearer ${this._authService.accessToken}` } }
    ).subscribe({
      next: (response) => {
        console.log('Resposta da API:', response);
        this.qrCodeData = response.result;

        console.log('qrCodeData:', this.qrCodeData);

        this.checkIfExpired();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching QR code:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  copyBrCode(): void {
    if (this.qrCodeData?.pixCodigoQrCode) {
      this.clipboard.copy(this.qrCodeData.pixCodigoQrCode);
      this.snackBar.open('Código copiado para a área de transferência!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['qr-code-snackbar']
      });

    }
  }

  checkIfExpired(): void {
    if (!this.qrCodeData) return;
    const now = new Date();
    const expirationDate = new Date(this.qrCodeData.dataExpiracao);
    this.isExpired = now >= expirationDate;
  }

  getStatusColor(): string {
    return this.isExpired ? 'text-red-600' : 'text-blue-600';
  }

  getStatusText(): string {
    return this.isExpired ? 'Vencido' : 'Ativo';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}