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
  {
    path: 'cliente',
    loadComponent: () => import('./paginas/cliente/cliente.page').then( m => m.ClientePage)
  },
  {
    path: 'sobre-nos',
    loadComponent: () => import('./paginas/sobre-nos/sobre-nos.page').then( m => m.SobreNosPage)
  },
  {
    path: 'panel-vehiculos-cliente',
    loadComponent: () => import('./paginas/cliente/panel-vehiculos/panel-vehiculos-cliente.page').then( m => m.PanelVehiculosClientePage)
  },
  {
    path: 'panel-reparaciones-cliente',
    loadComponent: () => import('./paginas/cliente/panel-reparaciones-cliente/panel-reparaciones-cliente.page').then( m => m.PanelReparacionesClientePage)
  },
];
