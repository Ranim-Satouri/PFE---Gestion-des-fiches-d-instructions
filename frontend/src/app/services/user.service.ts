import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Genre, Role, User, UserStatus} from '../models/User';
import {map, Observable} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/user';
  private apiUrl2 = 'http://localhost:8080/api/v1/auth';
  constructor(private http: HttpClient) { }

  Login(matricule: string, password: string): Observable<User> {
    const body = { matricule, password };
    return this.http.post<{ token: string; user: User; groupe: string }>(
        `${this.apiUrl2}/authenticate`, body ).pipe(
          map(response => {
              localStorage.setItem('token', response.token);
              return response.user; // Pas besoin de mapToUser
          })
      );
  }

  Register(user: User, idActionneur: number): Observable<any> {
    const params = new HttpParams()
      .set('idCreator', idActionneur);
    return this.http.post<{ token: string, role: Role ,user : User }>(
      `${this.apiUrl2}/register`, user, { params } );
  }
  
  getAll(): Observable<User[]> {return this.http.get<User[]>(`${this.apiUrl}/getUsers`); }


updateUser(idUser:number, user:User , idActionneur:number):Observable<any>
{
  return this.http.put<User>(`${this.apiUrl}/update/${idUser}?idActionneur=${idActionneur}`, user); 
}
removeZone(idUser: number, idZone: number, idActionneur: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/retirerZoneAUser/${idUser}/${idZone}/${idActionneur}`);
}





  attribuerZone(idUser: number, idZone:number,idActionneur:number):Observable<any>
    {
   console.log("user",idUser);
   console.log("zone",idZone);
   console.log("act",idActionneur);
      return this.http.post(
    `${this.apiUrl}/attribueZone/${idUser}/${idZone}/${idActionneur}`,null)
  }

  ChangeRole(idUser: number | undefined, idActionneur: number | undefined, role : Role): Observable<any> {
    const params = new HttpParams()
      .set('newRole', role)

    return this.http.put(`${this.apiUrl}/changeRole/${idUser}/${idActionneur}`, null, { params });
  }
  ChangeStatus(idUser: number | undefined , idActionneur: number | undefined, status : UserStatus): Observable<any> {
    const params = new HttpParams()
      .set('newStatus', status)

    return this.http.put(`${this.apiUrl}/changeStatus/${idUser}/${idActionneur}`, null, { params });
  }

}
