import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Shortcut } from '../models/shortcut.model';

@Component({
  selector: 'app-shortcuts-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortcuts-footer.component.html',
  styleUrl: './shortcuts-footer.component.css',
})
export class ShortcutsFooterComponent {
  // Recibe un array con la configuración de los atajos a mostrar.
  @Input() shortcuts: Shortcut[] = [];
}
