import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmationState } from '../../../shared/models/confirmation.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationState | null>();
  public confirmationState$ = this.confirmationSubject.asObservable();

  /**
   * Muestra un modal de confirmación.
   * @param message El mensaje a mostrar (ej: '¿Está seguro de que desea eliminar?').
   * @param confirmAction La función que se ejecutará si el usuario hace clic en "Confirmar".
   * @param cancelAction La función opcional que se ejecutará si el usuario cancela.
   */
  confirm(
    message: string,
    confirmAction: () => void,
    cancelAction?: () => void
  ) {
    this.confirmationSubject.next({ message, confirmAction, cancelAction });
  }

  close() {
    this.confirmationSubject.next(null);
  }
}
