import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { UsuarioSb } from './servicios/usuario-sb';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  protected userSvc = inject(UsuarioSb);

  
  constructor() {}
  
  async ngOnInit(){
    await this.userSvc.recuperarSesion()
  }
}
