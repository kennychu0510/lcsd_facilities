import { Component, Inject, Input } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Campsite, Venue } from 'src/types';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  type = ''
  campsites: Campsite
  centers: Venue
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: Venue | Campsite) {
    if ('waterSource' in data) {
      this.type = 'campsite'
      this.campsites = this.data as Campsite
    } else {
      this.type = 'center'
      this.centers = this.data as Venue
    }
  }
  
}
