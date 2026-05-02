import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SimulationService } from '../services/simulation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { debounceTime, Observable, Subject } from 'rxjs';
import { SegmentService } from '../services/segment.service';

interface SimulationState {
  currentDate: Date;
  running: boolean;
  daysPerTick: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private destroyRef = inject(DestroyRef);
  private simulationServce = inject(SimulationService);
  private segmentService = inject(SegmentService);
  private cdr = inject(ChangeDetectorRef);

  state: SimulationState = {currentDate: new Date(), daysPerTick: 1, running: false} as SimulationState;

  private speedSubject = new Subject<number>();

  segments: any[] = [];

  lastFourUpdatedSegments: any[] = [];

  deltaFeed = signal<any[]>([]);
  private readonly MAX_FEED_SIZE = 50;

  ngOnInit(): void {
    this.listenToWebSocket();
    this.getState();
    this.getSegments();

    this.speedSubject.pipe(
      debounceTime(100)
    ).subscribe((value) => {
      this.simulationServce.updateSpeed(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.getState();
        }
      });
    });
  }

  getSegments(): void {
    this.segmentService.getForDelta().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (segments) => {
        console.log(segments);
        this.segments = segments;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  getState(): void {
    this.simulationServce.getState().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (state) => {
        this.state = state;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  listenToWebSocket(): void {
    if (this.simulationServce.ws === null) return;
    this.simulationServce.ws.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event) => {
        if (event.type == 'segment_delta') {
          this.deltaFeed.update(feed => {
            const updated = [event.data, ...feed];
            return updated.slice(0, this.MAX_FEED_SIZE);
          });

           // update member count on the matching segment
          const segment = this.segments.find(s => s.id === event.data.segmentId);
          if (segment) {
            segment._count.memberships += event.data.added.length - event.data.removed.length;
            segment.lastAdded = event.data.added.length;
            segment.lastRemoved = event.data.removed.length;
          }

          // keep last 4 updated segments at the top
          this.lastFourUpdatedSegments = [
              segment,
              ...this.lastFourUpdatedSegments.filter(s => s.id !== event.data.segmentId)
          ].slice(0, 4);
        }

        if (event.type === 'tick') {
          this.state.currentDate = new Date(event.data.simDate);
          this.cdr.detectChanges();
        }
        
        console.log(event);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  startSimulation(): Observable<any> {
    return this.simulationServce.start();
  }

  pauseSimulation(): Observable<any> {
    return this.simulationServce.stop();
  }

  simulateNextTick(): void {
    this.simulationServce.step().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  toggleSimulation(): void {
    const action = this.state.running ? this.simulationServce.stop() : this.simulationServce.start();
    action.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (state) => {
        this.state = state;
        this.cdr.detectChanges();
      }
    });
  }

  onSpeedChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.speedSubject.next(value);
  }
}
