import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment';
import { CamaraService } from './camara-service';

@Injectable({
  providedIn: 'root',
})
export class SbService {
  private camaraSvc = inject(CamaraService);
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

  /**
   * Realiza una consulta a una tabla principal y permite agregar múltiples
   * relaciones (joins) utilizando la sintaxis relacional de Supabase/PostgREST.
   * 
   * Cada relación se pasa como string en el array `relaciones` y se concatena
   * dinámicamente en el select. Esto permite traer datos relacionados en una
   * sola query, evitando problemas de N+1 queries en el frontend.
   * 
   * Ejemplo de relaciones:
   * [
   *  'detalles:detalle_pedido(*)',
   *  'cliente:users(nombre,apellido)',
   *  'mesa:mesas(numero)'
   * ]
   * 
   * Esto generará internamente un select equivalente a:
   * 
   * select(`
   *  *,
   *  detalles:detalle_pedido(*),
   *  cliente:users(nombre,apellido),
   *  mesa:mesas(numero)
   * `)
   * 
   * @param tabla Tabla principal desde la cual se realizará la consulta.
   * @param relaciones Array de strings con las relaciones que se desean incluir
   * utilizando la sintaxis de Supabase/PostgREST (alias:tabla(columnas)).
   * @returns Lista formateada en <T> con los registros de la tabla principal
   * incluyendo los datos relacionales solicitados.
   */
  async listarTodosConRelaciones<T>(tabla: string, relaciones: string[]): Promise<T[]>{
    const selectRelaciones = relaciones.join(',');

    const { data, error } = await this.sb
      .from(tabla)
      .select(`*,${selectRelaciones}`);

    if(error){
      throw new Error(`Hubo un problema en la selección relacional:\n${error.message}`);
    }

    return (data ?? []) as T[];
  }

  /**
   * Realiza  un join a una tabla con cláve foránea y agrega
   * al objeto un parámentro declarado en parámetro almacenamiento con un array de todas
   * las coincidencias en la constrain de la fk. Esto es formateado a <T>.
   * @param tabla Tabla principal con la clave que es foránea en la auxiliar.
   * @param tablaAux Tabla con FK que repite la clave de la tabla principal.
   * @param parametroAlmacenamiento Parámetro del objeto<T> en el que almacenará las coincidencias de 
   * la tabla auxiliar 
   * @returns Lista formateada en <T> de los elementos de la tabla principal.
   */
  async listarTodosConTablaAuxiliar<T>(tabla: string,
     tablaAux: string, parametroAlmacenamiento: string,): Promise<T[]>{
    const {data, error} = await this.sb
      .from(tabla)
      .select(`*,
        ${parametroAlmacenamiento}:${tablaAux}(*)`)

    if(error) throw new Error(`Hubo un problema en la selección de tablas relacionales:\n${(error as Error).message} `)

    return (data ?? [])as T[];
  }

  

  async listarTodosFiltrados<T>(tabla: string, columnaIdent: string, identificador: string){
    const {data, error} = await this.sb
      .from(tabla)
      .select('*')
      .eq(columnaIdent, identificador)
    if(error) throw new Error('No se pudo encontrar coincidencias o algo ha fallado.');

    return data as T[];

  }
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
    
    const archivo = this.camaraSvc.formatearBase64AImagen(img);
    const rutaArchivo = `${nombre}.png`;

    const { error } = await this.sb.storage
      .from(bucket)
      .upload(rutaArchivo, archivo!, { cacheControl: '3600', upsert: true, contentType: 'image/png' });

    if (error) throw new Error(`Error subiendo la foto: ${error.message}`);
    
    const { data } = this.sb.storage
      .from(bucket)
      .getPublicUrl(rutaArchivo);

    return data.publicUrl;

  } else {

    const arrayFotos = img.map(f => this.camaraSvc.formatearBase64AImagen(f));

    const urls = await Promise.all(
      arrayFotos.map(async (archivo, i: number) => {
        try {
          const rutaArchivo = `${nombre}-${i}.png`;

          const { error } = await this.sb.storage
            .from(bucket)
            .upload(rutaArchivo, archivo!, { cacheControl: '3600', upsert: true, contentType: 'image/png' });

          if (error) throw new Error(error.message);

          const { data } = this.sb.storage
            .from(bucket)
            .getPublicUrl(rutaArchivo);

          return data.publicUrl;

        } catch (e) {
          console.error(`Error en imagen ${i}:`, e);
          return null; // 👈 importante
        }
      })
    );

    // 👇 filtrás las que fallaron
    return urls.filter((u): u is string => u !== null);
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