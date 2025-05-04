import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Operation } from '../models/Operation';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
private apiUrl = 'http://localhost:8080/operation'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiUrl}/activeOperations`);
  }
  getOperationsByUserZones(idUser : number): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiUrl}/getOperationsByUserZones/${idUser}`);
  }
  addOperation(operation: Operation, idActionneur: number): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur)
    return this.http.post<any>(`${this.apiUrl}/addOperation`, operation , {params});
  }
  updateOperation(operation: Operation, idOperation : number | undefined , idActionneur: number ): Observable<Operation> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.put<Operation>(`${this.apiUrl}/update/${idOperation}`, operation , { params }) ;
  }
  deleteOperation(idOperation: number , idActionneur: number): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur)
    return this.http.delete(`${this.apiUrl}/delete/${idOperation}` , { params });
  }
}
