import { Routes } from '@angular/router';
import { ControlPage } from './paginas/control/control.page';
import { PreloginPage } from './paginas/prelogin/prelogin.page';

export const routes: Routes = [
  {
    path: 'prelogin',
    loadComponent: () => import('./paginas/prelogin/prelogin.page').then(m => PreloginPage)

  },
  {
    path: '',
    redirectTo: 'prelogin',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () => import('./paginas/auth/inicio/inicio.page').then( m => m.InicioPage)
  },
  {
    path: 'control',
    loadComponent: () => import('./paginas/control/control.page').then(m => ControlPage)
  },
  {
    path: 'test',
    loadComponent: () => import('./paginas/test/test.page').then( m => m.TestPage)
  },
];
