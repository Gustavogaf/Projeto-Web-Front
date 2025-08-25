import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Coordenador, CoordenadorRequest } from '../../core/models/coordenador.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-coordenadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coordenadores.component.html',
  styleUrl: './coordenadores.component.scss'
})
export class CoordenadoresComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  coordenadores: Coordenador[] = [];
  coordenadorForm: FormGroup;

  // Controle do formulário
  isFormularioVisivel = false;
  isEditando = false;
  isLoading = false;

  constructor() {
    this.coordenadorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      matricula: ['', [Validators.required, Validators.minLength(5)]],
      senha: ['', [Validators.minLength(6)]] // Senha não é obrigatória na edição
    });
  }

  ngOnInit(): void {
    this.carregarCoordenadores();
  }

  carregarCoordenadores(): void {
    this.isLoading = true;
    this.adminService.getCoordenadores()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (pagina) => {
          this.coordenadores = pagina.content;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erro ao carregar coordenadores:', err)
      });
  }

  mostrarFormulario(coordenador?: Coordenador): void {
    this.isFormularioVisivel = true;
    this.isEditando = !!coordenador;

    if (coordenador) {
      // Editando: preenche o form e ajusta validações
      this.coordenadorForm.patchValue(coordenador);
      this.coordenadorForm.get('matricula')?.disable(); // Não permite editar a matrícula
      this.coordenadorForm.get('senha')?.clearValidators(); // Senha opcional na edição
    } else {
      // Criando: limpa o form e restaura validações
      this.coordenadorForm.reset();
      this.coordenadorForm.get('matricula')?.enable();
      this.coordenadorForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.coordenadorForm.updateValueAndValidity();
  }

  cancelar(): void {
    this.isFormularioVisivel = false;
    this.isEditando = false;
  }

  salvar(): void {
    if (this.coordenadorForm.invalid) {
      return;
    }
    this.isLoading = true;

    const formValue = this.coordenadorForm.getRawValue(); // Usa getRawValue para incluir a matrícula desabilitada
    const request: CoordenadorRequest = {
      matricula: formValue.matricula,
      nome: formValue.nome,
    };

    // Adiciona a senha apenas se foi digitada
    if (formValue.senha) {
      request.senha = formValue.senha;
    }

    const acao = this.isEditando
      ? this.adminService.atualizarCoordenador(request.matricula, request)
      : this.adminService.criarCoordenador(request);

    acao.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.carregarCoordenadores();
          this.cancelar();
        },
        error: (err) => {
          alert('Erro ao salvar coordenador. Verifique os dados e tente novamente.');
          console.error('Erro ao salvar:', err);
        }
      });
  }

  deletar(matricula: string): void {
    if (confirm('Tem certeza que deseja excluir este coordenador?')) {
      this.isLoading = true;
      this.adminService.deletarCoordenador(matricula)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (mensagem) => {
            alert(mensagem);
            this.carregarCoordenadores();
          },
          error: (err) => {
            alert('Erro ao excluir coordenador.');
            console.error('Erro ao excluir:', err);
          }
        });
    }
  }
}
