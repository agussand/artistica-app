import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ShortcutsFooterComponent } from '../../../shared/shortcuts-footer/shortcuts-footer.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserDetails } from '../../../core/models/auth.model';
import { BudgetItem } from '../../../shared/models/budget.model';
import { Shortcut } from '../../../shared/models/shortcut.model';
import { Articulo } from '../../../core/models/articulo.model';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';
import { Subject, takeUntil } from 'rxjs';
import { SearchArticleModalComponent } from '../search-article-modal/search-article-modal.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';

@Component({
  selector: 'app-presupuesto-container',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ShortcutsFooterComponent,
    CurrencyPipe,
    SearchArticleModalComponent,
  ],
  templateUrl: './presupuesto-container.component.html',
  styleUrl: './presupuesto-container.component.css',
})
export class PresupuestoContainerComponent implements OnInit, OnDestroy {
  // Estado del presupuesto
  public budgetItems: BudgetItem[] = []; // La lista de artículos en el presupuesto
  public total: number = 0;

  public viewShortcuts: Shortcut[] = [
    { key: 'F2', description: 'Añadir Artículo' },
    { key: 'F9', description: 'Finalizar Presupuesto' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private keyboardNav = inject(KeyboardNavigationService);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();

  public currentUser: UserDetails | null = null;
  public isSearchModalOpen = false; // Estado para controlar el modal

  ngOnInit(): void {
    this.currentUser = this.authService.getUserDetails();
    this.keyboardNav.resume();

    this.keyboardNav.onShortcut$
      .pipe(takeUntil(this.destroy$))
      .subscribe((shortcut) => {
        if (this.isSearchModalOpen) {
          return;
        }
        if (shortcut.key === 'f2') this.openAddArticleModal();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Lógica del Presupuesto ---

  addArticle(data: { articulo: Articulo; cantidad: number }) {
    this.closeAddArticleModal();
    const { articulo, cantidad } = data;
    const existingItem = this.budgetItems.find(
      (item) => item.articulo.id === articulo.id
    );

    if (existingItem) {
      // Si ya existe, sumamos la nueva cantidad a la existente.
      existingItem.cantidad += cantidad;
      existingItem.subtotal =
        existingItem.cantidad * existingItem.precioUnitario;
    } else {
      // Si es nuevo, lo añadimos a la lista.
      this.budgetItems.push({
        articulo: articulo,
        cantidad: cantidad,
        precioUnitario: articulo.precioVenta,
        subtotal: cantidad * articulo.precioVenta,
      });
    }
    this.calculateTotal();
  }

  removeItem(itemToRemove: BudgetItem) {
    const message = `¿Está seguro de que desea quitar "${itemToRemove.articulo.descripcion}" del presupuesto?`;

    // 3. Usamos el servicio para pedir confirmación.
    this.confirmationService.confirm(message, () => {
      // Esta función solo se ejecuta si el usuario hace clic en "Confirmar".
      this.budgetItems = this.budgetItems.filter(
        (item) => item !== itemToRemove
      );
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.total = this.budgetItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // --- Control del Modal ---

  openAddArticleModal() {
    this.isSearchModalOpen = true;
    this.keyboardNav.pause(); // Pausamos la navegación de la página principal
  }

  closeAddArticleModal() {
    this.isSearchModalOpen = false;
    this.keyboardNav.resume(); // Reanudamos la navegación
  }
}
