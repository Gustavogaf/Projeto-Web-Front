import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, of } from 'rxjs';
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

  // --- MÉTODO LOGIN CORRIGIDO ---
  login(credenciais: AuthRequest): Observable<UsuarioLogado> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credenciais).pipe(
      // 1. Primeiro, salvamos o token que recebemos.
      tap(response => this.salvarToken(response.token)),
      // 2. Usamos switchMap para encadear uma nova requisição (buscar o usuário).
      // O login só continua depois que esta nova requisição terminar.
      switchMap(() => this.http.get<UsuarioLogado>(`${this.apiUrl}/debug/whoami`)),
      // 3. Com os dados do usuário em mãos, os armazenamos no BehaviorSubject.
      tap(usuario => this.usuarioAtualSubject.next(usuario))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
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
  private carregarUsuarioLogado(): void {
    if (this.isLoggedIn()) {
      // Usamos o mesmo método encadeado aqui para garantir consistência
      this.http.get<UsuarioLogado>(`${this.apiUrl}/debug/whoami`).subscribe({
        next: (usuario) => this.usuarioAtualSubject.next(usuario),
        error: () => this.logout() // Se o token for inválido, desloga o usuário
      });
    }
  }

  // O método buscarEArmazenarUsuario() não é mais necessário pois a lógica está no login
  // e no carregarUsuarioLogado()

  get valorUsuarioAtual(): UsuarioLogado | null {
    return this.usuarioAtualSubject.value;
  }

  possuiRole(role: string): boolean {
    const usuario = this.valorUsuarioAtual;
    if (!usuario || !usuario.authorities) {
      return false;
    }
    return usuario.authorities.includes(`ROLE_${role.toUpperCase()}`);
  }

  getMatriculaUsuarioLogado(): string | null {
    return this.valorUsuarioAtual?.username ?? null;
  }
}