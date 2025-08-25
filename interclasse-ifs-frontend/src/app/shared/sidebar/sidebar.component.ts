import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

// Definimos uma interface para os itens do menu para organizar melhor o código
interface MenuItem {
  titulo: string;
  rota: string;
  icone: string; // Usaremos os nomes dos ícones do Lucide Icons (https://lucide.dev/)
  requerLogin: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // Lista de todos os itens do menu
  menuItems: MenuItem[] = [
    { titulo: 'Acompanhar Torneio', rota: '/acompanhar-torneio', icone: 'trophy', requerLogin: false },
    { titulo: 'Gestão de Torneio', rota: '/gestao-torneio', icone: 'settings', requerLogin: true },
    { titulo: 'Gestão de Coordenadores', rota: '/coordenadores', icone: 'users', requerLogin: true },
    { titulo: 'Gestão de Técnicos', rota: '/tecnicos', icone: 'user-check', requerLogin: true },
    { titulo: 'Gestão de Cursos e Esportes', rota: '/cursos-esportes', icone: 'graduation-cap', requerLogin: true },
    { titulo: 'Gestão de Atletas e Equipes', rota: '/atletas-equipes', icone: 'users-round', requerLogin: true },
    { titulo: 'Gestão de Árbitros', rota: '/arbitros', icone: 'whistle', requerLogin: true }
  ];

  // Filtra os itens do menu que devem ser exibidos
  get itensVisiveis(): MenuItem[] {
    if (this.authService.isLoggedIn()) {
      return this.menuItems; // Se logado, mostra todos
    }
    return this.menuItems.filter(item => !item.requerLogin); // Se não, mostra apenas os públicos
  }
}
