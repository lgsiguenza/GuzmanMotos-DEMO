import { computed, inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';
import { AuthUser, RealtimeChannel } from '@supabase/supabase-js';
import { SbService } from './sb-service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioSb {

  private sbSvc = inject(SbService);

  listaUsuarios = signal<Usuario[]>([])
  usrSeleccionado = signal<Usuario | null>(null);
  usrAuth = signal<AuthUser | null>(null);
  usrActual = signal<Usuario | null>(null);

  isCliente = computed<boolean | null>(() => {
    const usr = this.usrActual();

    if(!usr) return null;

    return usr.rol === 'cliente';
  });

  private canalUsuarios: RealtimeChannel | null = this.sbSvc.sb.channel('usuarios-realtime');
  private isCanalInicializado = false;


    //! =================== Métodos CRUD ===================

  async agregarUsuario(usr: Usuario){
    await this.insertarUsuario(usr);
    await this.refrescarListaUsuarios();
  }

  async actualizarUsuario(usr: Usuario){
    await this.actualizarUsuarioBD(usr);
    await this.refrescarListaUsuarios();
  }

  async eliminarUsuario(usr: Usuario){
    await this.eliminarUsuarioBD(usr.uid as string);
    await this.refrescarListaUsuarios();
  }

  //! =================== Métodos Tiempo Real ===================

  async iniciarTRUsuarios() {
  if (this.isCanalInicializado) return;
  await this.refrescarListaUsuarios();
  this.isCanalInicializado = true;
  this.canalUsuarios!
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Usuarios'
      },
      async (evento) => {
        console.log('Evento realtime recibido:', evento);

        switch (evento.eventType) {
          case 'INSERT':
            setTimeout(async()=> {
                await this.refrescarListaUsuarios();
            }, 1000);
            break;

          case 'UPDATE':
            await this.refrescarListaUsuarios();
            break;

          case 'DELETE':
            await this.refrescarListaUsuarios();
            break;
        }
      }
    )
    .subscribe((status) => {
      console.log("Estado canal realtime:", status);
    });
  }

  destruirCanalUsuarios() {
    if (this.canalUsuarios) {
      this.sbSvc.sb.removeChannel(this.canalUsuarios);
      this.canalUsuarios = null;
    }
  }

   //! =================== Métodos Auth ===================

  async iniciarSesion(correo:string, contrasenia: string){
    const authUser = await this.sbSvc.iniciarSesion(correo, contrasenia)
    this.usrAuth.set(authUser.user as AuthUser);

    const usrBd = await this.obtenerUsuario(authUser.user.id);
    this.usrActual.set(usrBd) 
  }

  async recuperarSesion(){
    const sb = await  this.sbSvc.recuperarSesion(); 
    if(sb === null) {
      throw new Error('No hay sesión que recuperar.')
    }
    const uid = sb.session?.user.id

    this.usrAuth.set(sb.session?.user as AuthUser);
    this.usrActual.set(await this.obtenerUsuario(uid!));
  }

  async cerrarSesion(){
    const sb = await this.sbSvc.recuperarSesion()
    if(sb === null) {
      throw new Error('No hay sesión que cerrar.')
    }

    this.sbSvc.cerrarSesion();
    this.usrActual.set(null);
    this.usrAuth.set(null);
  }

   private async obtenerUsuario(uid: string): Promise<Usuario | null>{
    return this.sbSvc.adquirirFila<Usuario>('Usuarios','uid',uid);
  }

  private async refrescarListaUsuarios(){
    const ls = await this.sbSvc.listarTodos<Usuario>('Usuarios');
    const usuarios = await Promise.all(
      ls.map(async (u) => {
        u.foto = await this.sbSvc.obtenerUrl('foto-usuario', `${u.uid}.png`);
        return u;
      })
    );
    this.listaUsuarios.set(usuarios);
  }

   private async insertarUsuario(usr: Usuario){
    //? Verificamos que posea path de la foto
    // if(usr.foto === null) throw new Error('No se ha tomado foto alguna.');
    //? Verificamos que el dato sea correcto
    if(usr.contraseña === null) throw new Error('No se han recopilado correctamente los datos')
    //? Verficamos existencia
    const existe = this.listaUsuarios().some(u => u.correo === usr.correo);
    if(existe) throw new Error('Usuario ya registrado');  

   //? Registramos en la base de datos 
    const dataAuth = await this.sbSvc.registrarUsuario(usr.correo, usr.contraseña!);
    if(dataAuth === null) throw new Error('No se pudo registrar en supabase.');

    //? Insertamos en tabla
    const datos:Usuario = {
      uid: dataAuth.user?.id,
      apellido: usr.apellido,
      dni: usr.dni,
      correo: usr.correo,
      nombre: usr.nombre,
      rol: usr.rol,
    }
    
    const dataTabla = await this.sbSvc.insertar('Usuarios', datos);
    if(dataTabla === null) throw new Error('Hubo un error con la base de datos');

  }

  private async actualizarUsuarioBD(actualizacion: Usuario){
    const usrActualizado: Usuario = {
      nombre: actualizacion.nombre,
      apellido: actualizacion.apellido,
      dni: actualizacion.dni,
      correo: actualizacion.correo,
      rol: actualizacion.rol,
    };

    const dataBD = await this.sbSvc.actualizar<Usuario>('Usuarios','uid',actualizacion.uid!, usrActualizado)
    if(dataBD === null) throw new Error('Hubo un error en la base de datos.')
    
    return dataBD
  }

  private async eliminarUsuarioBD(uid: string){
    await this.sbSvc.eliminar('Usuarios','uid',uid);
  }
}
