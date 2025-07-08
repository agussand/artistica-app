import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastMessage } from '../models/toast.model';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  toast: ToastMessage | null = null;
  private subscription: Subscription | undefined;

  private notificationService = inject(NotificationService);

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.notificationService.toastState$.subscribe(
      (toast) => {
        this.toast = toast;
        if (toast) {
          setTimeout(() => this.close(), 5000); // El toast desaparece automáticamente después de 5 segundos
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.notificationService.clear();
  }

  get backgroundColorClass(): string {
    if (!this.toast) return '';
    return this.toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';
  }
}
