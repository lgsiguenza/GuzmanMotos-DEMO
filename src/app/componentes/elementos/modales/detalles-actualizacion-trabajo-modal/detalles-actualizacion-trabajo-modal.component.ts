import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonButton, ModalController, IonFooter, IonContent, IonIcon, IonGrid, IonRow, IonCol, IonText, IonTitle } from "@ionic/angular/standalone";
import { Arreglo } from 'src/app/models/arreglo';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { Utils } from 'src/app/servicios/utils';
import { ListadoArreglosComponent } from "../listado-arreglos/listado-arreglos.component";
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { LgsCarruselComponent } from "../../lgs-carrusel/lgs-carrusel.component";
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";

@Component({
  selector: 'app-detalles-actualizacion-trabajo-modal',
  templateUrl: './detalles-actualizacion-trabajo-modal.component.html',
  styleUrls: ['./detalles-actualizacion-trabajo-modal.component.scss'],
  imports: [IonIcon, IonButton, ListadoArreglosComponent, IonFooter, IonContent,
    CurrencyPipe, LgsCarruselComponent, TitleCasePipe, IonGrid, IonRow, IonCol, LgsInputComponent, IonText, IonTitle]
})
export class DetallesActualizacionTrabajoModalComponent  implements OnInit {
  //! ======================= Variables y servicios =======================
  //~ =============== Servicios
  private utilSvc = inject(Utils);
  private userSvc = inject(UsuarioSb);
  private tbjSvc = inject(TrabajoSb);
  private modalCtrl = inject(ModalController);
  //~ ======================= Propiedades
  @ViewChild(IonContent) scroll!: IonContent;
  @ViewChild('inicioPresupuesto') inicioPresupuesto!: ElementRef
  @ViewChild('finalPresupuesto') finalPresupuesto!: ElementRef

  rolUsuarioActual = computed(() => 
    this.userSvc.usrActual()?.rol ?? 'cliente'
  );

  puedeVerArreglos = computed(() => {
    if(this.arreglos().length != 0) return true;

    if(this.rolUsuarioActual() === 'cliente') return false
    if(this.rolUsuarioActual() === 'dueño') return true
    
    return false;
  })
  

  //~ =============== Signals
  presupuesto = signal<number>(0);
  arreglos = signal<Arreglo[]>([])
  imagenes = signal<string[]>([])
  
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
  
  //~ ======================= Inicializadores
  async ngOnInit() {
    const carga = await this.utilSvc.loading();
    await carga.present()
    this.tbjSvc.trabajoSeleccionado.set(this.tbj)
    const lista = this.tbj.arreglos!
    this.imagenes.set(this.tbj.imagenes!);
    this.arreglos.set(lista)
    this.form.patchValue({
        vehiculo: this.tbj.vehiculo?.modelo,
        observaciones: this.tbj.descripcion,
        propietario: this.tbj.vehiculo?.nombrePropietario,
      })
    await carga.dismiss()
  }
  constructor() {
    addIcons({chevronUpOutline, chevronDownOutline})
   }

  //! ======================= Métodos =======================

  //~ ======================= Visuales

  async irArriba() {
    const scrollEl = await this.scroll.getScrollElement();
    const currentY = scrollEl.scrollTop;

    const inicio = this.inicioPresupuesto.nativeElement.offsetTop;
    const final = this.finalPresupuesto.nativeElement.offsetTop;

    if (currentY > inicio + 20) {
      await this.scrollToElemento(this.inicioPresupuesto);
    } 
    else {
      await this.scroll.scrollToTop(300);
    }
  }

  async irAbajo() {
    const scrollEl = await this.scroll.getScrollElement();
    const currentY = scrollEl.scrollTop;
    
    const inicio = this.inicioPresupuesto.nativeElement.offsetTop;
    const final = this.finalPresupuesto.nativeElement.offsetTop;

    if (currentY < inicio - 20) {
      await this.scrollToElemento(this.inicioPresupuesto);
    } 
    else if (currentY < final - 20) {
      await this.scrollToElemento(this.finalPresupuesto); // 🔥 acá estaba el error
    } 
    else {
      await this.scroll.scrollToBottom(300);
    }
  }
  
  async scrollToElemento(elemento: ElementRef, offset: number = 0) {
    const y = elemento.nativeElement.offsetTop + offset;

    await this.scroll.scrollToPoint(0, y, 300);
  }

  //~ ======================= Lógicos

  async cerrarModal(){
    await this.modalCtrl.dismiss(null,'cancel');
  }

  async guardarCambios(){
    if(this.rolUsuarioActual() === 'cliente') return;
    const trabajo: Trabajo = {
      ...this.tbj,
      arreglos: this.arreglos(),
      imagenes: this.imagenes(),
      descripcion: this.form.controls.observaciones.value ?? '',
    }
    const carga = await this.utilSvc.loading()
    try {
      await carga.present();
      await this.tbjSvc.actualizarTrabajo(trabajo);
      await this.utilSvc.mostrarToast('El trabajo se ha actualizado con éxito.', 'success'
        ,'middle',1000)
        await this.modalCtrl.dismiss(null,'confirm')
      } catch (e) {
        await this.utilSvc.mostrarToast('Algo salió mal...', 'error'
          ,'middle',100)
    } finally{
      await carga.dismiss()
    }
  }

}
