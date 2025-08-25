import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursoService } from '../../core/services/curso.service';
import { EsporteService } from '../../core/services/esporte.service';
import { Curso, CategoriaCurso } from '../../core/models/curso.model';
import { Esporte } from '../../core/models/esporte.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-cursos-esportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cursos-esportes.component.html',
  styleUrl: './cursos-esportes.component.scss'
})
export class CursosEsportesComponent implements OnInit {
  // Injeção de dependências
  private cursoService = inject(CursoService);
  private esporteService = inject(EsporteService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // Listas de dados
  cursos: Curso[] = [];
  esportes: Esporte[] = [];

  // Formulários
  cursoForm: FormGroup;
  esporteForm: FormGroup;

  // Controle dos modais e estado
  isCursoModalAberto = false;
  isEsporteModalAberto = false;
  isEditandoCurso = false;
  isEditandoEsporte = false;
  idCursoEditando: number | null = null;
  idEsporteEditando: number | null = null;
  mensagemErroModal: string | null = null;
  isLoading = false;

  // Enum para o template
  categoriasCurso = Object.values(CategoriaCurso);

  constructor() {
    this.cursoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      categoria: [null, [Validators.required]]
    });

    this.esporteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      minAtletas: [1, [Validators.required, Validators.min(1)]],
      maxAtletas: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.carregarCursos();
    this.carregarEsportes();
  }

  // --- MÉTODOS PARA CURSOS ---

  carregarCursos(): void {
    this.isLoading = true;
    this.cursoService.getCursos(0, 100)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: pagina => {
          this.cursos = pagina.content;
          this.cdr.markForCheck(); // 3. Avise o Angular para atualizar a tela
        },
        error: err => console.error('Erro ao carregar cursos:', err)
      });
  }

  abrirModalCurso(curso?: Curso): void {
    this.mensagemErroModal = null;
    this.isEditandoCurso = !!curso;
    this.isCursoModalAberto = true;
    if (curso) {
      this.idCursoEditando = curso.id;
      this.cursoForm.setValue({
        nome: curso.nome,
        categoria: curso.categoria
      });
    } else {
      this.cursoForm.reset();
    }
  }

  fecharModalCurso(): void {
    this.isCursoModalAberto = false;
    this.idCursoEditando = null;
  }

  salvarCurso(): void {
    if (this.cursoForm.invalid) return;
    this.isLoading = true;
    this.mensagemErroModal = null;

    const cursoRequest = this.cursoForm.value;
    const acao = this.isEditandoCurso && this.idCursoEditando
      ? this.cursoService.atualizarCurso(this.idCursoEditando, cursoRequest)
      : this.cursoService.criarCurso(cursoRequest);

    acao.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.carregarCursos(); // <-- Atualiza a lista
          this.fecharModalCurso(); // <-- Fecha o modal
        },
        error: (err) => {
          this.mensagemErroModal = 'Erro ao salvar curso. Verifique os dados ou suas permissões.';
          console.error('Erro ao salvar curso:', err);
          this.cdr.markForCheck(); // 3. Avise o Angular para atualizar a tela
        }
      });
  }

  deletarCurso(id: number): void {
    if (confirm('Tem certeza que deseja deletar este curso?')) {
      this.isLoading = true;
      this.cursoService.deletarCurso(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (mensagem) => {
            // PASSO 1: Exibe a mensagem de sucesso que veio do backend
            alert(mensagem);
            // PASSO 2: Atualiza a lista de cursos
            this.carregarCursos();
          },
          error: (err) => {
            alert('Ocorreu um erro ao deletar o curso.');
            console.error('Erro ao deletar curso:', err);
          }
        });
    }
  }

  // --- MÉTODOS PARA ESPORTES ---

  carregarEsportes(): void {
    this.isLoading = true;
    this.esporteService.getEsportes(0, 100)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: pagina => {
          this.esportes = pagina.content;
          this.cdr.markForCheck(); // 3. Avise o Angular para atualizar a tela
        },
        error: err => console.error('Erro ao carregar esportes:', err)
      });
  }

  abrirModalEsporte(esporte?: Esporte): void {
    this.mensagemErroModal = null;
    this.isEditandoEsporte = !!esporte;
    this.isEsporteModalAberto = true;
    if (esporte) {
      this.idEsporteEditando = esporte.id;
      this.esporteForm.setValue({
        nome: esporte.nome,
        minAtletas: esporte.minAtletas,
        maxAtletas: esporte.maxAtletas
      });
    } else {
      this.esporteForm.reset({ minAtletas: 1, maxAtletas: 1 });
    }
  }

  fecharModalEsporte(): void {
    this.isEsporteModalAberto = false;
    this.idEsporteEditando = null;
  }

  salvarEsporte(): void {
    if (this.esporteForm.invalid) return;
    this.isLoading = true;
    this.mensagemErroModal = null;

    const esporteRequest = this.esporteForm.value;
    const acao = this.isEditandoEsporte && this.idEsporteEditando
      ? this.esporteService.atualizarEsporte(this.idEsporteEditando, esporteRequest)
      : this.esporteService.criarEsporte(esporteRequest);

    acao.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.carregarEsportes(); // <-- Atualiza a lista
          this.fecharModalEsporte(); // <-- Fecha o modal
        },
        error: (err) => {
          this.mensagemErroModal = 'Erro ao salvar esporte. Verifique os dados ou suas permissões.';
          console.error('Erro ao salvar esporte:', err);
          this.cdr.markForCheck(); // 3. Avise o Angular para atualizar a tela
        }
      });
  }

  deletarEsporte(id: number): void {
    if (confirm('Tem certeza que deseja deletar este esporte?')) {
      this.isLoading = true;
      this.esporteService.deletarEsporte(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (mensagem) => {
            // PASSO 1: Exibe a mensagem de sucesso que veio do backend
            alert(mensagem);
            // PASSO 2: Atualiza a lista de esportes
            this.carregarEsportes();
          },
          error: err => {
            alert('Ocorreu um erro ao deletar o esporte.');
            console.error('Erro ao deletar esporte:', err);
          }
        });
    }
  }
}