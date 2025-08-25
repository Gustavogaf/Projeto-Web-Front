import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaAtletas } from '../models/atleta.model';

@Injectable({
  providedIn: 'root'
})
export class AtletaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/atletas`;

  getAtletas(page = 0, size = 100, sort = 'nome,asc'): Observable<PaginaAtletas> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PaginaAtletas>(this.apiUrl, { params });
  }
}