import { Component, computed, EventEmitter, inject, input, Input, OnInit, Output, signal } from '@angular/core';
import { IonIcon, IonButton } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { cameraOutline, chevronBack, chevronForward } from 'ionicons/icons';
import { CamaraService } from 'src/app/servicios/camara-service';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-lgs-carrusel',
  templateUrl: './lgs-carrusel.component.html',
  styleUrls: ['./lgs-carrusel.component.scss'],
  imports: [IonButton, IonIcon, ],
})
export class LgsCarruselComponent  implements OnInit {
  //! ======================= Variables y servicios =======================
  //~ ======================= Servicios 
  private camaraSvc = inject(CamaraService);
  private utilSvc = inject(Utils)

  //~ ======================= Propiedades
  imagenes = input.required<string[]>();
  @Input() editable = false;

  @Output() imagenesChange = new EventEmitter<string[]>();

  isWeb = this.utilSvc.isWeb();
  
  totalSlides = computed(() =>
    this.imagenes().length + (this.editable ? 1 : 0)
  );
  mostrarNav = computed(() => this.totalSlides() > 1);
  
  //~ ======================= Inicializadores
  constructor() {
    addIcons({cameraOutline, chevronBack, chevronForward})
  }
  
  ngOnInit() {}
  //! ======================= Métodos =======================
  
  //~ ======================= Paginación
  index = signal<number>(0);
  touchStartX = 0;
  
  siguiente() {
    if (this.index() < this.totalSlides() - 1) {
      this.index.update(v => v + 1);
    }
  }

  anterior() {
    if (this.index() > 0) {
      this.index.update(v => v - 1);
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    const endX = event.changedTouches[0].screenX;
    const delta = endX - this.touchStartX;

    if (Math.abs(delta) < 50) return;

    if (delta > 0) {
      this.anterior();
    } else {
      this.siguiente();
    }
  }

  //~ ======================= Lógicos
  // AGREGAR IMAGEN
  async onAgregar() {

    const nueva = await this.camaraSvc.seleccionarArchivo();

    if (!nueva) return;

    const copia = [...(this.imagenes() ?? []), nueva];

    this.imagenesChange.emit(copia);

    // 👇 esto mejora la UX
    this.index.set(copia.length - 1);
  }
  
  
  async modificar(indice: number){
    const nueva = await this.camaraSvc.seleccionarArchivo();

    if (!nueva) return;

    const copia = this.imagenes().map((img, i) => i === indice ? nueva : img);
    this.imagenesChange.emit(copia);

  }

  eliminar(indice: number) {

  const listaActual = this.imagenes();

  if (!listaActual || listaActual.length === 0) return;

  const nuevaLista = listaActual.filter((_, i) => i !== indice);

  this.imagenesChange.emit(nuevaLista);

  // 👇 ajustar índice para no romper el carrusel
  if (this.index() > 0) {
    this.index.update(v => Math.min(v - 1, nuevaLista.length - 1));
  } else {
    this.index.set(0);
  }
}

}
