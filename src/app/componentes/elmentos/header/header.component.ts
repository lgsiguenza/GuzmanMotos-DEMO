import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonHeader, IonToolbar, IonLabel, IonButtons,IonButton, IonTitle,
   ModalController, IonRouterOutlet, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowBackCircleOutline, ellipsisVertical, logOutOutline } from 'ionicons/icons';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonIcon, IonRow, IonToolbar, IonHeader, IonButton],

})
export class HeaderComponent  implements OnInit {
  private noise: any
  //!================== Servicios y variables==================
  
  private utilSvc = inject(Utils)
  protected userSvc = inject(UsuarioSb);
  private router = inject(Router)
  protected estoyEnControlOCliente = this.router.url === '/control' || this.router.url === '/cliente'


//!================== Métodos ==================
  //? Botón de cerrar sesión
  async cerrarSesion(){
    await this.userSvc.cerrarSesion();
    this.utilSvc.redirigir('inicio');
  }

  protected async salirDeLaApp()
  {
    await App.exitApp();
    this.noise.play();
  }

  ngOnInit(): void
  {
    this.noise = new Audio();
    this.noise.src = '../../../assets/sounds/8-bit_failure.ogg';
    this.noise.load();
  }

  protected volver()
  {
    if(this.estoyEnControlOCliente) return
    this.utilSvc.goBack();
  }

  constructor(){
    addIcons({ellipsisVertical, arrowBackCircleOutline, logOutOutline})
  }

  abrirOpciones(){
    alert("XD")
  }
}
