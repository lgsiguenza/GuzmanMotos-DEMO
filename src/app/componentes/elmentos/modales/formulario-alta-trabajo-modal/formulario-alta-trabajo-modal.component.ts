import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonGrid, IonRow, IonCol, ModalController, IonText, IonLabel } from '@ionic/angular/standalone';
import { ModalFooterComponent } from "../modal-footer/modal-footer.component";
import { Utils } from 'src/app/servicios/utils';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { ListadoArreglosComponent } from "../listado-arreglos/listado-arreglos.component";
import { Arreglo } from 'src/app/models/arreglo';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';

@Component({
  selector: 'app-formulario-alta-trabajo-modal',
  templateUrl: './formulario-alta-trabajo-modal.component.html',
  styleUrls: ['./formulario-alta-trabajo-modal.component.scss'],
  imports: [IonGrid, CommonModule, FormsModule, ModalFooterComponent, LgsInputComponent,
    IonText, ListadoArreglosComponent, IonCol, IonRow],
})
export class FormularioAltaTrabajoModalComponent  {
 //! =============== Variables y servicios ===============
  private utilSvc = inject(Utils);
  private userSvc = inject(UsuarioSb);
  private tbjSvc = inject(TrabajoSb);
  private modalCtrl = inject(ModalController);

  presupuesto = signal<number>(0);
  arreglos = signal<Arreglo[]>([])

  //~ =============== Formulario
  protected form = new FormGroup({
    propietario: new FormControl('', [Validators.required,Validators.minLength(3),
      ]),
    vehiculo: new FormControl('', [Validators.required,Validators.minLength(3),
      ]),
    observaciones: new FormControl('', [Validators.required,Validators.minLength(3),
      ]),
    listadoArreglos: new FormControl(this.arreglos, Validators.required),
  });

  ngOnInit() {}

  //! =============== Métodos funcionales ===============

  async cerrarModal(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async registrar(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.utilSvc.mostrarToast('¡Debe rellenar todos los campos correctamente', 'error','middle',500)
      return
    }

    const tbj: Trabajo = {
      estado: 'en proceso',
      usuario: this.form.controls.propietario.value!,
      vehiculo: this.form.controls.vehiculo.value!,
      descripcion: this.form.controls.observaciones.value!,
      presupuesto: String(this.presupuesto())!
    }
    const listadoArreglos = this.arreglos();

    const carga = await this.utilSvc.loading();

    try {
      await carga.present();
      await this.tbjSvc.agregarTrabajo(tbj, listadoArreglos);
      this.modalCtrl.dismiss(null,'confirm');
    } catch (e) {
      await this.utilSvc.mostrarToast('¡Hubo un problema!', 'error','middle',500)
      console.log((e as Error).message);
    } finally{
      await carga.dismiss();
    }
    
  }
}
