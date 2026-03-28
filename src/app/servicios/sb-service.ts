import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root',
})
export class SbService {
   private utilSvc = inject(Utils);
  sb:SupabaseClient
  
  constructor() {
    this.sb = new SupabaseClient(environment.supabaseUrl, environment.supabaseKey)
  }

  //! ======================= Métodos auth =======================

  //~ ======================= Iniciar Sesión
  async iniciarSesion(email: string, password: string) {
    const { data: sessionData, error } =
    await this.sb.auth.signInWithPassword({ email, password });
    if (error || !sessionData?.user) {
      throw error || new Error('No se pudo iniciar sesión');
    }
    
    return sessionData
  }
  
  //~ ======================= Registrar usuario
  async registrarUsuario(email: string, password: string) {
    const { data: sessionData, error } =
    await this.sb.auth.signUp({ email, password });
    if (error || !sessionData?.user) {
      throw error || new Error(`No se pudo registrar usuario:\n${(error as unknown as Error)!.message!}`);
    }
    
    return sessionData
  }
  
  
  //~ ======================= Cerrar Sesión
  async cerrarSesion() {
    try {
      const signOutPromise = this.sb.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
    );

      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (signOutError) {
      console.warn(
        'Error o timeout al cerrar sesión en Supabase:',
        signOutError
      );
      
      throw signOutError;
    }
  }
  //~ ======================= Recuperar Sesión
  async recuperarSesion(){
    const {data, error} = await this.sb.auth.getSession();
    if(error) throw new Error(`Hubo un problema con:\n ${(error as Error).message}`);

    return data

  }

  //! ======================= Métodos genéricos =======================

  //~ ======================= Métodos Select 
  async listarTodos<T>(tabla: string): Promise<T[]>{
    const {data, error} = await this.sb
      .from(tabla)
      .select('*');

      if(error) throw new Error(`Error al adquirir la tabla '${tabla}': ${error.message}`);
      
      return data as T[];
  }
  
  async adquirirColumna<T>(tabla: string, columna: string): Promise<T[]> {
    const { data, error } = await this.sb
    .from(tabla)
    .select(columna);
    
    if (error) {
      throw new Error(`Error al adquirir columna '${columna}' de la tabla '${tabla}': ${error.message}`);
    }
    
    return data as T[] ?? [];
  }
  
  async adquirirFila<T>(tabla: string, columnaIdent: string, identificador: string): Promise<T | null>{
    const {data, error} = await this.sb
      .from(tabla)
      .select('*')
      .eq(columnaIdent,identificador)
      .maybeSingle();
    
    if(error) throw new Error(`Error al buscar: ${error.message}`);
    
    return data as T
  }

  async adquirirCelda<T>(tabla: string, columnaReturn: string,columnaIdent: string, identificador: string): Promise<T>{
    const {data, error} = await this.sb
      .from(tabla)
      .select(columnaReturn)
      .eq(columnaIdent,identificador)
      .maybeSingle();

    if(error) throw new Error(`Error al buscar en ${tabla}, ${columnaIdent}, ${identificador}: ${(error as Error).message}`);
    
    if(!data) return null as T

    const registro = data as unknown as Record<string, unknown >;

    return (registro[columnaReturn] as T) ?? ('' as T);  
}

  //~ ======================= Métodos Insert 
  async insertar<T>(tabla: string, datos: T) {
    const {data, error } = await this.sb
    .from(tabla)
    .insert(datos)
    .select();

    
    if (error) throw new Error(`Error al insertar: ${error.message}`);
    return data ?? [];
  }
  
  //~ ======================= Métodos Update 
  async actualizar<T>(tabla: string, columnaIdent: string, identificador: string, cambios: Partial<T>): Promise<T> {
    const { data, error } = await this.sb
      .from(tabla)
      .update(cambios)
      .eq(columnaIdent, identificador)
      .select();
    if (error) throw new Error(`Error al actualizar: ${error.message}`);
    return data as T
    }

  //~ ======================= Método Delete 
  async eliminar<T>(tabla: string, columnaIdent: string, identificador: string): Promise<void> {
    const { error } = await this.sb
      .from(tabla)
      .delete()
      .eq(columnaIdent, identificador)
      .single();

    if (error) throw new Error(`Error al elimnar: ${error.message}`);
  }

