// Interface para exibir um esporte
export interface Esporte {
  id: number;
  nome: string;
  minAtletas: number;
  maxAtletas: number;
}

// Interface para criar ou atualizar um esporte
export type EsporteRequest = Partial<Omit<Esporte, 'id'>>;