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
      matriculasAtletas: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    this.usuarioEhTecnico = this.authService.possuiRole('TECNICO');
    this.matriculaTecnicoLogado = this.authService.getMatriculaUsuarioLogado();
    
    if (this.usuarioEhTecnico && this.matriculaTecnicoLogado) {
      this.carregarDadosIniciais();
    }
  }

  carregarDadosIniciais(): void {
    this.isLoading = true;
    this.carregarCursos();
    this.carregarEsportes();
    this.carregarEquipes(); // Carrega equipes primeiro para filtrar atletas corretamente
    this.isLoading = false;
  }

  // --- MÉTODOS DE ATLETAS ---
  carregarAtletas(): void {
    this.atletaService.getAtletas(0, 200).subscribe(p => {
      this.atletas = p.content;
      this.filtrarAtletasSemEquipe();
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
      this.atletaForm.get('senha')?.setValue('');
    } else {
      this.atletaForm.reset();
      this.atletaForm.get('matricula')?.enable();
      this.atletaForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.atletaForm.get('senha')?.updateValueAndValidity();
  }

  salvarAtleta(): void {
    if (this.atletaForm.invalid || !this.matriculaTecnicoLogado) return;

    this.isLoading = true;
    const formValue = this.atletaForm.getRawValue();
    const request: AtletaRequest = { ...formValue };
    if (!formValue.senha) delete request.senha;

    const acao = this.isEditando
      ? this.tecnicoService.atualizarAtleta(this.matriculaTecnicoLogado, this.idEditando as string, request)
      : this.tecnicoService.criarAtleta(this.matriculaTecnicoLogado, request);

    acao.pipe(finalize(() => this.isLoading = false)).subscribe({
      next: () => {
        this.carregarDadosIniciais();
        this.fecharModalAtleta();
      },
      error: (err) => alert(`Erro ao salvar atleta: ${err.error?.message || 'Verifique os dados.'}`)
    });
  }

  deletarAtleta(matricula: string): void {
    if (confirm('Tem certeza?') && this.matriculaTecnicoLogado) {
      this.tecnicoService.deletarAtleta(this.matriculaTecnicoLogado, matricula).subscribe({
        next: () => { alert("Atleta deletado."); this.carregarDadosIniciais(); },
        error: (err) => alert('Erro ao deletar atleta.')
      });
    }
  }

  fecharModalAtleta(): void { this.isAtletaModalAberto = false; }

  // --- MÉTODOS DE EQUIPES ---
  carregarEquipes(): void {
    this.equipeService.getEquipes(0, 200).subscribe(p => {
      this.equipes = p.content;
      this.carregarAtletas(); // Agora carrega os atletas
      this.cdr.markForCheck();
    });
  }
  
  carregarCursos(): void { this.cursoService.getCursos(0, 200).subscribe(p => this.cursos = p.content); }
  carregarEsportes(): void { this.esporteService.getEsportes(0, 200).subscribe(p => this.esportes = p.content); }

  abrirModalEquipe(equipe?: Equipe): void {
    this.isEquipeModalAberto = true;
    this.isEditando = !!equipe;
    this.mensagemErroModal = null;
    
    this.equipeForm.reset();
    const matriculasAtletasArray = this.equipeForm.get('matriculasAtletas') as FormArray;
    matriculasAtletasArray.clear();

    if (equipe) {
      this.idEditando = equipe.id;
      const cursoDaEquipe = this.cursos.find(c => c.nome === equipe.nomeCurso);
      const esporteDaEquipe = this.esportes.find(e => e.nome === equipe.nomeEsporte);
      
      this.equipeForm.patchValue({
        nome: equipe.nome,
        cursoId: cursoDaEquipe ? cursoDaEquipe.id : null,
        esporteId: esporteDaEquipe ? esporteDaEquipe.id : null
      });

      equipe.atletas.forEach(atleta => matriculasAtletasArray.push(this.fb.control(atleta.matricula)));
    }
  }

  salvarEquipe(): void {
    if (this.equipeForm.invalid || !this.matriculaTecnicoLogado) return;

    const formValue = this.equipeForm.value;
    const request: EquipeRequest = {
      equipe: { nome: formValue.nome, cursoId: +formValue.cursoId, esporteId: +formValue.esporteId },
      matriculasAtletas: formValue.matriculasAtletas
    };

    const acao = this.isEditando
      ? this.tecnicoService.atualizarEquipe(this.matriculaTecnicoLogado, this.idEditando as number, request)
      : this.tecnicoService.criarEquipe(this.matriculaTecnicoLogado, request);

    acao.subscribe({
      next: () => { this.carregarDadosIniciais(); this.fecharModalEquipe(); },
      error: (err) => alert(`Erro ao salvar equipe: ${err.error?.message || 'Verifique os dados.'}`)
    });
  }

  deletarEquipe(id: number): void {
    if (confirm('Tem certeza?') && this.matriculaTecnicoLogado) {
      this.tecnicoService.deletarEquipe(this.matriculaTecnicoLogado, id).subscribe({
        next: () => { alert("Equipe deletada."); this.carregarEquipes(); },
        error: (err) => alert('Erro ao excluir equipe.')
      });
    }
  }

  fecharModalEquipe(): void { this.isEquipeModalAberto = false; }

  // --- MÉTODOS AUXILIARES ---
  filtrarAtletasSemEquipe(): void {
    const todasMatriculasEmEquipes = new Set(this.equipes.flatMap(e => e.atletas.map(a => a.matricula)));
    this.atletasSemEquipe = this.atletas.filter(a => !todasMatriculasEmEquipes.has(a.matricula));
  }

  atletaEstaNaEquipe(matricula: string): boolean {
    const matriculasAtletas = this.equipeForm.get('matriculasAtletas') as FormArray;
    return matriculasAtletas.value.includes(matricula);
  }

  onCheckboxChange(e: Event) {
    const checkbox = e.target as HTMLInputElement;
    const matriculas: FormArray = this.equipeForm.get('matriculasAtletas') as FormArray;
    if (checkbox.checked) {
      matriculas.push(this.fb.control(checkbox.value));
    } else {
      const index = matriculas.controls.findIndex(x => x.value === checkbox.value);
      if (index !== -1) matriculas.removeAt(index);
    }
  }
}