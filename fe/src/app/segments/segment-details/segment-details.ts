import { Component, DestroyRef, inject, signal } from '@angular/core';
import { SegmentService } from '../../services/segment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-segment-details',
  imports: [],
  templateUrl: './segment-details.html',
  styleUrl: './segment-details.css',
})
export class SegmentDetails {
  private destroyRef = inject(DestroyRef);
  private segmentService = inject(SegmentService);
  private activatedRoute = inject(ActivatedRoute);

  loading = signal(true);

  segment: any = null;

  segmentId = '';

  users = signal<any[]>([]);

  ngOnInit(): void {
    this.getSegmentIdFromRoute();
  }

  getSegment(id: string) {
    this.loading.set(true);
    this.segmentService.getSegmentById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.segment = data;
        this.loading.set(false);
      }
    });
  }

  getSegmentIdFromRoute() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.segmentId = id;
        this.getSegment(id);
      }
    });
  }
}