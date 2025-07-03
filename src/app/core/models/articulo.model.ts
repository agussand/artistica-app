export interface ArticuloDTO {
  id: number;
  descripcion: string;
  subCategoria: string; // Se actualizó el casing para coincidir con el DTO
  codigoBarra: string;
  precioLista: number;
  precioVenta: number;
}

export interface Articulo {
  id: number;
  descripcion: string;
  subCategoria: string;
  codigoBarra: string;
  precioLista: number;
  precioVenta: number;

  // Campos opcionales para la vista de administrador.
  // El '?' significa que estas propiedades pueden no existir en el objeto.
  fechaAlta?: string;
  ultModificacion?: string;
  fechaEliminado?: string | null;
}
