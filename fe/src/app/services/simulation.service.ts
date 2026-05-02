import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../const/const';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {

  private http = inject(HttpClient);

  ws: Observable<any> | null = null;

  connect(): void {
    const socket = io(API);
    
    this.ws = new Observable(observer => {
      socket.on('simulation-event', (event) => {
        // console.log(event);
        observer.next(event);
      });

      socket.on('connect_error', (err) => {
        // console.log(err);
        observer.error(err);
      });

      return () => socket.disconnect();
    });
  }

  getState(): Observable<any> {
    return this.http.get(API + 'simulation');
  }

  start(): Observable<any> {
    return this.http.post(API + 'simulation/start', null);
  }

  stop(): Observable<any> {
    return this.http.post(API + 'simulation/stop', null);
  }

  step(): Observable<any> {
    return this.http.post(API + 'simulation/step', null);
  }

  updateSpeed(daysPerTick: number): Observable<any> {
    return this.http.patch(API + 'simulation/speed', {daysPerTick})
  }
}
