import { HttpClient, HttpParams } from '@angular/common/http';
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
  deleteProduit(idProduit: number | undefined, idSupprimateur: number ): Observable<any> {
    const params = new HttpParams()
              .set('idActionneur',idSupprimateur);
    return this.http.delete( `${this.apiUrl}/delete/${idProduit}`, { params });
  }

  addProduit(produit: Produit, idFamille: number, idActionneur: number): Observable<Produit> {
    const params = new HttpParams()
              .set('idActionneur',idActionneur);
    const url = `${this.apiUrl}/addProduit/${idFamille}`;
    return this.http.post<Produit>(url, produit , { params });
  }
  updateProduit(produit : Produit ,idFamille : number , idProduit : number | undefined , idActionneur: number): Observable<Produit> {
    const params = new HttpParams()
              .set('idActionneur',idActionneur)
              .set('idFamille',idFamille);
    return this.http.put<Produit>(`${this.apiUrl}/update/${idProduit}`, produit , { params }) ;
  }
}
