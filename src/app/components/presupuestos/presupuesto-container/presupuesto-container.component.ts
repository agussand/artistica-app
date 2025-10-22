import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ShortcutsFooterComponent } from '../../../shared/shortcuts-footer/shortcuts-footer.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserDetails } from '../../../core/models/auth.model';
import { Shortcut } from '../../../shared/models/shortcut.model';
import { Articulo } from '../../../core/models/articulo.model';
import { KeyboardNavigationService } from '../../../core/services/keyboard-navigation/keyboard-navigation.service';
import { Subject, takeUntil } from 'rxjs';
import { SearchArticleModalComponent } from '../search-article-modal/search-article-modal.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';
import { PresupuestoCalculatorService } from '../../../core/services/presupuesto/presupuesto-calculator.service';
import { PresupuestoItem } from '../../../shared/models/presupuesto.model';
import { PdfService } from '../../../core/services/pdf-generator/pdf.service';
import { ArticuloService } from '../../../core/services/articulos/articulo.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-presupuesto-container',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ShortcutsFooterComponent,
    CurrencyPipe,
    SearchArticleModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './presupuesto-container.component.html',
  styleUrl: './presupuesto-container.component.css',
})
export class PresupuestoContainerComponent implements OnInit, OnDestroy {
  // Estado del presupuesto
  public presupuestoItems: PresupuestoItem[] = []; // La lista de artículos en el presupuesto
  public total: number = 0;

  public viewShortcuts: Shortcut[] = [
    { key: 'F2', description: 'Añadir Artículo' },
    { key: 'F9', description: 'Finalizar Presupuesto' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private keyboardNav = inject(KeyboardNavigationService);
  private confirmationService = inject(ConfirmationService);
  private calculator = inject(PresupuestoCalculatorService);
  private pdfGenerator = inject(PdfService);
  private articuloService = inject(ArticuloService);
  private destroy$ = new Subject<void>();
  private notificationService = inject(NotificationService);

  public currentUser: UserDetails | null = null;
  public isSearchOrQuantityModalOpen = false; // Estado para controlar el modal
  public preselectedArticleForModal: Articulo | null = null;

  public quantityControl = new FormControl(1, [
    Validators.required,
    Validators.min(1),
    Validators.max(100),
  ]);

  ngOnInit(): void {
    this.currentUser = this.authService.getUserDetails();
    this.keyboardNav.resume();

    this.keyboardNav.onShortcut$
      .pipe(takeUntil(this.destroy$))
      .subscribe((shortcut) => {
        if (this.isSearchOrQuantityModalOpen) {
          return;
        }
        if (shortcut.key === 'f2') this.openAddArticleModal();
      });

    // Suscripción a los escaneos de códigos de barra
    this.keyboardNav.onBarcodeScan$
      .pipe(takeUntil(this.destroy$))
      .subscribe((barcode) => {
        // **LA GUARDA CLAVE:** Solo procesamos el escaneo si ningún modal está abierto.
        if (!this.isSearchOrQuantityModalOpen) {
          this.handleBarcodeScan(barcode);
        }
      });
  }

  private handleBarcodeScan(barcode: string): void {
    console.log('PresupuestoContainer: Código de barras recibido:', barcode);
    this.articuloService.getArticulos(barcode).subscribe((articulos) => {
      if (articulos.content.length === 1) {
        console.log(
          'PresupuestoContainer: Artículo encontrado por código de barras:',
          articulos
        );
        // Artículo encontrado, preparamos para pedir la cantidad
        this.preselectedArticleForModal = articulos.content[0];
        this.openAddArticleModal();
        this.keyboardNav.pause(); // Pausamos navegación/atajos de fondo
      } else {
        console.log(
          'PresupuestoContainer: Artículo no encontrado por código de barras.'
        );
        // Artículo no encontrado, mostramos notificación
        this.notificationService.showError(
          `Artículo con código de barras "${barcode}" no encontrado.`
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Lógica del Presupuesto ---

  addArticle(data: { articulo: Articulo; cantidad: number }) {
    if (this.isSearchOrQuantityModalOpen) {
      this.closeAddArticleModal();
    }

    const { articulo, cantidad } = data;
    const existingItem = this.presupuestoItems.find(
      (item) => item.articulo.id === articulo.id
    );

    if (existingItem) {
      // Si ya existe, sumamos la nueva cantidad a la existente.
      existingItem.cantidad += cantidad;
      existingItem.subtotal =
        existingItem.cantidad * existingItem.precioUnitario;
    } else {
      // Si es nuevo, lo añadimos a la lista.
      this.presupuestoItems.push({
        articulo: articulo,
        cantidad: cantidad,
        precioUnitario: articulo.precioVenta,
        subtotal: cantidad * articulo.precioVenta,
      });
    }
    const { itemsActualizados, total } = this.calculator.recalcularPresupuesto(
      this.presupuestoItems
    );
    this.presupuestoItems = itemsActualizados;
    this.total = total;
  }

  removeItem(itemToRemove: PresupuestoItem) {
    const message = `¿Está seguro de que desea quitar "${itemToRemove.articulo.descripcion}" del presupuesto?`;

    // 3. Usamos el servicio para pedir confirmación.
    this.confirmationService.confirm(message, () => {
      // Esta función solo se ejecuta si el usuario hace clic en "Confirmar".
      this.presupuestoItems = this.presupuestoItems.filter(
        (item) => item !== itemToRemove
      );
      this.total = this.calculator.calcularTotal(this.presupuestoItems);
    });
  }
  // --- Control del Modal ---

  openAddArticleModal() {
    this.isSearchOrQuantityModalOpen = true;
    this.keyboardNav.pause(); // Pausamos la navegación de la página principal
  }

  closeAddArticleModal() {
    this.isSearchOrQuantityModalOpen = false;
    this.keyboardNav.resume(); // Reanudamos la navegación
  }

  generatePdf() {
    const { itemsActualizados, total } = this.calculator.recalcularPresupuesto(
      this.presupuestoItems
    );
    this.presupuestoItems = itemsActualizados;
    this.total = total;

    this.pdfGenerator.generarPresupuestoPDF2(this.presupuestoItems, this.total);
  }
}
