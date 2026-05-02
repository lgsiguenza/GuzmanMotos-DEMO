import { inject, Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, 
  ToastController, AlertController, ModalController
 } from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  //! ================== Variables ==================
  private enrutador = inject(Router);
  private cargaCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private location = inject(Location);
  private modalCtrl = inject(ModalController)


  isWeb = signal<boolean>(Capacitor.getPlatform() === 'web');

  

  //! ================== Redirección ==================
  async redirigir(ruta: string, sinLoading: boolean = false): Promise<void> {
    this.reproducirSonidoPorDuracion('assets/sonidos/nav.m4a', 1000)
    if (!sinLoading) {
      const carga = await this.loading();
      await carga.present();
      await this.enrutador.navigateByUrl(ruta);
      await carga.dismiss();
      return;
    }

    await this.enrutador.navigateByUrl(ruta);
  }

  public goBack() : void
  {
    this.location.back();
  }


  //! ================== Sonidos ==================
  reproducirSonidoPorDuracion(path: string, duracionMs: number,
    volumen: number = 1
  ): void {
    const audio = new Audio(path);
    audio.volume = volumen;
    audio.currentTime = 0;

    audio.play().catch(() => {});

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, duracionMs);
  }

  //! ================== Loading ==================
  async loading(): Promise<HTMLIonLoadingElement>{
    const loading = await this.cargaCtrl.create({
      spinner: null,
      translucent: false,
      message: "Cargando...",
      cssClass: 'custom-loading'})
    
    return loading;
  }
  
  //! ================= Alertas ====================
  async mostrarAlert(encabezado: string, mensaje: string | null){  
    const alert = await this.alertCtrl.create({
      header: encabezado,
      message: mensaje ?? '',
      cssClass: 'alert-mjor',
      buttons: [
        {
          text: 'OK',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
  }
  //! ================== Toast ==================
  async mostrarToast(mensaje: string,
    tipo: ('success' | 'error' | 'info' | 'warning' | 'dark'| 'primary') = 'dark',
    posicion: 'top' | 'middle' | 'bottom' = 'top',
    duracion: number = 1500
  ){
    let tipoAsig: string
    if(tipo === 'info') tipoAsig = 'secondary' 
    if(tipo === 'error') tipoAsig = 'danger' 
    else tipoAsig = tipo; 
    const toast = await this.toastCtrl.create({
      color: tipoAsig,
      duration: duracion,
      message: mensaje,
      position: posicion,
      cssClass: 'ion-text-center'
    }
    )
    return toast.present();
  }

  //! ================== Modals ==================
  async crearModal(component: any, size: 'sm' | 'md' | 'lg'|'' = '', 
    data?: Record<string, any>, dismissBackdrop: boolean = true, cssClassExtra?: string) {

    let clases: string[]

    if(size === '') clases = ['modalAdaptable'];
    else clases = ['gm-modal', `gm-modal-${size}`];
    
    if (cssClassExtra) {
      clases.push(cssClassExtra);
    }

    const modal = await this.modalCtrl.create({
      component: component,
      componentProps: data ?? {},
      backdropDismiss: dismissBackdrop,
      cssClass: clases
    });

    await modal.present();

    return modal;
  }
  
    //! ==================== Desencriptación ====================
  formatearPdf147(str: string): string {
     try {
      const bytes = new TextEncoder().encode(str);
      const textoCorregido = new TextDecoder("latin1").decode(bytes);
      return textoCorregido;
    } catch (e) {
      this.mostrarAlert("Error al formatear", String(e));
      return str;
    }
  }
  toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
