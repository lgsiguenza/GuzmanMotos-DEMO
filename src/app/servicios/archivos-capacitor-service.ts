import { inject, Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, 
  ToastController, AlertController, ModalController
 } from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class ArchivosCapacitorService {
  //! ================== Almacenamiento ==================
  async guardarArchivoLocal<T>(direccion: string, datos: T) {
    const arch = await Filesystem.writeFile({
      path: direccion,
      data: JSON.stringify(datos),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });

    console.log(`Archivo ${arch.uri} guardado.`);
  }

  async recuperarArchivoGuardado<T>(direccion: string): Promise<T> {

    const archivo = await Filesystem.readFile({
      path: direccion,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });

    console.log('Archivo recuperado');

    return JSON.parse(archivo.data as string) as T;
  }

  async eliminarArchivoLocal(direccion: string) {

    await Filesystem.deleteFile({
      path: direccion,
      directory: Directory.Data
    });

    console.log('Archivo eliminado.');
  }
}
