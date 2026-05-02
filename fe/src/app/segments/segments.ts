import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SegmentService } from '../services/segment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-segments',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './segments.html',
  styleUrl: './segments.css',
})
export class Segments implements OnInit {
  private segmentService = inject(SegmentService);
  private destroyRef = inject(DestroyRef);

  segments = signal<any[]>([]);

  ngOnInit(): void {
    this.getSegments();
  }

  getSegments() {
    this.segmentService.getAllSegments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.segments.set(data);
        console.log(this.segments());
      },
      error: (err) => {
        console.error('Error fetching segments:', err);
      }
    })
  }

  deleteSegment(id: string) {
    if (confirm('Are you sure you want to delete this segment?')) {
      this.segmentService.deleteSegment(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.getSegments();
        },
        error: (err) => {
          console.error('Error deleting segment:', err);
        }
      });
    }
  }
}
