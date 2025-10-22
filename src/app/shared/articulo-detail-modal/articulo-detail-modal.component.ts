import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { Articulo } from '../../core/models/articulo.model';

@Component({
  selector: 'app-articulo-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articulo-detail-modal.component.html',
  styleUrl: './articulo-detail-modal.component.css',
})
export class ArticuloDetailModalComponent {
  @Input() article: Articulo | null = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  // Escucha la tecla 'Escape' en toda la ventana para cerrar el modal
  @HostListener('window:keydown.escape', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
