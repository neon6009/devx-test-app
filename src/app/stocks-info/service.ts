import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import ReconnectingWebSocket from 'reconnecting-websocket';

@Injectable()
export class DataService {

    wsConnected$ = new Subject<boolean>();

    notifications$ = new Subject();

    websocket: any;

    constructor(private http: HttpClient) {}

    getData(): Observable<any> {
        return this.http.get('https://finnhub.io/api/v1/stock/symbol?exchange=US&token=bt8uisn48v6o22d1m2rg');
    }

    getMasterViewData(companyName): Observable<any> {
        return this.http.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${companyName}&token=bt8uisn48v6o22d1m2rg`);
    }

    getStockPrices(companyName, resolution?, from?, to?): Observable<any> {
        return this.http.get(`https://finnhub.io/api/v1/stock/candle?symbol=${companyName}&resolution=${resolution ? resolution : '1'}&from=${from}&to=${to}&token=bt8uisn48v6o22d1m2rg`);
    }

    getPriceTarget(companyName): Observable<any> {
      return this.http.get(`https://finnhub.io/api/v1/quote?symbol=${companyName}&token=bt8uisn48v6o22d1m2rg`);
    }

    connectWS(wsSubscription?): void {
        this.websocket = new ReconnectingWebSocket('wss://ws.finnhub.io?token=bt8uisn48v6o22d1m2rg');
        this.websocket.onopen = () => {
          console.log('[SocketService] WebSocket opened');
          this.websocket.send(wsSubscription);
        };
        this.websocket.onmessage = (e: MessageEvent) => {
          const notification = JSON.parse(e.data);
          this.notifications$.next(notification);
        };
        this.websocket.onclose = (e: any) => {
          console.log('[SocketService] WebSocket closed', e);
          this.wsConnected$.next(false);
        };
    }

    disconnectWS(): void {
        if (this.websocket) {
          this.websocket.close(1000, 'logout', { keepClosed: true, fastClose: true });
        }
    }
}
