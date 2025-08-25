import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaEquipes } from '../models/equipe.model';

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/equipes`;

  getEquipes(page = 0, size = 100, sort = 'nome,asc'): Observable<PaginaEquipes> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PaginaEquipes>(this.apiUrl, { params });
  }
}