import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Produit } from '../models/Produit';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = 'http://localhost:8080/produit'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Produit[]> {
        return this.http.get<Produit[]>(`${this.apiUrl}/activeProducts`);
  }
  deleteProduit(idProduit: number | undefined, idSupprimateur: number | undefined): Observable<any> {
    return this.http.delete( `${this.apiUrl}/delete/${idProduit}/${idSupprimateur}`); 
  }
}
