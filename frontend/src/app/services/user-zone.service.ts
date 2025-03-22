import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserZoneService {

  private apiUrl = 'http://localhost:8080/userZone'; // badlou ken ghalet
  constructor(private http: HttpClient) { } 
}
