import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../const/const';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  
  getAllUsers(): Observable<any> {
    return this.http.get(API + 'users');
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(API + `users/${id}`);
  }

  searchUsers(query: string): Observable<any> {
    return this.http.get(API + `users/search?q=${query}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(API + 'users', userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(API + `users/${id}`);
  }
}
