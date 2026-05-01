import { Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo} from '@capacitor/camera';
import { decode } from 'base64-arraybuffer';
import { Filesystem } from '@capacitor/filesystem';


@Injectable({
  providedIn: 'root',
})
export class CamaraService {

  //! ================== Métodos para imágenes web ==================

   /**
 * Abre un selector de archivos y devuelve el archivo seleccionado como base64 completo (con prefijo data:[tipo];base64,)
 * @param accept Tipos de archivo permitidos, por ejemplo "image/*" o ".jpg,.png"
 * @returns Promise<string | null> base64 completo o null si se cancela
 */
  public async seleccionarArchivo(accept: string = 'image/*'): Promise<string | null> {
    return new Promise((retorno, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;

      input.onchange = async () => {
        const file = input.files && input.files.length > 0 ? input.files[0] : null;
        if (!file) {
          retorno(null);
          return;
        }
        try {
          const base64 = await this.convertirArchivoABase64(file);
          retorno(base64) ;
          console.log(retorno)
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  }

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

      reader.readAsDataURL(file);  
      // Documentación: readAsDataURL devuelve DataURL con prefijo. :contentReference[oaicite:3]{index=3}
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

  //! ================== Métodos para cámara en android ==================

  async convertirFotosABlobs(fotos: string[]): Promise<Blob[]> {
    const blobs: Blob[] = [];

    for (const fotoPath of fotos) {
      const blob = await this.procesarFoto(fotoPath);
      blobs.push(blob);
    }

    return blobs;
  }
  /**
   * Convierte un string con el path de una foto en el sistema en un blob
   * @param img path de la imagen
   * @returns Promise<Blob> o null si el formato es inválido
   */
  async procesarFoto(img: string): Promise<Blob>{
    const file = await Filesystem.readFile({
        path: img,
      });
    const ab = decode(file.data as string) as ArrayBuffer;
    const archivo = new Blob([ab], { type: 'image/png' });

    return archivo
  }

   /** //? Crea una instancia de la interfaz de Photo con el producto de
   *   ?la interacción del usuario.
   * * Devuelve la instancia de Photo o null en caso de error.
   * @returns Photo
   */
  async tomarFotoCelular(): Promise<Photo | null>{
    try{
      await Camera.requestPermissions();
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: 500,
        height: 500,
      } as ImageOptions);

      if(image){
        return image;
      }

      return null;
    }catch(e){
      alert(String(e));
      return null;
    }
  }
  /** //?Habilita a seleccionar una imágen desde la galería
   *  *  Devuelve un objeto del tipo Promise<Photo> 
   * @returns String
   */
  async seleccionarFotoCelular(): Promise<Photo | null> {
    try {
      await Camera.requestPermissions();
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 500,
      } as ImageOptions);

      if (imagen.path) {
        return imagen;
      }

      return null;

    } catch (error) {
      alert(String(error));
      return null;
    }
  }

}
