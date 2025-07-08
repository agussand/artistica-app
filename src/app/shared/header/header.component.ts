import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserDetails } from '../../core/models/auth.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  // Con @Output, el componente puede notificar al padre sobre eventos.
  @Output() logoutClicked = new EventEmitter<void>();

  onLogout(): void {
    // Cuando se hace clic en el botón, emitimos el evento.
    this.logoutClicked.emit();
  }
}
