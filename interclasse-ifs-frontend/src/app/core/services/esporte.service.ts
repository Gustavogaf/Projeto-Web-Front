import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Esporte, EsporteRequest } from '../models/esporte.model';

export interface PaginaEsportes {
  content: Esporte[];
  totalElements: number;
}

@Injectable({
  providedIn: 'root'
})
export class EsporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/esportes`;

  // Busca uma página de esportes
  getEsportes(page = 0, size = 10, sort = 'nome,asc'): Observable<PaginaEsportes> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PaginaEsportes>(this.apiUrl, { params });
  }

  // Cria um novo esporte
  criarEsporte(esporte: EsporteRequest): Observable<Esporte> {
    return this.http.post<Esporte>(this.apiUrl, esporte);
  }

  // Atualiza um esporte existente
  atualizarEsporte(id: number, esporte: EsporteRequest): Observable<Esporte> {
    return this.http.put<Esporte>(`${this.apiUrl}/${id}`, esporte);
  }

  // Deleta um esporte
  deletarEsporte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}