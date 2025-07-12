import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserDetails } from '../../core/models/auth.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from '../../core/services/confirmation/confirmation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // Con @Input, el componente padre puede pasarle datos.
  @Input() title: string = 'Mi Aplicación';
  @Input() user: UserDetails | null = null;
  // Nuevo Input: por defecto, el botón de volver no se muestra.
  @Input() showBackButton: boolean = false;

  private confirmationService = inject(ConfirmationService);

  // Con @Output, el componente puede notificar al padre sobre eventos.
  @Output() logoutClicked = new EventEmitter<void>();

  onLogout(): void {
    this.confirmationService.confirm(
      '¿Está seguro de que desea cerrar sesión?',
      () => {
        this.logoutClicked.emit();
      }
    );
    // Cuando se hace clic en el botón, emitimos el evento.
  }
}