  //! ================= Métodos de fotos ==============

  async subirImagen(nombre: string, img: string | string[], bucket: string){
    if(typeof img === 'string'){
      if(!img.startsWith('data:')) throw new Error('Foto inválida.');
      
      var archivo = this.utilSvc.formatearBase64AImagen(img);

      const rutaArchivo = `${nombre}.png`

      const {error} = await this.sb.storage
        .from(bucket)
        .upload(rutaArchivo, archivo!, 
          { cacheControl: '3600', upsert: true, contentType: 'image/png' }
        )
      if (error) throw new Error(`Error subiendo la foto: ${error.message}`);
      
      const { data } = this.sb.storage
        .from(bucket)
        .getPublicUrl(rutaArchivo);
  
      return data.publicUrl;
    
    } else{
      //? Convierte el array a base 64
      const arrayFotos = img.map(f =>{ 
        return this.utilSvc.formatearBase64AImagen(f)
      })

      const urls = await Promise.all(arrayFotos.map(async (archivo, i:number) => {
        const rutaArchivo = `${nombre}-${i}.png`; 

        const { error } = await this.sb.storage
          .from('foto-usuario')
          .upload(rutaArchivo, archivo!, { cacheControl: '3600', upsert: true, contentType: 'image/png' });

        if (error) throw new Error(`Error subiendo la foto: ${error.message}`);

        const { data } = this.sb.storage
          .from(bucket)
          .getPublicUrl(rutaArchivo);

        return data.publicUrl;
      }));

      return urls; //? devuelve un array de URLs
    }
  }

  /**
   * Sube una o varias fotos a Supabase Storage.
   *
   * @param nombre  Nombre base del archivo (sin extensión).
   * @param img     Foto o array de fotos en formato Blob.
   * @param bucket  Bucket de Supabase donde se almacenará la imagen.
   *
   * @returns       URL pública (string) o array de URLs públicas (string[])
   */
  async subirFoto(
    nombre: string,
    img: Blob | Blob[],
    bucket: string
  ): Promise<string | string[]> {

    // ─────────────────────────────────────────────
    // CASO 1: UNA SOLA FOTO
    // ─────────────────────────────────────────────
    if (img instanceof Blob) {
      if (!img.size) throw new Error('Foto inválida.');

      const rutaArchivo = `${nombre}.png`;

      const { error } = await this.sb.storage
        .from(bucket)
        .upload(rutaArchivo, img, {
          cacheControl: '3600',
          upsert: true,
          contentType: img.type || 'image/png',
        });

      if (error) {
        throw new Error(`Error subiendo la foto: ${error.message}`);
      }

      const { data } = this.sb.storage
        .from(bucket)
        .getPublicUrl(rutaArchivo);

      return data.publicUrl;
    }

    // ─────────────────────────────────────────────
    // CASO 2: MÚLTIPLES FOTOS
    // ─────────────────────────────────────────────
    if (!Array.isArray(img) || img.length === 0) {
      throw new Error('Array de fotos inválido.');
    }

    const urls = await Promise.all(
      img.map(async (archivo, i) => {
        if (!(archivo instanceof Blob) || !archivo.size) {
          throw new Error(`Foto inválida en la posición ${i}.`);
        }

        const rutaArchivo = `${nombre}-${i}.png`;

        const { error } = await this.sb.storage
          .from(bucket)
          .upload(rutaArchivo, archivo, {
            cacheControl: '3600',
            upsert: true,
            contentType: archivo.type || 'image/png',
          });

        if (error) {
          throw new Error(`Error subiendo la foto: ${error.message}`);
        }

        const { data } = this.sb.storage
          .from(bucket)
          .getPublicUrl(rutaArchivo);

        return data.publicUrl;
      })
    );

    return urls;
  }


  obtenerUrl(bucket: string, archivo: string){
    const {data: url} =  this.sb 
      .storage
      .from(bucket)
      .getPublicUrl(archivo)

    return url.publicUrl;
  }

  async eliminarFoto(bucket: string, archivo: string){
    const {error} = await this.sb.storage
      .from(bucket)
      .remove([`${archivo}.png`])
  }

}