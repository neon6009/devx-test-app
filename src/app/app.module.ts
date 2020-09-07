import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  DxDataGridModule,
  DxBulletModule,
  DxTemplateModule,
  DxChartModule,
  DxSelectBoxModule,
  DxDateBoxModule} from 'devextreme-angular';

import { AppComponent } from './app.component';
import { StocksInfoComponent } from './stocks-info/stocks-info.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    StocksInfoComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    DxDataGridModule,
    DxTemplateModule,
    DxBulletModule,
    DxChartModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
