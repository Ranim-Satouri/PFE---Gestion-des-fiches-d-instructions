import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FamilleService {

  private apiUrl = 'http://localhost:8080/famille'; 
  constructor(private http: HttpClient) { } 
}
