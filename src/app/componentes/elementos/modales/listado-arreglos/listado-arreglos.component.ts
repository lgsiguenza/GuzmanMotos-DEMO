import { Component, EventEmitter, inject, Input, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { IonInput, IonButton, IonIcon, IonLabel, IonTextarea, IonCheckbox } from "@ionic/angular/standalone";
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';
import { Arreglo } from 'src/app/models/arreglo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { Utils } from 'src/app/servicios/utils';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-listado-arreglos',
  templateUrl: './listado-arreglos.component.html',
  styleUrls: ['./listado-arreglos.component.scss'],
  imports: [IonTextarea, IonLabel, FormsModule, IonInput, 
    IonButton, IonIcon, IonCheckbox, ReactiveFormsModule, CurrencyPipe],
})

export class ListadoArreglosComponent {
  
  
  //! ======================= Variables y servicios =======================
  
  //~ ======================= Servicios 
  protected tbjSvc = inject(TrabajoSb);
  protected utilSvc = inject(Utils);
  
  //~ ======================= Propiedades
  
  @Input({required: true}) listadoArreglos:Arreglo[] = [];
  @Input() isEdicion: boolean = false
  @Input() esSoloVista: boolean = false
  @Output() totalChange = new EventEmitter<number>();
  @Output() listaArreglos = new EventEmitter<Arreglo[]>()
  
  protected form = new FormGroup({
    arreglos: new FormArray<FormGroup>([])
  });

  //~ ======================= Inicializadores
  constructor(){
    addIcons({add, trash})
  }
  
  //! ======================= Métodos =======================
  //~ ======================= Visuales
  toggleEstado(group: FormGroup, checked: boolean){

    group.patchValue({
      estado: checked ? 'completado' : 'en proceso'
    });

    const listaActualizada = this.arreglos.controls
      .slice(0, -1) // 🔥 excluye la fila vacía editable
      .map(ctrl => ctrl.value as Arreglo);
    this.listaArreglos.emit(listaActualizada);
  }

  total = signal(0);

  ngOnInit() {
   this.arreglos.valueChanges.subscribe(() => {
      const validos = this.obtenerArreglosValidos();

      const total = validos.reduce((acc, item) => {
        return acc + (item.cantidad * item.costo);
      }, 0);

      this.total.set(total);
      this.totalChange.emit(total);
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['listadoArreglos']) {

      const prev = changes['listadoArreglos'].previousValue;
      const curr = changes['listadoArreglos'].currentValue;

      // 🔥 evita loop: si es el mismo contenido, no rehidratar
      if (JSON.stringify(prev) === JSON.stringify(curr)) {
        return;
      }

      this.arreglos.clear();

      if (!this.listadoArreglos || this.listadoArreglos.length === 0) {
        this.arreglos.push(this.crearArregloForm());
      } else {
        this.listadoArreglos.forEach(a => {
          this.arreglos.push(this.crearArregloForm(a));
        });

        this.calcularTotal();
        if(!this.esSoloVista) this.arreglos.push(this.crearArregloForm());
      }
    }
  }
  
  //~ ======================= Lógicos
  calcularTotal() {
    const total = this.arreglos.value.reduce((acc, item) => {
      const subtotal = (item.cantidad || 0) * (item.costo || 0);
      return acc + subtotal;
    }, 0);
    
    this.totalChange.emit(total);
  }
  get arreglos(): FormArray<FormGroup> {
    return this.form.get('arreglos') as FormArray<FormGroup>;
  }

  async agregar() {
    const ultimo = this.arreglos.at(this.arreglos.length - 1);

    ultimo.markAllAsTouched();
    ultimo.updateValueAndValidity();

    if (ultimo.invalid) {
      await this.utilSvc.mostrarToast(
        'Complete todos los campos para agregar uno nuevo',
        'error','middle',50
      );
      return;
    }

    // 🔥 emitís SOLO los válidos (ANTES de crear la nueva fila)
    this.listaArreglos.emit(this.obtenerArreglosValidos());

    // recién ahora agregás la fila vacía
    this.arreglos.push(this.crearArregloForm());
  }

  eliminar(index: number) {
    this.arreglos.removeAt(index);

    // 🔥 emitís el estado real actual
    this.listaArreglos.emit(this.obtenerArreglosValidos());

    this.calcularTotal();
  }
  
  //~ ======================= Privados
  private crearArregloForm(arreglo?: Arreglo): FormGroup {
    return new FormGroup({
      id: new FormControl(arreglo?.id ?? undefined), // 👈 agregar esto
      cantidad: new FormControl(arreglo?.cantidad ?? null, Validators.required),
      nombre: new FormControl(arreglo?.nombre ?? '', Validators.required),
      problema: new FormControl(arreglo?.problema ?? '', Validators.required),
      costo: new FormControl(arreglo?.costo ?? null, Validators.required),
      estado: new FormControl(arreglo?.estado ?? 'en proceso'), // 👈 importante
    });
  }

  private obtenerArreglosValidos(): Arreglo[] {
    return this.arreglos.controls
      .filter(ctrl => ctrl.valid)
      .map(ctrl => ctrl.value as Arreglo);
  }
  private cargarArreglosEnForm(arreglos: Arreglo[]) {
    this.arreglos.clear();

    if (!arreglos || arreglos.length === 0) {
      this.arreglos.push(this.crearArregloForm());
      return;
    }

    arreglos.forEach(ar => {
      this.arreglos.push(this.crearArregloForm(ar));
    });

    // 🔥 siempre agregamos la fila editable al final
    this.arreglos.push(this.crearArregloForm());
  }
}