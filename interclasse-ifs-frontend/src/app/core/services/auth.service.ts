import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment'; // Importaremos o environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'interclasse_token';
  private apiUrl = `${environment.apiUrl}/auth`; // URL base da sua API de autenticação

  constructor(private http: HttpClient) { }

  /**
   * Envia as credenciais para o backend para autenticar o usuário.
   * @param credenciais Objeto com matrícula e senha.
   * @returns Um Observable com a resposta da API (que inclui o token).
   */
  login(credenciais: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciais).pipe(
      tap(response => {
        // Se o login for bem-sucedido, armazena o token.
        this.salvarToken(response.token);
      })
    );
  }

  /**
   * Remove o token do localStorage para deslogar o usuário.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Salva o token JWT no localStorage.
   * @param token O token JWT recebido do backend.
   */
  salvarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Recupera o token do localStorage.
   * @returns O token JWT ou null se não existir.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica se o usuário possui um token válido no localStorage.
   * @returns true se o token existir, false caso contrário.
   */
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}