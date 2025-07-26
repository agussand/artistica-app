
import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { TableColumn } from '../../../shared/models/table-column.model';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ArticuloService } from '../../../core/services/articulos/articulo.service';
import { Router } from '@angular/router';
import { UserDetails } from '../../../core/models/auth.model';
import { Shortcut } from '../../../shared/models/shortcut.model';
import { ShortcutsFooterComponent } from '../../../shared/shortcuts-footer/shortcuts-footer.component';
import { Articulo } from '../../../core/models/articulo.model';
import { ArticleSearchFeatureComponent } from '../article-search-feature/article-search-feature.component';

@Component({
  selector: 'app-articulos-container',
  standalone: true,
  imports: [
    HeaderComponent,
    ShortcutsFooterComponent,
    ArticleSearchFeatureComponent
],
  templateUrl: './articulos-container.component.html',
  styleUrl: './articulos-container.component.css',
})
export class ArticulosContainerComponent implements OnInit {
  public tableColumns: TableColumn[] = [
    { field: 'id', header: 'ID' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'precioVenta', header: 'Precio Venta', pipe: 'currency' },
  ];
  public viewShortcuts: Shortcut[] = [
    { key: '↑↓', description: 'Navegar' },
    { key: 'F2', description: 'Buscar' },
    { key: 'Esc', description: 'Volver al inicio' },
  ];

  public keyboardNav = inject(KeyboardNavigationService);
  private authService = inject(AuthService);
  private articuloService = inject(ArticuloService);
  private router = inject(Router);

  public currentUser: UserDetails | null = null;
  public selectedArticle: Articulo | null = null;

  constructor() {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserDetails();
  }

  selectArticle(articulo: Articulo): void {
    this.selectedArticle = articulo;
    console.log('Artículo seleccionado:', articulo);
    // En un futuro, aquí podrías abrir un modal de edición:
    // this.openEditModal(articulo);
  }

  handleArticleSelection(articulo: Articulo): void {
    console.log('Artículo seleccionado en el contenedor:', articulo);
    // Aquí iría la lógica de negocio, como abrir un modal.
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
