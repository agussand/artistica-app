import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Articulo } from '../../../core/models/articulo.model';
import { CurrencyMaskDirective } from '../../../shared/directives/currecy-mask/currency-mask.directive';

@Component({
  selector: 'app-articulo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyMaskDirective],
  templateUrl: './articulo-form.component.html',
  styleUrl: './articulo-form.component.css',
})
export class ArticuloFormComponent implements OnInit, OnChanges, AfterViewInit {
  // Recibe el artículo a editar. Si es nulo, estamos en modo "Crear".
  @Input() article: Articulo | null = null;

  // Input para el estado de carga
  @Input() isSaving: boolean = false;

  // Emite el valor del formulario cuando se guarda.
  @Output() formSubmit = new EventEmitter<Articulo>();
  // Emite un evento para que el padre cierre el modal.
  @Output() closeModal = new EventEmitter<void>();

  // Obtenemos una referencia al primer input para poder enfocarlo.
  @ViewChild('descripcionInput')
  descripcionInput!: ElementRef<HTMLInputElement>;
  // Obtenemos una referencia al input precioLista para enfocarlo cuando se edita un artículo
  @ViewChild('precioListaInput')
  precioListaInput!: ElementRef<HTMLInputElement>;

  // Este decorador escucha el evento 'keydown.escape' en toda la ventana.
  @HostListener('window:keydown.escape', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Cuando se presiona Escape, simplemente llama al mismo método que el botón "Cancelar".
    this.onCancel();
  }

  articleForm: FormGroup;
  isEditMode = false;
  private fb = inject(FormBuilder);

  constructor() {
    this.articleForm = this.fb.group({
      id: [null],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      codigoBarra: [''],
      precioLista: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      tasiva: [21, [Validators.required, Validators.min(0)]], // Valor por defecto 21%
    });
  }
  ngAfterViewInit(): void {
    // Hacemos un pequeño timeout para asegurar que el input sea visible antes de enfocarlo.
    setTimeout(() => {
      if (this.isEditMode) {
        this.precioListaInput.nativeElement.focus();
      } else {
        this.descripcionInput.nativeElement.focus();
      }
    }, 0);
  }

  ngOnInit(): void {
    this.updateForm();
  }

  // ngOnChanges se ejecuta cada vez que un @Input cambia.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['article']) {
      this.updateForm();
    }
  }

  private updateForm(): void {
    this.isEditMode = !!this.article;
    if (this.isEditMode) {
      // Si estamos editando, llenamos el formulario con los datos del artículo.
      this.articleForm.patchValue(this.article as Articulo);
      //TODO: agregar foco al control precioLista
    } else {
      // Si estamos creando, reseteamos el formulario a sus valores por defecto.
      this.articleForm.reset({
        id: null,
        descripcion: '',
        codigoBarra: '',
        precioLista: 0,
        precioVenta: 0,
        tasiva: 21,
      });
    }
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }
    // Emitimos el valor del formulario para que el padre lo procese.
    this.formSubmit.emit(this.articleForm.value);
  }

  onCancel(): void {
    // Le decimos al padre que queremos cerrar el modal.
    this.closeModal.emit();
  }
}
