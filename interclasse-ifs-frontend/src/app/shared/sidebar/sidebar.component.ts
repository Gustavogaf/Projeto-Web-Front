import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  titulo: string;
  rota: string;
  icone: string;
  requerLogin: boolean;
  role?: string; // Adicionamos um campo opcional para permissão
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // Deixamos o authService PÚBLICO
  authService = inject(AuthService);
  router = inject(Router);

  menuItems: MenuItem[] = [
    { titulo: 'Acompanhar Torneio', rota: '/acompanhar-torneio', icone: 'trophy', requerLogin: false },
    { titulo: 'Gestão de Torneio', rota: '/gestao-torneio', icone: 'settings', requerLogin: true, role: 'ADMIN' },
    { titulo: 'Gestão de Coordenadores', rota: '/coordenadores', icone: 'users', requerLogin: true, role: 'ADMIN' },
    { titulo: 'Gestão de Técnicos', rota: '/tecnicos', icone: 'user-check', requerLogin: true, role: 'COORDENADOR' },
    { titulo: 'Gestão de Cursos e Esportes', rota: '/cursos-esportes', icone: 'graduation-cap', requerLogin: true, role: 'ADMIN' },
    { titulo: 'Gestão de Atletas e Equipes', rota: '/atletas-equipes', icone: 'users-round', requerLogin: true, role: 'TECNICO' },
    { titulo: 'Gestão de Árbitros', rota: '/arbitros', icone: 'whistle', requerLogin: true, role: 'ADMIN' }
  ];
}