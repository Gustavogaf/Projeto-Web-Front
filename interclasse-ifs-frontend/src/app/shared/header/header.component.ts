import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  // Deixamos o authService PÚBLICO para que o template possa acessá-lo
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  mensagemErro: string | null = null;

  loginForm = this.fb.group({
    matricula: ['', [Validators.required]],
    senha: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const { matricula, senha } = this.loginForm.value;
    this.authService.login({ matricula: matricula!, senha: senha! })
      .subscribe({
        next: () => {
          this.mensagemErro = null;
          this.loginForm.reset();
          // A navegação pode ser mais suave, mas reload funciona bem por agora
          // this.router.navigate(['/home']);
        },
        error: (err) => {
          this.mensagemErro = 'Matrícula ou senha inválida.';
          console.error('Erro de login:', err);
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}