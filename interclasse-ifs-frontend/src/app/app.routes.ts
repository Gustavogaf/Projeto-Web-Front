import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { CursosEsportesComponent } from './pages/cursos-esportes/cursos-esportes.component'; // Adicione este import


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Rotas Públicas (acessíveis por todos)
      { path: 'home', component: HomeComponent },
      { path: 'acompanhar-torneio', component: HomeComponent }, // Placeholder

      // Rotas Protegidas (apenas para usuários logados)
      { path: 'gestao-torneio', component: HomeComponent, canActivate: [authGuard] }, // Placeholder
      { path: 'coordenadores', component: HomeComponent, canActivate: [authGuard] }, // Placeholder
      { path: 'tecnicos', component: HomeComponent, canActivate: [authGuard] }, // Placeholder
      { path: 'cursos-esportes', component: CursosEsportesComponent, canActivate: [authGuard] },
      { path: 'atletas-equipes', component: HomeComponent, canActivate: [authGuard] }, // Placeholder
      { path: 'arbitros', component: HomeComponent, canActivate: [authGuard] }, // Placeholder

      // Redirecionamento padrão
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  // Rota curinga para qualquer URL não encontrada
  { path: '**', redirectTo: '' }
];