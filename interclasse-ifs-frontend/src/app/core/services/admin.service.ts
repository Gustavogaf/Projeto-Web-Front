import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coordenador, CoordenadorRequest, PaginaCoordenadores } from '../models/coordenador.model';
import { Arbitro, ArbitroRequest, PaginaArbitros } from '../models/arbitro.model';


@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    // --- Métodos para Coordenadores ---

    getCoordenadores(page = 0, size = 100, sort = 'nome,asc'): Observable<PaginaCoordenadores> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);
        return this.http.get<PaginaCoordenadores>(`${this.apiUrl}/coordenadores`, { params });
    }

    criarCoordenador(coordenador: CoordenadorRequest): Observable<Coordenador> {
        return this.http.post<Coordenador>(`${this.apiUrl}/coordenadores`, coordenador);
    }

    atualizarCoordenador(matricula: string, coordenador: CoordenadorRequest): Observable<Coordenador> {
        return this.http.put<Coordenador>(`${this.apiUrl}/coordenadores/${matricula}`, coordenador);
    }

    deletarCoordenador(matricula: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/coordenadores/${matricula}`, { responseType: 'text' });
    }

    getArbitros(page = 0, size = 100, sort = 'nome,asc'): Observable<PaginaArbitros> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);
        return this.http.get<PaginaArbitros>(`${this.apiUrl}/arbitros`, { params });
    }

    criarArbitro(arbitro: ArbitroRequest): Observable<Arbitro> {
        return this.http.post<Arbitro>(`${this.apiUrl}/arbitros`, arbitro);
    }

    atualizarArbitro(matricula: string, arbitro: ArbitroRequest): Observable<Arbitro> {
        return this.http.put<Arbitro>(`${this.apiUrl}/arbitros/${matricula}`, arbitro);
    }

    deletarArbitro(matricula: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/arbitros/${matricula}`, { responseType: 'text' });
    }
}