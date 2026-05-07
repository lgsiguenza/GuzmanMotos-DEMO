import { Component, ElementRef, Input, ViewChild, OnInit, inject } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Trabajo } from 'src/app/models/trabajo';
import { IonContent, IonButton, ModalController, IonIcon } from "@ionic/angular/standalone";
import { Utils } from 'src/app/servicios/utils';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-facturacion-modal',
  templateUrl: './facturacion-modal.component.html',
  styleUrls: ['./facturacion-modal.component.scss'],
  imports: [IonIcon, IonContent, IonButton, FormatoFechaPipe, DecimalPipe]
})
export class FacturacionModalComponent  {
  private utilSvc = inject(Utils);
  private modalCrtl = inject(ModalController);

  @Input() trabajo!: Trabajo;
  @Input({required: true}) isModal: boolean = true;

    @ViewChild('ticket', { static: false })
    ticketRef!: ElementRef;

    get total(): number {
      return this.trabajo.arreglos?.reduce(
        (acc, item) => acc + (item.costo * item.cantidad),
        0
      ) || 0;
    }

  async descargarPDF() {

    this.isModal = false;

    const carga = await this.utilSvc.loading();

    await carga.present();

    await new Promise(resolve =>
      setTimeout(resolve, 150)
    );

    const element =
    this.ticketRef.nativeElement;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF'
    });

    const imgData =
    canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth =
    pdf.internal.pageSize.getWidth();

    const imgProps =
    pdf.getImageProperties(imgData);

    const pdfHeight =
    (imgProps.height * pdfWidth)
    / imgProps.width;

    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save(`ticket-${this.trabajo.uid}.pdf`);

    this.modalCrtl.dismiss(null);
    await carga.dismiss();

    this.isModal = true;
  }
}