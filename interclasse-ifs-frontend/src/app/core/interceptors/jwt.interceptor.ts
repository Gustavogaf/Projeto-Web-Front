import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o serviço de autenticação
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Verifica se o usuário está logado (se existe um token)
  if (token) {
    // Clona a requisição original e adiciona o cabeçalho de autorização
    const requisicaoComToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Prossegue com a requisição modificada
    return next(requisicaoComToken);
  }

  // Se não houver token, prossegue com a requisição original
  return next(req);
};