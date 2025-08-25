import { TipoUsuario } from "./usuario.model";

export interface Tecnico {
  matricula: string;
  nome: string;
  tipo: TipoUsuario;
}

export interface TecnicoRequest {
  matricula: string;
  nome: string;
  senha?: string;
}

export interface PaginaTecnicos {
  content: Tecnico[];
  totalElements: number;
}