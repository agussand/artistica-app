import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Page } from '../../../shared/models/page.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { KeyboardNavigableDirective } from '../../../shared/directives/keyboard-navigable.directive';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';

@Component({
  selector: 'app-articulos-table',
  standalone: true,
  imports: [CommonModule, KeyboardNavigableDirective, CurrencyPipe],
  templateUrl: './articulos-table.component.html',
  styleUrl: './articulos-table.component.css',
})
export class ArticulosTableComponent {
  // --- INPUTS (Datos que recibe del padre) ---
  @Input() page: Page<any> | null = null; // Ahora puede recibir cualquier tipo de objeto
  @Input() columns: TableColumn[] = []; // Recibe la configuración de las columnas a mostrar
  @Input() activeIndex: number = -1;

  // --- OUTPUTS (Eventos que emite hacia el padre) ---
  @Output() articleSelected = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<'next' | 'previous'>();
  @Output() editClicked = new EventEmitter<any>();
  @Output() deleteClicked = new EventEmitter<any>();

  onArticleSelected(item: any): void {
    this.articleSelected.emit(item);
  }

  onPageChange(direction: 'next' | 'previous'): void {
    this.pageChange.emit(direction);
  }
}
