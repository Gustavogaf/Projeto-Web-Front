import { TipoUsuario } from './usuario.model';

export interface Atleta {
  matricula: string;
  nome: string;
  apelido: string;
  telefone: string;
  tipo: TipoUsuario;
  // Adicionaremos a equipe quando o modelo de equipe estiver pronto
}

export interface AtletaRequest {
  matricula: string;
  nome: string;
  apelido?: string;
  telefone: string;
  senha?: string;
}

export interface PaginaAtletas {
  content: Atleta[];
  totalElements: number;
}