import { Component, inject, Input, input, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { VehiculoSb } from 'src/app/servicios/vehiculo-sb';
import { IonContent, IonGrid, IonRow, IonCol,
  ModalController, IonTitle, IonButton, IonIcon, IonButtons, IonLabel, IonText } from "@ionic/angular/standalone";
import { LgsDesplegableComponent } from "../../lgs-desplegable/lgs-desplegable.component";
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { Utils } from 'src/app/servicios/utils';
import { addCircle, cameraOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { RegistroModalComponent } from '../registro-modal/registro-modal.component';
import { Vehiculo } from 'src/app/models/vehiculo';
import { LgsCarruselComponent } from "../../lgs-carrusel/lgs-carrusel.component";

@Component({
  selector: 'app-formulario-alta-vehiculo-modal',
  templateUrl: './formulario-alta-vehiculo-modal.component.html',
  styleUrls: ['./formulario-alta-vehiculo-modal.component.scss'],
  imports: [ IonLabel, IonButtons, IonIcon, IonButton, IonTitle, IonCol, IonRow, IonGrid,
    IonContent, LgsDesplegableComponent, LgsInputComponent, ReactiveFormsModule, LgsCarruselComponent],
})
export class FormularioAltaVehiculoModalComponent  implements OnInit {
  //! ======================= Variables y servicios =======================
  //~ ======================= Servicios 
  protected vehiculoSvc = inject(VehiculoSb);
  protected usuarioSvc = inject(UsuarioSb);
  private utilSvc = inject(Utils);
  private modalCtrl = inject(ModalController);

  //~ ======================= Propiedades
  @ViewChild(IonContent) scroll!: IonContent;
  @Input() isEdicion!: boolean;
  vehiculoEditado = input<Vehiculo | null>()
  perfilActual = this.usuarioSvc.usrActual()?.rol
  imagenes = signal<string[]>([])

  protected form = new FormGroup({
    chasis: new FormControl('', [Validators.minLength(17)]),
    propietario: new FormControl(''),
    metraje: new FormControl('',[Validators.required]),
    patente: new FormControl('',[Validators.required]),
    modelo: new FormControl('',[Validators.required]),
    observaciones: new FormControl('',[]),
  })




  //~ ======================= Inicializadores
    constructor() {
      addIcons({cameraOutline,addCircle, chevronUpOutline, chevronDownOutline});
    }
  
    async ngOnInit() {
      const carga = await this.utilSvc.loading()
      await carga.present();
      if(this.vehiculoEditado) {
        this.vehiculoSvc.vehiculoSeleccionado.set(this.vehiculoEditado()!);
        this.imagenes.set(this.vehiculoEditado()?.imagenes ?? []);
      }
      await this.usuarioSvc.iniciarTRUsuarios();
      this.form.patchValue({
        chasis: this.vehiculoEditado()?.chasis ?? '',
        metraje: this.vehiculoEditado()?.metraje ?? '',
        modelo: this.vehiculoEditado()?.modelo ?? '',
        observaciones: this.vehiculoEditado()?.observaciones ?? '',
        patente: this.vehiculoEditado()?.patente ?? '',
        propietario: this.vehiculoEditado()?.propietario?.uid ?? '',
      })
      if(this.perfilActual === 'cliente'){
        this.form.patchValue({
          propietario: this.usuarioSvc.usrActual()?.uid
        })
        
      }
      await carga.dismiss()
    }
    //! ======================= Métodos =======================
    
    //~ ======================= Visuales
    irArriba() {
      this.scroll.scrollToTop(300);
    }

    irAbajo() {
      this.scroll.scrollToBottom(300);
    }
    async cerrar(){
      await this.modalCtrl.dismiss(null, 'cancel');
    }
    
    async agregarUsuario(){
      await this.utilSvc.crearModal(RegistroModalComponent,'sm',{},true)
    }
    //~ ======================= Lógicos

    async aceptarVehiculo(){
      if(this.form.invalid){
        this.utilSvc.mostrarToast('Por favor, rellene correctamente el formulario.',
          'error','middle',100);
          return;
      }

      const vehiculo:Vehiculo ={
        ...this.vehiculoEditado(),
        metraje: this.form.controls.metraje.value!,
        modelo: this.form.controls.modelo.value!,
        patente: this.form.controls.patente.value!,
        uid_propietario: this.form.controls.propietario.value!,
        chasis: this.form.controls.chasis.value!,
        observaciones: this.form.controls.observaciones.value!,
        imagenes: this.imagenes(),
      } 
      const carga = await this.utilSvc.loading()
      try{
        await carga.present();
        if(this.isEdicion) await this.vehiculoSvc.actualizarVehiculo(vehiculo);
        else await this.vehiculoSvc.agregarVehiculo(vehiculo);

        await this.utilSvc.mostrarToast('¡Felicidades, su vehículo ha sido registrado con éxito!',
            'success','middle',500)
        this.modalCtrl.dismiss(null,'confirm')  
      } catch(e){
        await this.utilSvc.mostrarToast('Algo salió mal...',
            'error','middle',100)
        console.error(e);
      } finally{
        await carga.dismiss();
      }
    }
}
