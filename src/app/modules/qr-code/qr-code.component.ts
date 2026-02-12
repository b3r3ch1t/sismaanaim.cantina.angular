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

interface QRCodeResponse {
  result: {
    cobrancaId: string;
    dataExpiracao: string;
    estadoCobranca: number;
    qrCodeImage: string;
    brCode: string;
    valor: number;
    membro: string;
    evento: string;
    getStatusCobranca: string;
  };
  success: boolean;
  error: boolean;
  errors: any[];
  code: number;
  message: string;
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
  qrCodeData: QRCodeResponse['result'] | null = null;
  loading = false;
  error = false;
  pixId: string | null = null;

  constructor(
    private http: HttpClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

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
    this.http.get<QRCodeResponse>(`${environment.API_URL}clientes/getdetalhepix/${this.pixId}`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // this.qrCodeData = response.result;

          console.log('Resposta da API:', response);

          
        } else {
          this.error = true;
        }
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
    if (this.qrCodeData?.brCode) {
      this.clipboard.copy(this.qrCodeData.brCode);
      this.snackBar.open('Código copiado para a área de transferência!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['qr-code-snackbar']
      });

    }
  }

  getStatusColor(): string {
    if (!this.qrCodeData) return '';
    
    switch (this.qrCodeData.estadoCobranca) {
      case 1: return 'text-blue-600';
      case 2: return 'text-green-600';
      case 3: return 'text-red-600';
      default: return '';
    }
  }

  getStatusText(): string {
    if (!this.qrCodeData) return '';
    
    switch (this.qrCodeData.estadoCobranca) {
      case 1: return 'Ativa';
      case 2: return 'Paga';
      case 3: return 'Vencida';
      default: return '';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  }
}