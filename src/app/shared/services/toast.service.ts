import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root', // Hace que el servicio esté disponible globalmente en toda la aplicación
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  showSuccess(summary: string, detail: string, life: number = 1500) {
    this.messageService.add({ severity: 'success', summary, detail, life });
  }

  showError(summary: string, detail: string, life: number = 1500) {
    this.messageService.add({ severity: 'error', summary, detail, life });
  }

  showWarn(summary: string, detail: string, life: number = 1500) {
    this.messageService.add({ severity: 'warn', summary, detail, life });
  }

  showInfo(summary: string, detail: string, life: number = 1500) {
    this.messageService.add({ severity: 'info', summary, detail, life });
  }
}
