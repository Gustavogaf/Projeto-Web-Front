export interface AuthRequest {
  matricula: string;
  senha?: string;
}

export interface AuthResponse {
  token: string;
}

export interface UsuarioToken {
  sub: string; // Matrícula do usuário
  roles: string[]; // Papéis/Permissões, ex: ['ROLE_ADMIN']
  iat: number; // Issued at - data de criação
  exp: number; // Expiration - data de expiração
}