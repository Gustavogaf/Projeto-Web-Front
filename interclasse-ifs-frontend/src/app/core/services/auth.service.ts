import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

// Interface para os dados do usuário que virão do endpoint /whoami
interface UsuarioLogado {
  username: string; // matricula
  authorities: string[]; // ex: ["ROLE_COORDENADOR"]
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'interclasse_token';
  private apiUrl = environment.apiUrl;

  // BehaviorSubject para armazenar os dados do usuário logado e notificar componentes
  private usuarioAtualSubject = new BehaviorSubject<UsuarioLogado | null>(null);
  public usuarioAtual$ = this.usuarioAtualSubject.asObservable();

  constructor() {
    // Ao iniciar o serviço, verifica se já existe um token e busca os dados do usuário
    this.carregarUsuarioLogado();
  }

  login(credenciais: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credenciais).pipe(
      tap(response => {
        this.salvarToken(response.token);
        // Após salvar o token, busca e armazena os dados do usuário
        this.buscarEArmazenarUsuario();
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Limpa os dados do usuário
    this.usuarioAtualSubject.next(null);
    window.location.reload(); // Recarrega para um estado limpo
  }

  // --- Métodos de Gerenciamento de Token ---
  salvarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // --- Métodos de Gerenciamento de Usuário ---

  /**
   * Se houver um token, busca os dados do usuário no endpoint /whoami
   */
  private carregarUsuarioLogado(): void {
    if (this.isLoggedIn()) {
      this.buscarEArmazenarUsuario();
    }
  }

  /**
   * Faz a chamada HTTP para /whoami e atualiza o BehaviorSubject
   */
  private buscarEArmazenarUsuario(): void {
    this.http.get<UsuarioLogado>(`${this.apiUrl}/debug/whoami`).subscribe({
      next: (usuario) => this.usuarioAtualSubject.next(usuario),
      error: () => this.logout() // Se o token for inválido, desloga o usuário
    });
  }

  /**
   * Retorna o valor atual dos dados do usuário logado.
   */
  get valorUsuarioAtual(): UsuarioLogado | null {
    return this.usuarioAtualSubject.value;
  }

  /**
   * Verifica se o usuário logado possui um determinado papel (role).
   * AGORA VERIFICA A PARTIR DOS DADOS OBTIDOS DO BACKEND.
   */
  possuiRole(role: string): boolean {
    const usuario = this.valorUsuarioAtual;
    if (!usuario || !usuario.authorities) {
      return false;
    }
    return usuario.authorities.includes(`ROLE_${role.toUpperCase()}`);
  }

  /**
   * Obtém a matrícula do usuário logado.
   */
  getMatriculaUsuarioLogado(): string | null {
    return this.valorUsuarioAtual?.username ?? null;
  }
}