import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Arbitro, ArbitroRequest } from '../../core/models/arbitro.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-arbitros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './arbitros.component.html',
  styleUrl: './arbitros.component.scss'
})
export class ArbitrosComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  arbitros: Arbitro[] = [];
  arbitroForm: FormGroup;

  // Controle do modal
  isModalAberto = false;
  isEditando = false;
  isLoading = false;
  mensagemErroModal: string | null = null;

  constructor() {
    this.arbitroForm = this.fb.group({
      matricula: ['', [Validators.required, Validators.minLength(4)]],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.carregarArbitros();
  }

  carregarArbitros(): void {
    this.isLoading = true;
    this.adminService.getArbitros()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (pagina) => {
          this.arbitros = pagina.content;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erro ao carregar árbitros:', err)
      });
  }

  abrirModal(arbitro?: Arbitro): void {
    this.isModalAberto = true;
    this.isEditando = !!arbitro;
    this.mensagemErroModal = null;

    if (arbitro) {
      this.arbitroForm.patchValue(arbitro);
      this.arbitroForm.get('matricula')?.disable();
      this.arbitroForm.get('senha')?.clearValidators();
      this.arbitroForm.get('senha')?.updateValueAndValidity();
    } else {
      this.arbitroForm.reset();
      this.arbitroForm.get('matricula')?.enable();
      this.arbitroForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.arbitroForm.get('senha')?.updateValueAndValidity();
    }
  }

  fecharModal(): void {
    this.isModalAberto = false;
  }

  salvarArbitro(): void {
    if (this.arbitroForm.invalid) return;

    this.isLoading = true;
    this.mensagemErroModal = null;
    const formValue = this.arbitroForm.getRawValue();
    const request: ArbitroRequest = {
      matricula: formValue.matricula,
      nome: formValue.nome,
    };

    if (formValue.senha) {
      request.senha = formValue.senha;
    }

    const acao = this.isEditando
      ? this.adminService.atualizarArbitro(request.matricula, request)
      : this.adminService.criarArbitro(request);

    acao.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.carregarArbitros();
          this.fecharModal();
        },
        error: (err) => {
          this.mensagemErroModal = 'Erro ao salvar árbitro.';
          console.error('Erro ao salvar árbitro:', err);
          this.cdr.markForCheck();
        }
      });
  }

  deletarArbitro(matricula: string): void {
    if (confirm('Tem certeza que deseja excluir este árbitro?')) {
      this.isLoading = true;
      this.adminService.deletarArbitro(matricula)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (mensagem) => {
            alert(mensagem);
            this.carregarArbitros();
          },
          error: (err) => {
            alert('Erro ao excluir árbitro.');
            console.error('Erro ao excluir árbitro:', err);
          }
        });
    }
  }
}
