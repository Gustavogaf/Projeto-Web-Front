import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tecnico, TecnicoRequest } from '../models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class CoordenadorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coordenadores`;

  criarTecnico(matriculaCoordenador: string, tecnico: TecnicoRequest): Observable<Tecnico> {
    return this.http.post<Tecnico>(`${this.apiUrl}/${matriculaCoordenador}/tecnicos`, tecnico);
  }

  atualizarTecnico(matriculaCoordenador: string, matriculaTecnico: string, tecnico: TecnicoRequest): Observable<Tecnico> {
    return this.http.put<Tecnico>(`${this.apiUrl}/${matriculaCoordenador}/tecnicos/${matriculaTecnico}`, tecnico);
  }

  deletarTecnico(matriculaCoordenador: string, matriculaTecnico: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${matriculaCoordenador}/tecnicos/${matriculaTecnico}`, { responseType: 'text' });
  }
}