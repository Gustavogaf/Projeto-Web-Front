import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { finalize } from 'rxjs';

// Services
import { AtletaService } from '../../core/services/atleta.service';
import { EquipeService } from '../../core/services/equipe.service';
import { TecnicoService } from '../../core/services/tecnico.service';
import { AuthService } from '../../core/services/auth.service';
import { CursoService } from '../../core/services/curso.service';
import { EsporteService } from '../../core/services/esporte.service';

// Models
import { Atleta, AtletaRequest } from '../../core/models/atleta.model';
import { Equipe, EquipeRequest } from '../../core/models/equipe.model';
import { Curso } from '../../core/models/curso.model';
import { Esporte } from '../../core/models/esporte.model';

@Component({
  selector: 'app-atletas-equipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atletas-equipes.component.html',
  styleUrl: './atletas-equipes.component.scss'
})
export class AtletasEquipesComponent implements OnInit {
  // Injeção de dependências
  private atletaService = inject(AtletaService);
  private equipeService = inject(EquipeService);
  private tecnicoService = inject(TecnicoService);
  authService = inject(AuthService);
  private cursoService = inject(CursoService);
  private esporteService = inject(EsporteService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // Listas de dados
  atletas: Atleta[] = [];
  equipes: Equipe[] = [];
  cursos: Curso[] = [];
  esportes: Esporte[] = [];
  atletasSemEquipe: Atleta[] = [];

  // Formulários
  atletaForm: FormGroup;
  equipeForm: FormGroup;

  // Controle de estado
  isAtletaModalAberto = false;
  isEquipeModalAberto = false;
  isEditando = false;
  isLoading = false;
  mensagemErroModal: string | null = null;
  idEditando: number | string | null = null;

  usuarioEhTecnico = false;
  matriculaTecnicoLogado: string | null = null;

  constructor() {
    this.atletaForm = this.fb.group({
      matricula: ['', [Validators.required, Validators.minLength(5)]],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      apelido: [''],
      telefone: ['', Validators.required],
      senha: ['', [Validators.minLength(6)]]
    });

    this.equipeForm = this.fb.group({
      nome: ['', Validators.required],
      cursoId: [null, Validators.required],
      esporteId: [null, Validators.required],
      matriculasAtletas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.usuarioEhTecnico = this.authService.possuiRole('TECNICO');
    this.matriculaTecnicoLogado = this.authService.getMatriculaUsuarioLogado();
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    this.carregarAtletas();
    this.carregarEquipes();
    if (this.usuarioEhTecnico) {
      this.carregarCursos();
      this.carregarEsportes();
    }
  }

  // --- Métodos para Atletas ---
  carregarAtletas(): void {
    this.atletaService.getAtletas(0, 200).subscribe(p => {
      this.atletas = p.content;
      this.cdr.markForCheck();
    });
  }

  abrirModalAtleta(atleta?: Atleta): void {
    this.isAtletaModalAberto = true;
    this.isEditando = !!atleta;
    this.mensagemErroModal = null;

    if (atleta) {
      this.idEditando = atleta.matricula;
      this.atletaForm.patchValue(atleta);
      this.atletaForm.get('matricula')?.disable();
      this.atletaForm.get('senha')?.clearValidators();
    } else {
      this.atletaForm.reset();
      this.atletaForm.get('matricula')?.enable();
      this.atletaForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.atletaForm.get('senha')?.updateValueAndValidity();
  }

  salvarAtleta(): void {
  if (this.atletaForm.invalid || !this.matriculaTecnicoLogado) {
    return;
  }

  this.isLoading = true;
  this.mensagemErroModal = null;
  const formValue = this.atletaForm.getRawValue();
  const request: AtletaRequest = { ...formValue };

  // Remove o campo senha da requisição se estiver vazio
  if (!formValue.senha) {
    delete request.senha;
  }

  const acao = this.isEditando
    ? this.tecnicoService.atualizarAtleta(this.matriculaTecnicoLogado, this.idEditando as string, request)
    : this.tecnicoService.criarAtleta(this.matriculaTecnicoLogado, request);

  acao.pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.markForCheck(); // Garante a atualização da UI em qualquer caso
    }))
    .subscribe({
      next: () => {
        this.carregarAtletas(); // Atualiza a lista em caso de sucesso
        this.fecharModalAtleta(); // Fecha o modal em caso de sucesso
      },
      error: (err) => {
        // Exibe um alerta claro em caso de erro
        alert('Não foi possível salvar o atleta. Verifique os dados e tente novamente.');
        this.mensagemErroModal = 'Erro ao salvar atleta.';
        console.error('Erro detalhado:', err); // Mantém o erro detalhado no console
      }
    });
}

  deletarAtleta(matricula: string): void {
    if (confirm('Tem certeza? Esta ação é permanente.') && this.matriculaTecnicoLogado) {
      this.tecnicoService.deletarAtleta(this.matriculaTecnicoLogado, matricula).subscribe({
        next: (msg) => { alert(msg); this.carregarAtletas(); },
        error: (err) => alert('Erro ao deletar atleta. Verifique se ele não pertence a uma equipe.')
      });
    }
  }

  fecharModalAtleta(): void { this.isAtletaModalAberto = false; }

  // --- Métodos para Equipes ---
  carregarEquipes(): void {
    this.equipeService.getEquipes(0, 200).subscribe(p => {
      this.equipes = p.content;
      this.cdr.markForCheck();
    });
  }

  carregarCursos(): void {
    this.cursoService.getCursos(0, 200).subscribe(p => this.cursos = p.content);
  }
  carregarEsportes(): void {
    this.esporteService.getEsportes(0, 200).subscribe(p => this.esportes = p.content);
  }

  abrirModalEquipe(equipe?: Equipe): void {
    this.isEquipeModalAberto = true;
    this.isEditando = !!equipe;
    this.mensagemErroModal = null;

    // Limpa o formulário antes de preencher
    this.equipeForm.reset();
    const matriculasAtletas = this.equipeForm.get('matriculasAtletas') as FormArray;
    matriculasAtletas.clear();

    if (equipe) {
      // --- LÓGICA DE EDIÇÃO COMPLETA ---
      this.idEditando = equipe.id;

      // Encontra o curso e o esporte correspondentes para obter os IDs
      const cursoSelecionado = this.cursos.find(c => c.nome === equipe.nomeCurso);
      const esporteSelecionado = this.esportes.find(e => e.nome === equipe.nomeEsporte);

      this.equipeForm.patchValue({
        nome: equipe.nome,
        cursoId: cursoSelecionado ? cursoSelecionado.id : null,
        esporteId: esporteSelecionado ? esporteSelecionado.id : null
      });

      

    }
  }

  // Adicione este método auxiliar para o template HTML
  atletaEstaNaEquipe(matricula: string): boolean {
    const matriculasAtletas = this.equipeForm.get('matriculasAtletas') as FormArray;
    return matriculasAtletas.value.includes(matricula);
  }

  onCheckboxChange(e: any) {
    const matriculas: FormArray = this.equipeForm.get('matriculasAtletas') as FormArray;
    if (e.target.checked) {
      matriculas.push(this.fb.control(e.target.value));
    } else {
      let i = 0;
      matriculas.controls.forEach((item) => {
        if (item.value == e.target.value) {
          matriculas.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  salvarEquipe(): void {
    if (this.equipeForm.invalid || !this.matriculaTecnicoLogado) return;

    const formValue = this.equipeForm.value;
    const request: EquipeRequest = {
      equipe: {
        nome: formValue.nome,
        cursoId: +formValue.cursoId,
        esporteId: +formValue.esporteId,
      },
      matriculasAtletas: formValue.matriculasAtletas
    };

    const acao = this.isEditando
      ? this.tecnicoService.atualizarEquipe(this.matriculaTecnicoLogado, this.idEditando as number, request)
      : this.tecnicoService.criarEquipe(this.matriculaTecnicoLogado, request);

    acao.subscribe({
      next: () => { this.carregarDadosIniciais(); this.fecharModalEquipe(); },
      error: (err) => this.mensagemErroModal = `Erro ao salvar equipe: ${err.error}`
    });
  }

  deletarEquipe(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta equipe?') && this.matriculaTecnicoLogado) {
      this.tecnicoService.deletarEquipe(this.matriculaTecnicoLogado, id).subscribe({
        next: (msg) => { alert(msg); this.carregarEquipes(); },
        error: (err) => alert('Erro ao excluir equipe.')
      });
    }
  }

  fecharModalEquipe(): void { this.isEquipeModalAberto = false; }
}
