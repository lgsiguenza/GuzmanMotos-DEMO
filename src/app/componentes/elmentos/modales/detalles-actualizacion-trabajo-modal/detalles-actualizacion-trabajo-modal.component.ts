import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonButton, ModalController } from "@ionic/angular/standalone";
import { Arreglo } from 'src/app/models/arreglo';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { Utils } from 'src/app/servicios/utils';
import { ListadoArreglosComponent } from "../listado-arreglos/listado-arreglos.component";

@Component({
  selector: 'app-detalles-actualizacion-trabajo-modal',
  templateUrl: './detalles-actualizacion-trabajo-modal.component.html',
  styleUrls: ['./detalles-actualizacion-trabajo-modal.component.scss'],
  imports: [IonButton, ListadoArreglosComponent]
})
export class DetallesActualizacionTrabajoModalComponent  implements OnInit {
  
  //~ =============== Servicios
  private utilSvc = inject(Utils);
  private userSvc = inject(UsuarioSb);
  private tbjSvc = inject(TrabajoSb);
  private modalCtrl = inject(ModalController);
  //~ =============== signals
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
  protected tbj!:Trabajo
  
  
  async ngOnInit() {
    const carga = await this.utilSvc.loading();
    await carga.present()
      const lista = await this.tbjSvc.obtenerListadoArreglos(this.tbj.uid!)
      this.arreglos.set(lista)
      this.form.patchValue({
        vehiculo: this.tbj.vehiculo,
        observaciones: this.tbj.descripcion,
        propietario: this.tbj.usuario,
      })
    await carga.dismiss()
  }
  constructor() { }
  

}
