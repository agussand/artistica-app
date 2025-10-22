import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from '../../../shared/header/header.component';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';

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
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { ArticleSearchFeatureComponent } from '../../../components/articulos/article-search-feature/article-search-feature.component';

@Component({
  selector: 'app-articulos-admin-container',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HeaderComponent,
    ArticuloFormComponent,
    ShortcutsFooterComponent,
    ArticleSearchFeatureComponent,
  ],
  templateUrl: './articulos-admin-container.component.html',
  styleUrl: './articulos-admin-container.component.css',
})
export class ArticulosAdminContainerComponent implements OnInit, OnDestroy {
  // Configuración para los componentes hijos
  public adminTableColumns: TableColumn[] = [
    { field: 'id', header: 'ID' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'precioLista', header: 'P. Lista', pipe: 'currency' },
    { field: 'precioVenta', header: 'P. Venta', pipe: 'currency' },
    { field: 'tasiva', header: 'IVA %' },
    { field: 'status', header: 'Estado' },
    { field: 'actions', header: 'Acciones' },
  ];

  public adminViewShortcuts: Shortcut[] = [
    { key: 'F2', description: 'Buscar' },
    { key: 'Alt + N', description: 'Nuevo' },
    { key: 'F4', description: 'Editar' },
    { key: 'Supr', description: 'Eliminar' },
  ];

  @ViewChild(ArticleSearchFeatureComponent)
  private searchFeature!: ArticleSearchFeatureComponent;

  // Estado de la página
  public currentUser: UserDetails | null = null;
  public isModalOpen = false;
  public editingArticle: Articulo | null = null;
  public isSaving = false;
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private authService = inject(AuthService);
  private router = inject(Router);
  private articuloService = inject(ArticuloService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private keyboardNav = inject(KeyboardNavigationService);

  ngOnInit(): void {
    this.currentUser = this.authService.getUserDetails();

    this.keyboardNav.onShortcut$
      .pipe(takeUntil(this.destroy$))
      .subscribe((shortcut) => {
        if (shortcut.altKey && shortcut.key === 'n') {
          this.handleNewArticle();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // --- MÉTODOS QUE SE QUEDAN (LÓGICA DE NEGOCIO) ---

  handleNewArticle(): void {
    this.editingArticle = null;
    this.isModalOpen = true;
  }

  handleEdit(articulo: Articulo): void {
    this.editingArticle = articulo;
    this.isModalOpen = true;
  }

  handleDelete(articulo: Articulo): void {
    const message = `¿Está seguro de que desea eliminar el artículo "${articulo.descripcion}"?`;

    this.confirmationService.confirm(message, () => {
      this.articuloService.deleteArticulo(articulo.id).subscribe({
        next: (articulo) => {
          this.notificationService.showSuccess(
            `Artículo ${articulo.descripcion} fué eliminado correctamente`
          );
          this.searchFeature.refreshData();
          // En un futuro, aquí podríamos llamar a un método para refrescar el componente de búsqueda.
        },
        error: (err) => {
          this.notificationService.showError('Error al eliminar el artículo.');
        },
      });
    });
  }

  handleCloseModal(): void {
    this.isModalOpen = false;
    this.editingArticle = null;
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
          ? 'Artículo actualizado.'
          : 'Artículo creado.';
        this.notificationService.showSuccess(message);
        this.handleCloseModal();
        this.searchFeature.refreshData();
        // Aquí podríamos llamar a un método para refrescar el componente de búsqueda.
      },
      error: (err) => {
        this.notificationService.showError(
          'Ocurrió un error al guardar el artículo.'
        );
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
