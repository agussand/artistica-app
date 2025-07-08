import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage } from '../../../shared/models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  public toastState$: Observable<ToastMessage | null> =
    this.toastSubject.asObservable();

  showSuccess(message: string) {
    this.toastSubject.next({ message, type: 'success' });
  }

  showError(message: string) {
    this.toastSubject.next({ message, type: 'error' });
  }

  clear() {
    this.toastSubject.next(null);
  }
}
