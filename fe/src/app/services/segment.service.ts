import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../const/const';

@Injectable({
  providedIn: 'root',
})
export class SegmentService {
  private http = inject(HttpClient);
  
  getAllSegments(): Observable<any> {
    return this.http.get(API + 'segments');
  }

  getForDelta(): Observable<any> {
    return this.http.get(API + 'segments/light');
  }

  getSegmentById(id: string): Observable<any> {
    return this.http.get(API + `segments/${id}`);
  }

  searchSegments(query: string): Observable<any> {
    return this.http.get(API + `segments/search?q=${query}`);
  }

  createSegment(segmentData: any): Observable<any> {
    return this.http.post(API + 'segments', segmentData);
  }

  updateSegment(id: string, segmentData: any): Observable<any> {
    return this.http.patch(API + `segments/${id}`, segmentData);
  }

  deleteSegment(id: string): Observable<any> {
    return this.http.delete(API + `segments/${id}`);
  }
}
