import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curso, CursoRequest } from '../models/curso.model';

// Interface para a resposta paginada do backend
export interface PaginaCursos {
  content: Curso[];
  totalElements: number;
  // Adicione outros campos da paginação se necessário (totalPages, size, etc.)
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cursos`;

  // Busca uma página de cursos
  getCursos(page = 0, size = 10, sort = 'nome,asc'): Observable<PaginaCursos> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PaginaCursos>(this.apiUrl, { params });
  }

  // Cria um novo curso
  criarCurso(curso: CursoRequest): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, curso);
  }

  // Atualiza um curso existente
  atualizarCurso(id: number, curso: CursoRequest): Observable<Curso> {
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, curso);
  }

  // Deleta um curso
  deletarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}