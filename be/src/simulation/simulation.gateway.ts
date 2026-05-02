import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventBusService } from './event-bus.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:4200' } })
export class SimulationGateway implements OnGatewayInit {

    constructor(private eventBus: EventBusService) {}

    @WebSocketServer()
    server!: Server;

    afterInit() {
        this.eventBus.stream().subscribe({
            next: (event) => {
                this.server.emit('simulation-event', event);
            },
            error: (err) => {
                console.warn('ERROR:', err);
            }
        })
    }
}