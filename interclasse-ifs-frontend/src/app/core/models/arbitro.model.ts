import { TipoUsuario } from "./usuario.model";

// Interface para exibir um árbitro
export interface Arbitro {
  matricula: string;
  nome: string;
  tipo: TipoUsuario;
}

// Interface para criar ou atualizar um árbitro
export interface ArbitroRequest {
  matricula: string;
  nome: string;
  senha?: string; // Senha é opcional na atualização
}

// Interface para a resposta paginada
export interface PaginaArbitros {
  content: Arbitro[];
  totalElements: number;
}