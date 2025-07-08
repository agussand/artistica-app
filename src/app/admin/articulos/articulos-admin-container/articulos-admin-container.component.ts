import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ArticulosTableComponent } from '../../../components/articulos/articulos-table/articulos-table.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import {
  delay,
  finalize,
  merge,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Page } from '../../../shared/models/page.model';
import { Articulo } from '../../../core/models/articulo.model';
import { UserDetails } from '../../../core/models/auth.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { ArticuloService } from '../../../core/services/articulos/articulo.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';
import { Shortcut, ShortcutEvent } from '../../../shared/models/shortcut.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { ShortcutsFooterComponent } from '../../../shared/shortcuts-footer/shortcuts-footer.component';
import { ArticuloFormComponent } from '../articulo-form/articulo-form.component';

@Component({
  selector: 'app-articulos-admin-container',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ArticulosTableComponent,
    HeaderComponent,
    ArticuloFormComponent,
    ShortcutsFooterComponent,
  ],
  templateUrl: './articulos-admin-container.component.html',
  styleUrl: './articulos-admin-container.component.css',
})
export class ArticulosAdminContainerComponent implements OnInit, OnDestroy {
  public adminViewShortcuts: Shortcut[] = [
    { key: '↑↓', description: 'Navegar' },
    { key: 'F2', description: 'Buscar' },
    { key: 'F4', description: 'Editar' },
    { key: 'Supr', description: 'Eliminar' },
    { key: 'Alt+N', description: 'Nuevo' },
    { key: 'Esc', description: 'Volver al inicio' },
  ];

  private articuloService = inject(ArticuloService);
  private authService = inject(AuthService);
  private router = inject(Router);
  public keyboardNav = inject(KeyboardNavigationService);

  public isSaving = false; // Nueva propiedad para el estado de carga
  private notificationService = inject(NotificationService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();

  // La lógica de búsqueda y paginación es idéntica a la del otro contenedor.
  public searchControl = new FormControl('');
  private pageSubject = new Subject<number>();
  public articulosPage$!: Observable<Page<Articulo>>;
  public currentPageNumber = 0;

  // Nuevas propiedades para manejar el estado del modal
  public isModalOpen = false;
  public editingArticle: Articulo | null = null;
  public currentUser: UserDetails | null = null;
  // Renombramos el trigger para mayor claridad
  private userSearchTrigger = new Subject<void>();
  // Creamos un nuevo trigger para refrescar los datos sin perder la selección
  private refreshDataTrigger = new Subject<void>();

  // ¡AQUÍ ESTÁ LA CLAVE! Definimos una nueva configuración de columnas para el admin.
  public adminTableColumns: TableColumn[] = [
    { field: 'id', header: 'ID' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'precioLista', header: 'P. Lista', pipe: 'currency' },
    { field: 'precioVenta', header: 'P. Venta', pipe: 'currency' },
    { field: 'status', header: 'Estado' },
    // Añadimos una columna especial para los botones de acción.
    { field: 'actions', header: 'Acciones' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserDetails();

    this.keyboardNav.activeIndex = -1;
    this.keyboardNav.resume();

    const search$ = this.userSearchTrigger.pipe(
      tap(() => (this.keyboardNav.activeIndex = -1))
    );

    const refresh$ = this.refreshDataTrigger.pipe();

    const dataTrigger$ = merge(search$, refresh$).pipe(startWith(null));

    this.articulosPage$ = dataTrigger$.pipe(
      tap(() => this.pageSubject.next(0)),
      switchMap(() => this.pageSubject.pipe(startWith(0))),
      switchMap((page) => {
        this.currentPageNumber = page;
        const searchTerm = this.searchControl.value || '';
        // Podríamos llamar a un método diferente si el admin necesitara ver más datos.
        return this.articuloService.getAdminArticulos(searchTerm, page, 10);
      })
    );

    this.keyboardNav.onShortcut$
      .pipe(takeUntil(this.destroy$))
      .subscribe((shortcut) => this.handleShortcut(shortcut));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Métodos que manejan la lógica y los eventos de la tabla ---

  triggerSearch(event?: Event): void {
    if (event) event.preventDefault();
    // Ahora llamamos al trigger específico del usuario.
    this.userSearchTrigger.next();
    this.searchInput.nativeElement.blur();
  }

  handlePageChange(direction: 'next' | 'previous'): void {
    if (direction === 'next') {
      this.pageSubject.next(this.currentPageNumber + 1);
    } else if (this.currentPageNumber > 0) {
      this.pageSubject.next(this.currentPageNumber - 1);
    }
  }

  // --- NUEVOS MÉTODOS PARA LAS ACCIONES DEL ADMIN ---

  handleNewArticle(): void {
    this.keyboardNav.pause();
    this.editingArticle = null; // Nos aseguramos de que no hay un artículo para editar
    this.isModalOpen = true; // Abrimos el modal
  }

  handleEdit(articulo: Articulo): void {
    this.keyboardNav.pause();
    this.editingArticle = articulo; // Pasamos el artículo seleccionado
    this.isModalOpen = true; // Abrimos el modal
  }

  handleDelete(articulo: Articulo): void {
    this.isModalOpen = false; // Cerramos el modal
    this.editingArticle = null; // Limpiamos el estado
  }

  handleCloseModal(): void {
    this.isModalOpen = false; // Cerramos el modal
    this.editingArticle = null; // Limpiamos el estado
    this.keyboardNav.resume(); // Reanudamos la navegación
  }

  handleFormSubmit(articulo: Articulo): void {
    this.isSaving = true;
    let saveOperation$: Observable<Articulo>;

    if (this.editingArticle && this.editingArticle.id) {
      saveOperation$ = this.articuloService.updateArticulo(
        this.editingArticle.id,
        articulo
      );
    } else {
      saveOperation$ = this.articuloService.createArticulo(articulo);
    }

    saveOperation$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        const message = this.editingArticle
          ? 'Artículo actualizado correctamente.'
          : 'Artículo creado con éxito.';
        this.notificationService.showSuccess(message);
        this.handleCloseModal();
        this.refreshDataTrigger.next(); // Refrescamos la tabla
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.notificationService.showError(
          'Ocurrió un error al guardar el artículo.'
        );
      },
    });
  }

  private handleShortcut(shortcut: ShortcutEvent): void {
    const activeIndex = this.keyboardNav.activeIndex;

    // Atajo F2: Siempre enfoca la búsqueda.
    if (shortcut.key === 'f2') {
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
    }

    // Atajo Shift + n: Crear un nuevo modal para un nuevo Articulo
    if (shortcut.altKey && shortcut.key === 'n') {
      this.handleNewArticle();
    }

    // Atajo F4: Ahora significa "Editar" en este contexto.
    if (shortcut.key === 'f4' && activeIndex !== -1) {
      // Necesitamos obtener la página actual de alguna manera.
      // Esta es una forma simple, pero en una app real se usaría un gestor de estado.
      this.articulosPage$.pipe(take(1)).subscribe((page) => {
        const activeArticle = page.content[activeIndex];
        this.handleEdit(activeArticle);
      });
    }

    // Atajo Delete: Para eliminar el artículo seleccionado.
    if (shortcut.key === 'delete' && activeIndex !== -1) {
      this.articulosPage$.pipe(take(1)).subscribe((page) => {
        const activeArticle = page.content[activeIndex];
        this.handleDelete(activeArticle);
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
