import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Articulo } from '../../core/models/articulo.model';

@Component({
  selector: 'app-articulo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './articulo-form.component.html',
  styleUrl: './articulo-form.component.css',
})
export class ArticuloFormComponent implements OnInit, OnChanges {
  // Recibe el artículo a editar. Si es nulo, estamos en modo "Crear".
  @Input() article: Articulo | null = null;

  // Emite el valor del formulario cuando se guarda.
  @Output() formSubmit = new EventEmitter<Articulo>();
  // Emite un evento para que el padre cierre el modal.
  @Output() closeModal = new EventEmitter<void>();

  articleForm: FormGroup;
  isEditMode = false;
  private fb = inject(FormBuilder);

  constructor() {
    this.articleForm = this.fb.group({
      id: [null],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      subCategoria: [''],
      codigoBarra: [''],
      precioLista: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
    });
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
    } else {
      // Si estamos creando, reseteamos el formulario a sus valores por defecto.
      this.articleForm.reset({
        id: null,
        descripcion: '',
        subCategoria: '',
        codigoBarra: '',
        precioLista: 0,
        precioVenta: 0,
      });
    }
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
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
