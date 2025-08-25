// Usamos um 'enum' para a categoria, assim como no backend
export enum CategoriaCurso {
  INTEGRADO = 'INTEGRADO',
  SUPERIOR = 'SUPERIOR',
  SUBSEQUENTE = 'SUBSEQUENTE'
}

// Interface para exibir um curso (resposta do GET)
export interface Curso {
  id: number;
  nome: string;
  categoria: CategoriaCurso;
}

// Interface para criar ou atualizar um curso (corpo do POST/PUT)
// Usamos 'Partial' para o caso de atualização, onde nem todos os campos são enviados
export type CursoRequest = Partial<Omit<Curso, 'id'>>;