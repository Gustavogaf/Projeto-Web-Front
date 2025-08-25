import { TipoUsuario } from "./usuario.model";

// Interface para exibir um coordenador (vem da API)
export interface Coordenador {
  matricula: string;
  nome: string;
  tipo: TipoUsuario;
}

// Interface para criar um novo coordenador
export interface CoordenadorRequest {
  matricula: string;
  nome: string;
  senha?: string; // Senha é opcional na atualização
}

// Interface para a resposta paginada do backend
export interface PaginaCoordenadores {
  content: Coordenador[];
  totalElements: number;
}