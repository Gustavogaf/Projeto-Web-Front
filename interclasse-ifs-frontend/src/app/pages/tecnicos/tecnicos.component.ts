import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TecnicoService } from '../../core/services/tecnico.service';
import { CoordenadorService } from '../../core/services/coordenador.service';
import { AuthService } from '../../core/services/auth.service';
import { Tecnico, TecnicoRequest } from '../../core/models/tecnico.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tecnicos.component.html',
  styleUrl: './tecnicos.component.scss'
})
export class TecnicosComponent implements OnInit {
  // Injeção de dependências
  private tecnicoService = inject(TecnicoService);
  private coordenadorService = inject(CoordenadorService);
  authService = inject(AuthService); // Deixamos público para usar no template
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  tecnicos: Tecnico[] = [];
  tecnicoForm: FormGroup;
  usuarioEhCoordenador = false;

  // Controle de estado
  isModalAberto = false;
  isEditando = false;
  isLoading = false;
  mensagemErroModal: string | null = null;

  constructor() {
    this.tecnicoForm = this.fb.group({
      matricula: ['', [Validators.required, Validators.minLength(5)]],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.carregarTecnicos();
    // Apenas verificamos o papel, não precisamos mais guardar a matrícula aqui
    this.usuarioEhCoordenador = this.authService.possuiRole('COORDENADOR');
  }

  carregarTecnicos(): void {
    this.isLoading = true;
    this.tecnicoService.getTecnicos()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (pagina) => {
          this.tecnicos = pagina.content;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erro ao carregar técnicos:', err)
      });
  }

  abrirModal(tecnico?: Tecnico): void {
    this.isModalAberto = true;
    this.isEditando = !!tecnico;
    this.mensagemErroModal = null;

    if (tecnico) {
      this.tecnicoForm.patchValue(tecnico);
      this.tecnicoForm.get('matricula')?.disable();
      this.tecnicoForm.get('senha')?.clearValidators();
    } else {
      this.tecnicoForm.reset();
      this.tecnicoForm.get('matricula')?.enable();
      this.tecnicoForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.tecnicoForm.get('senha')?.updateValueAndValidity();
  }

  fecharModal(): void {
    this.isModalAberto = false;
  }

  salvarTecnico(): void {
    const matriculaCoordenador = this.authService.getMatriculaUsuarioLogado();
    if (this.tecnicoForm.invalid || !matriculaCoordenador) {
      alert('Não foi possível identificar o coordenador logado. Tente novamente.');
      return;
    }
    this.isLoading = true;
    this.mensagemErroModal = null;
    const formValue = this.tecnicoForm.getRawValue();
    const request: TecnicoRequest = {
      matricula: formValue.matricula,
      nome: formValue.nome,
    };
    if (formValue.senha) {
      request.senha = formValue.senha;
    }

    const acao = this.isEditando
      ? this.coordenadorService.atualizarTecnico(matriculaCoordenador, request.matricula, request)
      : this.coordenadorService.criarTecnico(matriculaCoordenador, request);

    acao.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.carregarTecnicos();
          this.fecharModal();
        },
        error: (err) => {
          this.mensagemErroModal = 'Erro ao salvar técnico.';
          console.error('Erro ao salvar técnico:', err);
          this.cdr.markForCheck();
        }
      });
  }

  deletarTecnico(matriculaTecnico: string): void {
    const matriculaCoordenador = this.authService.getMatriculaUsuarioLogado();
    if (confirm('Tem certeza que deseja excluir este técnico?') && matriculaCoordenador) {
      this.isLoading = true;
      this.coordenadorService.deletarTecnico(matriculaCoordenador, matriculaTecnico)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (mensagem) => {
            alert(mensagem);
            this.carregarTecnicos();
          },
          error: (err) => {
            alert('Erro ao excluir técnico. Verifique se ele não está associado a uma equipe.');
            console.error('Erro ao excluir técnico:', err);
          }
        });
    }
  }
}