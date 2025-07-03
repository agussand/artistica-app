import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ArticulosTableComponent } from '../articulos-table/articulos-table.component';
import { ArticuloDTO } from '../../../core/models/articulo.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ArticuloService } from '../../../core/services/articulos/articulo.service';
import { Router } from '@angular/router';
import { UserDetails } from '../../../core/models/auth.model';
import {
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { Page } from '../../../shared/models/page.model';
import { ShortcutEvent } from '../../../core/services/keyboard-navigation/shortcut.model';

@Component({
  selector: 'app-articulos-container',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ArticulosTableComponent,
  ],
  templateUrl: './articulos-container.component.html',
  styleUrl: './articulos-container.component.css',
})
export class ArticulosContainerComponent implements OnInit, OnDestroy {
  public tableColumns: TableColumn[] = [
    { field: 'id', header: 'ID' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'precioVenta', header: 'Precio Venta', pipe: 'currency' },
  ];

  public keyboardNav = inject(KeyboardNavigationService);
  private authService = inject(AuthService);
  private articuloService = inject(ArticuloService);
  private router = inject(Router);

  public currentUser: UserDetails | null = null;
  public selectedArticle: ArticuloDTO | null = null;

  public searchControl = new FormControl('');
  private pageSubject = new Subject<number>();
  private searchTrigger = new Subject<void>(); // Nuevo Subject para disparar la búsqueda

  public articulosPage$!: Observable<Page<ArticuloDTO>>;
  public currentPageNumber = 0;

  // Subject para la dar la señal de destruccion del componente
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserDetails();
    const initialSearch$ = this.searchTrigger.pipe(startWith(null)); // Dispara una búsqueda inicial

    this.articulosPage$ = initialSearch$.pipe(
      // Cada vez que se busca, se reinicia el indice de navegación
      tap(() => (this.keyboardNav.activeIndex = -1)),
      // Cada vez que se dispara una búsqueda, reseteamos a la página 0
      tap(() => this.pageSubject.next(0)),
      // Luego, nos suscribimos a los cambios de página
      switchMap(() => this.pageSubject.pipe(startWith(0))),
      // Finalmente, hacemos la petición a la API con los valores actuales
      switchMap((page) => {
        this.currentPageNumber = page;
        const searchTerm = this.searchControl.value || '';
        return this.articuloService.getArticulos(searchTerm, page, 10);
      })
    );

    this.keyboardNav.onShortcut$
      // El operador takeUntil le dice a la suscripción: "sigue funcionando HASTA QUE destroy$ emita un valor".
      .pipe(takeUntil(this.destroy$))
      .subscribe((shortcut) => this.handleShortcut(shortcut));
  }

  ngOnDestroy(): void {
    // Esto dispara todos los takeUntil() y limpia las suscripciones automáticamente.
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleShortcut(shortcut: ShortcutEvent): void {
    switch (shortcut.key) {
      // Atajo: F2 para enfocar el campo de búsqueda.
      case 'f2':
        this.searchInput.nativeElement.focus();
        this.searchInput.nativeElement.select(); // Selecciona todo el texto para fácil reemplazo.
        break;
    }
  }

  /**
   * Dispara una nueva búsqueda y previene el comportamiento por defecto del navegador.
   * @param event El evento del DOM (opcional, para prevenir recarga).
   */
  triggerSearch(event?: Event): void {
    // Si el evento existe, prevenimos la recarga de la página.
    if (event) {
      event.preventDefault();
    }
    if (this.searchControl.value == '') {
      return;
    }
    this.searchTrigger.next();
    this.searchInput.nativeElement.blur();
  }

  selectArticle(articulo: ArticuloDTO): void {
    this.selectedArticle = articulo;
    console.log('Artículo seleccionado:', articulo);
    // En un futuro, aquí podrías abrir un modal de edición:
    // this.openEditModal(articulo);
  }

  nextPage(): void {
    this.pageSubject.next(this.currentPageNumber + 1);
  }

  previousPage(): void {
    if (this.currentPageNumber > 0) {
      this.pageSubject.next(this.currentPageNumber - 1);
    }
  }

  handleArticleSelection(articulo: ArticuloDTO): void {
    console.log('Artículo seleccionado en el contenedor:', articulo);
    // Aquí iría la lógica de negocio, como abrir un modal.
  }

  handlePageChange(direction: 'next' | 'previous'): void {
    if (direction === 'next') {
      this.pageSubject.next(this.currentPageNumber + 1);
    } else if (this.currentPageNumber > 0) {
      this.pageSubject.next(this.currentPageNumber - 1);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
