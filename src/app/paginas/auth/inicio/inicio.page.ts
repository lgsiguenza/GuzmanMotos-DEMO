import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonButton, ModalController } from '@ionic/angular/standalone';
import { Utils } from 'src/app/servicios/utils';
import { defineCustomElements } from '@ionic/core/loader';
import { RegistroModalComponent } from 'src/app/componentes/elementos/modales/registro-modal/registro-modal.component';
import { IngresoModalComponent } from 'src/app/componentes/elementos/modales/ingreso-modal/ingreso-modal.component';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, CommonModule, FormsModule]
})
export class InicioPage implements OnInit {

  private utilSvc = inject(Utils);
  private modalCtrl = inject(ModalController)
   
  constructor()
  {
    defineCustomElements(window);
    setTimeout(
      () => 
      {
        const segments = document.querySelectorAll('ion-segment');
        segments.forEach(seg => seg.value = seg.value); 
      }, 50);
  }

  async ngOnInit()
  {
    // const status = await PushNotifications.checkPermissions();
    // if (status.receive != 'granted')
    // {
    //   PushNotifications.requestPermissions();
    // }
  }

  async irUsuario() {
    await this.utilSvc.crearModal(IngresoModalComponent, 'sm',{},true)
  }


  async irRegistro(){
    await this.utilSvc.crearModal(RegistroModalComponent, 'md',{},false)
  }


}
