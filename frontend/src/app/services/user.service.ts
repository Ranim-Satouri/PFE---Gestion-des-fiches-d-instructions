import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Role, User} from '../models/User';
import {Observable} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/user';
  private apiUrl2 = 'http://localhost:8080/api/v1/auth';
  constructor(private http: HttpClient) { }
  Login(email: string, password: string): Observable<any> {
    const body = { email, password }; // Envoyer email au lieu de matricule
    return this.http.post<{ token: string, role: Role }>(
      `${this.apiUrl2}/authenticate`,
      { email, password }
    );
  }

  getAll(): Observable<User[]> {
      return this.http.get<User[]>(`${this.apiUrl}/getAll`);
    }
}
