import { Atleta } from "./atleta.model";

export interface Equipe {
  id: number;
  nome: string;
  nomeCurso: string;
  nomeEsporte: string;
  nomeTecnico: string;
  atletas: Atleta[];
}

export interface PaginaEquipes {
  content: Equipe[];
  totalElements: number;
}

// ADICIONE ESTA NOVA INTERFACE
// Ela modela exatamente o que o DTO CadastroEquipeRequest espera no backend
export interface EquipeRequest {
  equipe: {
    nome: string;
    cursoId: number;
    esporteId: number;
  };
  matriculasAtletas: string[];
}