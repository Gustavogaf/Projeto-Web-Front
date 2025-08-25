import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Injeta o AuthService e o Router
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está logado
  if (authService.isLoggedIn()) {
    return true; // Permite o acesso à rota
  } else {
    // Se não estiver logado, redireciona para a página de login
    router.navigate(['/login']);
    return false; // Bloqueia o acesso à rota
  }
};