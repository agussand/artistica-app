import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableColumn } from '../../../shared/models/table-column.model';
import { Shortcut } from '../../../shared/models/shortcut.model';
import { Articulo } from '../../../core/models/articulo.model';
import { ArticleSearchFeatureComponent } from '../../articulos/article-search-feature/article-search-feature.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-search-article-modal',
  standalone: true,
  imports: [ArticleSearchFeatureComponent, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './search-article-modal.component.html',
  styleUrl: './search-article-modal.component.css',
})
export class SearchArticleModalComponent implements OnInit {
  ngOnInit(): void {
    if (this.preselectedArticle) {
      this.selectedArticleForQuantity = this.preselectedArticle;
    }
  }
  // --- Configuración para el componente de búsqueda ---
  public modalTableColumns: TableColumn[] = [
    { field: 'id', header: 'ID' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'precioVenta', header: 'Precio', pipe: 'currency' },
  ];

  public modalShortcuts: Shortcut[] = [
    { key: '↑↓', description: 'Navegar' },
    { key: 'Enter', description: 'Seleccionar' },
    { key: 'F2', description: 'Buscar' },
    { key: 'Esc', description: 'Cerrar' },
  ];
  @Input() preselectedArticle: Articulo | null = null;
  // --- OUTPUTS ---
  // Emite el artículo seleccionado para que el padre lo añada al presupuesto.
  @Output() itemAdded = new EventEmitter<{
    articulo: Articulo;
    cantidad: number;
  }>();
  // Emite un evento para que el padre cierre el modal.
  @Output() closeModal = new EventEmitter<void>();

  // Esta función se ejecutará automáticamente cuando el #quantityInput aparezca en el DOM.
  @ViewChild('quantityInput') set quantityInput(
    element: ElementRef<HTMLInputElement>
  ) {
    if (element) {
      // Si el elemento existe, le hacemos foco inmediatamente.
      element.nativeElement.focus();
      element.nativeElement.select();
    }
  }

  // Esta propiedad controla qué vista se muestra: la de búsqueda o la de cantidad.
  public selectedArticleForQuantity: Articulo | null = null;
  public quantityControl = new FormControl(1, [
    Validators.required,
    Validators.min(1),
    Validators.max(100),
  ]);

  // Escuchamos la tecla Escape para cerrar el modal.
  @HostListener('window:keydown.escape', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.selectedArticleForQuantity) {
      // Si estamos en el paso de cantidad, Escape nos devuelve a la búsqueda.
      this.cancelQuantityStep();
    } else {
      // Si estamos en la búsqueda, Escape cierra el modal.
      this.closeModal.emit();
    }
  }
  /**
   * Se ejecuta cuando se selecciona un artículo en la tabla de búsqueda.
   * En lugar de emitir, ahora cambia el estado del modal al paso de cantidad.
   */
  onArticleSelected(articulo: Articulo) {
    this.selectedArticleForQuantity = articulo;
  }

  /**
   * Se ejecuta al confirmar la cantidad.
   * Emite el artículo y la cantidad al componente padre.
   */
  onConfirmQuantity() {
    if (this.quantityControl.invalid || !this.selectedArticleForQuantity) {
      return;
    }
    const cantidad = this.quantityControl.value || 1;
    this.itemAdded.emit({
      articulo: this.selectedArticleForQuantity,
      cantidad,
    });
  }

  /**
   * Vuelve de la vista de cantidad a la vista de búsqueda.
   */
  cancelQuantityStep() {
    this.selectedArticleForQuantity = null;
    this.quantityControl.setValue(1);
  }
}
