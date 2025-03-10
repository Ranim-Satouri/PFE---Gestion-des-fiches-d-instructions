import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

//ng g s services/test

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private apiUrl = 'http://localhost:3000/users'; 
  constructor(private http: HttpClient) { }  
  
  //remplacer tous les any par des types précis.
  // en general l'id est un path variable et les autres parametres sont des query params

  // 🔵 GET : Récupérer des données
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  // parametres
  getUserByName(firstName : string , lastName : string): Observable<User> {
    const params = new HttpParams()
      .set('firstName', firstName)
      .set('lastName', lastName);
    return this.http.get<User>(`${this.apiUrl}/getUserByName`,{params}); //https://localhost:3000/users/getUserByName?firstName=John&lastName=Doe Angular s'occupe d'ajouter les paramètres correctement à l'URL. recommandé
  }
  

  // 🟢 POST : Ajouter une nouvelle donnée
  addUser(userData: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addUser`, userData);
  }

  // 🟡 PUT : Modifier une donnée existante
  updateUser(updatedData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updateUser`, updatedData);
  }

  // 🔴 DELETE : Supprimer une donnée
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteUser/${id}`); // path variables
  }

}
