import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface SimEvent {
  type: 'tick' | 'segment_delta' | 'simulation_state' | 'campaign_action';
  data: any;
}

@Injectable()
export class EventBusService {
    constructor() { }

    private eventEmitter = new Subject<SimEvent>();

    emit(event: SimEvent): void {
        this.eventEmitter.next(event);
    }

    stream(): Observable<SimEvent> {
        return this.eventEmitter.asObservable();
    }
}