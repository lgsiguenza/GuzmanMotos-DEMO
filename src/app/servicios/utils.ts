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
    if(tipo === 'info') tipoAsig = 'medium' 
    if(tipo === 'error') tipoAsig = 'danger' 
    else tipoAsig = tipo; 
    const toast = await this.toastCtrl.create({
      color: tipoAsig,
      duration: duracion,
      message: mensaje,
      position: posicion
    }
    )
    return toast.present();
  }

  //! ================== Modals ==================
  async crearModal(component: any, size: 'sm' | 'md' | 'lg', 
    data?: Record<string, any>, dismissBackdrop: boolean = true, cssClassExtra?: string) {

  const clases: string[] = ['gm-modal', `gm-modal-${size}`];

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
  //! ================== Métodos para imágenes ==================
  /**
   * Convierte un archivo (File) a su representación base64 completa (con prefijo data:[tipo];base64,)
   * @param file Archivo a convertir
   * @returns Promise<string> cadena base64 completa
   */
  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
        console.log(resolve)
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);  // Documentación: readAsDataURL devuelve DataURL con prefijo. :contentReference[oaicite:3]{index=3}
    });
  }

  /**
   * Convierte un string base64 completo (con prefijo data:[tipo];base64,) a un Blob válido para subir.
   * @param base64 cadena base64 completa con prefijo
   * @returns Blob o null si el formato es inválido
   */
  public formatearBase64AImagen(base64: string): Blob | null {
    if (!base64 || !base64.startsWith('data:')) {
      console.warn('El string no tiene prefijo data: esperado.');
    }

    // Extraer el tipo MIME
    const match = base64.match(/^data:(.*?);base64,/);
    if (!match) {
      console.warn('No se pudo extraer MIME del prefijo del base64.');
      return null;
    }
    const mimeType = match[1];

    // Eliminar el prefijo para obtener solo la parte base64
    const base64Data = base64.substring(base64.indexOf(',') + 1);

    // Decodificar a bytes
    const byteChars = atob(base64Data);  // atob decodifica base64 → string de bytes. :contentReference[oaicite:4]{index=4}
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Crear Blob
    const blob = new Blob([byteArray], { type: mimeType });
    return blob;
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
