import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../../shared/models/page.model';
import { Articulo, ArticuloDTO } from '../../models/articulo.model';

@Injectable({
  providedIn: 'root',
})
export class ArticuloService {
  private apiUrl = `${environment.apiUrl}/articulos`;

  private http = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene la lista de articulos para la vista del usuario
   */
  getArticulos(
    searchTerm?: string,
    page = 0,
    size = 10,
    sort = 'id,asc'
  ): Observable<Page<ArticuloDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<Page<ArticuloDTO>>(this.apiUrl, { params });
  }

  /**
   * Obtiene la lista de artículos con todos los datos para la vista de administrador.
   */
  getAdminArticulos(
    searchTerm?: string,
    page = 0,
    size = 10,
    sort = 'id,asc'
  ): Observable<Page<Articulo>> {
    // Usamos la nueva interfaz ArticuloAdmin

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<Page<Articulo>>(`${this.apiUrl}/admin`, { params });
  }

  /**
   * Crea un nuevo artículo en el backend.
   * @param articulo Los datos del artículo a crear (sin el ID).
   */
  createArticulo(articulo: Partial<Articulo>): Observable<Articulo> {
    // Llama al endpoint POST /api/articulos
    return this.http.post<Articulo>(this.apiUrl, articulo);
  }

  /**
   * Actualiza un artículo existente en el backend.
   * @param id El ID del artículo a actualizar.
   * @param articulo Los nuevos datos del artículo.
   */
  updateArticulo(
    id: number,
    articulo: Partial<Articulo>
  ): Observable<Articulo> {
    // Llama al endpoint PUT /api/articulos/{id}
    return this.http.put<Articulo>(`${this.apiUrl}/${id}`, articulo);
  }

  /**
   * Elimina un articulo (no implementado)
   * @param id El ID del artículo a eliminar
   */
  deleteArticulo(id: number): Observable<Articulo> {
    return this.http.delete<Articulo>(`${this.apiUrl}/${id}`);
  }
}
