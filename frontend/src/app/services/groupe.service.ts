import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Groupe } from '../models/Groupe';
@Injectable({
  providedIn: 'root'
})
export class GroupeService {
  private apiUrl = 'http://localhost:8080/groupe'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(`${this.apiUrl}/activeGroupes`);
  }
  addGroupe(groupe: Groupe, idActionneur: number): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur)
    return this.http.post<any>(`${this.apiUrl}/addGroupe`, groupe , {params});
  }
  addRelationsToGroup(groupId: number, menuIds: number[], permissionIds: number[], userIds: number[]) {
    const params = new HttpParams()
      .set('groupId', groupId.toString())
      .set('menuIds', menuIds.join(','))
      .set('permissionIds', permissionIds.join(','))
      .set('userIds', userIds.join(','));
    
    return this.http.post(`${this.apiUrl}/addRelationsToGroup`, null, { params });
  }
  updateGroupe(groupe: Groupe, idGroupe : number | undefined , idActionneur: number ): Observable<Groupe> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.put<Groupe>(`${this.apiUrl}/update/${idGroupe}`, groupe , { params }) ;
  }
  deleteGroupe(idGroupe: number , idActionneur: number): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur)
    return this.http.delete(`${this.apiUrl}/delete/${idGroupe}` , { params });
  }
}
