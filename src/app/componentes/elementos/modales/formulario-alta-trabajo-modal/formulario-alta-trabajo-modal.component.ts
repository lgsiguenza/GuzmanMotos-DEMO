import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonGrid, IonRow, IonCol, ModalController, IonText, IonLabel, IonTitle, IonIcon, IonContent, IonButton, IonFooter } from '@ionic/angular/standalone';
import { ModalFooterComponent } from "../modal-footer/modal-footer.component";
import { Utils } from 'src/app/servicios/utils';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { ListadoArreglosComponent } from "../listado-arreglos/listado-arreglos.component";
import { Arreglo } from 'src/app/models/arreglo';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { VehiculoSb } from 'src/app/servicios/vehiculo-sb';
import { LgsDesplegableComponent } from "../../lgs-desplegable/lgs-desplegable.component";
import { addIcons } from 'ionicons';
import { cameraOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { LgsCarruselComponent } from "../../lgs-carrusel/lgs-carrusel.component";

@Component({
  selector: 'app-formulario-alta-trabajo-modal',
  templateUrl: './formulario-alta-trabajo-modal.component.html',
  styleUrls: ['./formulario-alta-trabajo-modal.component.scss'],
  imports: [IonButton, IonGrid, CommonModule, FormsModule, ModalFooterComponent, LgsInputComponent,
    ListadoArreglosComponent, IonCol, IonRow, LgsDesplegableComponent, IonTitle,
    LgsCarruselComponent, IonContent, IonIcon, IonFooter],
})
export class FormularioAltaTrabajoModalComponent  {
  //! =============== Variables y servicios ===============
  //~ =============== Servicios
  private utilSvc = inject(Utils);
  private trabajoSvc = inject(TrabajoSb);
  private modalCtrl = inject(ModalController);
  protected usuarioSvc = inject(UsuarioSb); 

  protected vehiculoSvc = inject(VehiculoSb);
  
  //~ =============== Inputs Modal
  protected isEdicion!: boolean;
  protected trabajoActualización!: Trabajo
  
  protected imagenes = signal<string[]>([])
  //~ =============== Signals y propiedades
  presupuesto = signal<number>(0);
  arreglos = signal<Arreglo[]>([])
  listaVehiculos = computed(() => {
    const vehiculos = this.vehiculoSvc.listaVehiculos();
    const usuario = this.usuarioSvc.usrActual();
    const reparacionesActuales = this.trabajoSvc.listaTrabajos().filter(
      (t) => t.estado !== 'completado')

    if (usuario?.rol !== 'dueño') {
      const vehiculosCliente = vehiculos.filter(v => v.uid_propietario === usuario?.uid);
      const vehiculosSeleccionables = vehiculosCliente.filter((v)=>
        !reparacionesActuales.some((rep) => rep.uid_vehiculo === v.uid));
      return vehiculosSeleccionables
    }

    return vehiculos.filter((v) =>
      !reparacionesActuales.some((rep) => rep.uid_vehiculo === v.uid));
  });

  @ViewChild(IonContent) scroll!: IonContent;

  //~ =============== Formulario
  protected form = new FormGroup({
    vehiculo: new FormControl('', [Validators.required,Validators.minLength(3),
    ]),
    observaciones: new FormControl('', [Validators.required,Validators.minLength(3),
      ]),
      listadoArreglos: new FormControl(this.arreglos, Validators.required),
    });
    
    vehiculoUid = toSignal(
      this.form.controls.vehiculo.valueChanges,
      { initialValue: this.form.controls.vehiculo.value }
    );
    vehiculoSeleccionado = computed(()=>{
      const uid = this.vehiculoUid();
      const vehiculo = this.vehiculoSvc.listaVehiculos().find((v) => v.uid === uid);
      if(vehiculo) return `${vehiculo?.propietario?.nombre} ${vehiculo?.propietario?.apellido}`
      else return null
    })

   
  //~ =============== Inicialización
  async ngOnInit() {
    await this.vehiculoSvc.iniciarCanalVehiculos();
    if(this.isEdicion){
      const carga = await this.utilSvc.loading();
      await carga.present()
      this.trabajoSvc.trabajoSeleccionado.set(this.trabajoActualización);
      this.imagenes.set(this.trabajoActualización.imagenes ?? []);
      this.trabajoSvc.listaArreglos.set(this.trabajoActualización.arreglos!);
      this.arreglos.set(this.trabajoActualización.arreglos ?? [])
      this.form.patchValue({
        vehiculo: this.trabajoActualización.vehiculo!.uid,
        observaciones: this.trabajoActualización.descripcion,
      })

      await carga.dismiss()
    };

  }

  constructor(){
    addIcons({cameraOutline, chevronUpOutline, chevronDownOutline})
  }



  //! =============== Métodos ===============
  
  //~ =============== Visuales
  irArriba() {
    this.scroll.scrollToTop(300);
  }

  irAbajo() {
    this.scroll.scrollToBottom(300);
  }
    
  //~ =============== Funcionales
  async cerrarModal(){
    this.trabajoSvc.listaArreglos.set([])
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async registrar(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.utilSvc.mostrarToast('¡Debe rellenar todos los campos correctamente!', 'error','middle',500)
      return
    }
    if(this.arreglos().length <= 0 && this.usuarioSvc.usrActual()?.rol !== 'cliente'){
      await this.utilSvc.mostrarToast('¡Se debe agregar al menos un arreglo!',
         'error','middle',50)
      return
    }

    const tbj: Trabajo = {
      ...this.trabajoActualización,
      estado: 'en proceso',
      uid_vehiculo: this.form.controls.vehiculo.value!,
      descripcion: this.form.controls.observaciones.value!,
      arreglos: this.arreglos(),
      presupuesto: String(this.presupuesto())!,
      imagenes: this.imagenes(),
    }

    if(this.usuarioSvc.usrActual()?.rol === 'cliente') tbj.estado = 'solicitado';
    const carga = await this.utilSvc.loading();

    try {
      await carga.present();
      if(this.isEdicion) await this.trabajoSvc.actualizarTrabajo(tbj);
      else await this.trabajoSvc.agregarTrabajo(tbj);
      this.trabajoSvc.listaArreglos.set([])
      this.modalCtrl.dismiss(null,'confirm');
    } catch (e) {
      await this.utilSvc.mostrarToast('¡Hubo un problema!', 'error','middle',500)
      console.log((e as Error).message);
    } finally{
      await carga.dismiss();
    }
    
  }
}
