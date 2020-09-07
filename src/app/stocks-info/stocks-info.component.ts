import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataService } from './service';

@Component({
  selector: 'app-stocks-info',
  templateUrl: './stocks-info.component.html',
  styleUrls: ['./stocks-info.component.scss'],
  providers: [DataService]
})
export class StocksInfoComponent implements OnInit, OnDestroy {

  dataSource: any;
  masterDetailDataSource: any;
  stockPrices: Array<any>;
  resolutions = ['1', '5', '15', '30', '60', 'D', 'W', 'M'];
  currentResolution: string;
  startDate: number;
  endDate: number;
  realTimeStocks = [{
    s: null,
    p: null,
    v: null,
    t: null
  }];
  loaded = false;

  constructor(
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startDate = 1572651390;
    this.endDate = 1572910590;
    this.currentResolution = this.resolutions[0];
    this.dataService.getData().subscribe(data => {
      this.dataSource = data.map((item, index) => {
        return {
          ID: index + 1,
          ...item
        };
      });
      this.getStockPrices(data[0].symbol, this.currentResolution, this.startDate, this.endDate);

      this.dataService.connectWS(JSON.stringify({
        type: 'subscribe',
        symbol: data[0].symbol
      }));

      this.getInitWSData(data[0]);
      this.loaded = true;
      this.cdRef.markForCheck();
    });

    this.dataService.notifications$.subscribe(wsMessage => {
      if ((wsMessage as any)?.data) {
        this.realTimeStocks = [...((wsMessage as any).data)];
      }
      this.cdRef.markForCheck();
    });
  }

  getStockPrices(companyName?: string, resolution?, from?, to?): void {
    this.dataService.getStockPrices(
      companyName ? companyName : this.masterDetailDataSource[0].ticker,
      resolution,
      from,
      to
      ).subscribe(prices => {
      const result = [];
      const keys = Object.keys(prices);
      if (prices?.t?.length) {
        for (let i = 0; i < prices.t.length; i++) {
          const priceObject = {};
          keys.forEach(key => {
            if (key === 't') {
              // @ts-ignore
              priceObject.date = new Date(prices[key][i]);
            }
            if (key !== 's' && key !== 't') {
              priceObject[key] = prices[key][i];
            }
          });
          result.push(priceObject);
        }
      }
      this.stockPrices = result;
      this.cdRef.markForCheck();
    });
  }

  getInitWSData(company): void {
    this.dataService.getPriceTarget(
      company?.symbol ? company.symbol : this.masterDetailDataSource[0].ticker).subscribe(price => {
        this.realTimeStocks = [{
          s: company.description,
          p: price.c,
          v: null,
          t: price.t
        }];
        this.cdRef.markForCheck();
    });
  }

  getMiddleValue(arrayOfPrices: Array<any>): number {
    const summ = arrayOfPrices.reduce((acc, item) => {
      acc = acc + item;
      return acc;
    }, 0);
    const middleValue = summ / arrayOfPrices.length;
    return +middleValue.toFixed(3);
  }

  contentReady(event): void {
    if (!event.component.getSelectedRowKeys().length) {
      event.component.selectRowsByIndexes(0);
    }
  }

  selectionChanged(event): void {
    event.component.collapseAll(-1);
    event.component.expandRow(event.currentSelectedRowKeys[0]);
    this.dataService.getMasterViewData(event.selectedRowsData[0].symbol).subscribe(data => {
      this.masterDetailDataSource = [data];
    });
    this.getStockPrices(event.selectedRowsData[0].symbol, this.currentResolution, this.startDate, this. endDate);
    this.getInitWSData(event.selectedRowsData[0]);
    this.dataService.disconnectWS();
    this.dataService.connectWS(JSON.stringify({
      type: 'subscribe',
      symbol: event.selectedRowsData[0].symbol === 'BTCUSDT' ? 'BINANCE:BTCUSDT' : event.selectedRowsData[0].symbol
    }));
  }

  customizeTooltip(arg): object {
    return {
        text: 'Open: $' + arg.openValue + '<br/>' +
            'Close: $' + arg.closeValue + '<br/>' +
            'High: $' + arg.highValue + '<br/>' +
            'Low: $' + arg.lowValue + '<br/>'
    };
  }

  setResolution(event): void {
    this.currentResolution = event.value;
    this.getStockPrices(null, this.currentResolution, this.startDate, this.endDate);
  }

  setDate(event, key): void {
    this[`${key}Date`] = event.value;
    this.getStockPrices(null, this.currentResolution, this.startDate, this.endDate);
  }

  getDate(unixTime): Date {
    return new Date(unixTime);
  }

  ngOnDestroy(): void {
    this.dataService.disconnectWS();
  }
}
