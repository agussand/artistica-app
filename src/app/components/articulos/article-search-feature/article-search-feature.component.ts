import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ArticulosTableComponent } from '../articulos-table/articulos-table.component';
import { TableColumn } from '../../../shared/models/table-column.model';
import { Shortcut, ShortcutEvent } from '../../../shared/models/shortcut.model';
import { Articulo } from '../../../core/models/articulo.model';
import {
  merge,
  Observable,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Page } from '../../../shared/models/page.model';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';
import { ArticuloService } from '../../../core/services/articulos/articulo.service';

@Component({
  selector: 'app-article-search-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ArticulosTableComponent],
  templateUrl: './article-search-feature.component.html',
  styleUrl: './article-search-feature.component.css',
})
export class ArticleSearchFeatureComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // --- INPUTS (Configuración que recibe del padre) ---
  @Input() searchFunction: 'user' | 'admin' = 'user';
  @Input({ required: true }) tableColumns: TableColumn[] = [];
  @Input({ required: true }) shortcuts: Shortcut[] = [];
  @Input() showPagination: boolean = true;

  // --- OUTPUTS (Eventos que emite al padre) ---
  @Output() articleSelected = new EventEmitter<Articulo>();
  @Output() editClicked = new EventEmitter<Articulo>();
  @Output() deleteClicked = new EventEmitter<Articulo>();

  // --- Lógica Interna ---
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();
  public searchControl = new FormControl('');
  private pageSubject = new Subject<number>();
  private searchTrigger = new Subject<void>();
  private refreshList$ = new Subject<void>();
  public articulosPage$!: Observable<Page<Articulo>>;
  public currentPageNumber = 0;

  public keyboardNav = inject(KeyboardNavigationService);
  private articuloService = inject(ArticuloService);

  ngOnInit(): void {
    this.keyboardNav.resume();

    // La carga de datos ahora se dispara por el searchTrigger (manual) o el refreshList$.
    const dataTrigger$ = merge(this.searchTrigger, this.refreshList$).pipe(
      startWith(null)
    );

    this.articulosPage$ = dataTrigger$.pipe(
      tap(() => (this.keyboardNav.activeIndex = -1)),
      tap(() => this.pageSubject.next(0)),
      switchMap(() => this.pageSubject.pipe(startWith(0))),
      switchMap((page) => {
        this.currentPageNumber = page;
        const searchTerm = this.searchControl.value || '';
        return this.searchFunction === 'admin'
          ? this.articuloService.getAdminArticulos(searchTerm ?? '', page, 20)
          : this.articuloService.getArticulos(searchTerm ?? '', page, 20);
      }),
      takeUntil(this.destroy$)
    );

    this.keyboardNav.onShortcut$
      .pipe(takeUntil(this.destroy$))
      .subscribe((shortcut) => this.handleShortcut(shortcut));
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput.nativeElement.focus(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  triggerSearch(event?: Event): void {
    if (event) event.preventDefault();
    this.searchTrigger.next();
    this.searchInput.nativeElement.blur();
  }

  handlePageChange(direction: 'next' | 'previous'): void {
    if (direction === 'next') {
      this.pageSubject.next(this.currentPageNumber + 1);
    } else if (this.currentPageNumber > 0) {
      this.pageSubject.next(this.currentPageNumber - 1);
    }
  }

  public refreshData(): void {
    this.refreshList$.next();
  }

  private handleShortcut(shortcut: ShortcutEvent): void {
    const activeIndex = this.keyboardNav.activeIndex;
    if (shortcut.key === 'f2') {
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
    }
    // Si la acción es de edición o eliminación, la delegamos al padre.
    if (shortcut.key === 'f4' && activeIndex !== -1) {
      this.articulosPage$
        .pipe(take(1))
        .subscribe((page) => this.editClicked.emit(page.content[activeIndex]));
    }
    if (shortcut.key === 'delete' && activeIndex !== -1) {
      this.articulosPage$
        .pipe(take(1))
        .subscribe((page) =>
          this.deleteClicked.emit(page.content[activeIndex])
        );
    }
    // Lógica para otros atajos que podrían ser manejados aquí...
  }
}
