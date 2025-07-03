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
}
