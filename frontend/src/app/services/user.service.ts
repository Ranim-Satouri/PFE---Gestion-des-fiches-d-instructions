import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError, tap } from 'rxjs';
import { Role, User, UserStatus } from '../models/User';
import { UserHistoryDTO } from '../models/UserHistoryDTO';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/user';
  private apiUrl2 = 'http://localhost:8080/api/v1/auth';
  constructor(private http: HttpClient) { }
  
  getUserHistory(idUser: number): Observable<UserHistoryDTO[]> {
    console.log("Appel de getUserHistory avec idUser:", idUser);
    return this.http.get<UserHistoryDTO[]>(`${this.apiUrl}/history/${idUser}`).pipe(
      map((history: UserHistoryDTO[]) => {
        return history.map(entry => ({
          ...entry,
          revisionDate: new Date(entry.revisionDate),
          modifieLe: entry.modifieLe ? new Date(entry.modifieLe) : new Date(0)
        }));
      }),
      tap(history => console.log('Historique chargé pour idUser:', idUser, history)),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
     


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
    return this.http.post<{ token: string; user: User; groupe: string }>(
      `${this.apiUrl2}/register`, user, { params } );
  }
  
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/getUsers`); 
  }
  
  attribuerGroupe(idUser: number, idGroupe: number, idActionneur: number): Observable<any>
  {
    console.log("user",idUser);
    console.log("Grp",idGroupe);
    console.log("act",idActionneur);
  return this.http.put<User>
  (`${this.apiUrl}/attribuer-groupe/${idUser}?idGroupe=${idGroupe}&idActionneur=${idActionneur}`, null);

  }

updateUser(idUser:number, user:User , idActionneur:number):Observable<any>
{
  return this.http.put<User>(`${this.apiUrl}/update/${idUser}?idActionneur=${idActionneur}`, user); 
}
removeZone(idUser: number, idZone: number, idActionneur: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/retirerZoneAUser/${idUser}/${idZone}/${idActionneur}`);
}

//  getZoneUsers(idZone: number): Observable<User_Zone[]> {
//     return this.http.get<User_Zone[]>(`${this.apiUrl2}/zone-users/${idZone}`);
//   }



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
