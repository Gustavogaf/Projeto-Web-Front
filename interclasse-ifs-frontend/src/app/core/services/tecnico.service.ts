import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaTecnicos } from '../models/tecnico.model';
import { Atleta, AtletaRequest } from '../models/atleta.model';
import { Equipe, EquipeRequest } from '../models/equipe.model';

@Injectable({
    providedIn: 'root'
})
export class TecnicoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tecnicos`;

    
    getTecnicos(page = 0, size = 100, sort = 'nome,asc'): Observable<PaginaTecnicos> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);
        return this.http.get<PaginaTecnicos>(this.apiUrl, { params });
    }

    criarAtleta(matriculaTecnico: string, atleta: AtletaRequest): Observable<Atleta> {
        return this.http.post<Atleta>(`${this.apiUrl}/${matriculaTecnico}/atletas`, atleta);
    }

    atualizarAtleta(matriculaTecnico: string, matriculaAtleta: string, atleta: AtletaRequest): Observable<Atleta> {
        return this.http.put<Atleta>(`${this.apiUrl}/${matriculaTecnico}/atletas/${matriculaAtleta}`, atleta);
    }

    deletarAtleta(matriculaTecnico: string, matriculaAtleta: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${matriculaTecnico}/atletas/${matriculaAtleta}/db`, { responseType: 'text' });
    }

    // --- Métodos para Equipes ---

    // O tipo 'any' aqui é porque o request é bem específico
    criarEquipe(matriculaTecnico: string, equipeRequest: any): Observable<Equipe> {
        return this.http.post<Equipe>(`${this.apiUrl}/${matriculaTecnico}/equipes`, equipeRequest);
    }
    atualizarEquipe(matriculaTecnico: string, idEquipe: number, equipeRequest: EquipeRequest): Observable<Equipe> {
        return this.http.put<Equipe>(`${this.apiUrl}/${matriculaTecnico}/equipes/${idEquipe}`, equipeRequest);
    }

    deletarEquipe(matriculaTecnico: string, idEquipe: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${matriculaTecnico}/equipes/${idEquipe}`, { responseType: 'text' });
    }
}