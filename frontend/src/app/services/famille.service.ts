import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { Famille } from '../models/Famille';
import { FamilleHistoryDTO } from '../models/FamilleHistoryDTO';
import { FamilleZonesAuditDTO } from '../models/FamilleZonesAuditDTO';

@Injectable({
  providedIn: 'root'
})
export class FamilleService {

  private apiUrl = 'http://localhost:8080/famille'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Famille[]> {
    return this.http.get<Famille[]>(`${this.apiUrl}/activeFamilies`);
  }
  deleteFamille(idFamille: number | undefined , idSupprimateur: number  ): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idSupprimateur);
      return this.http.delete( `${this.apiUrl}/delete/${idFamille}` ,  { params }); 
  }
  addFamille(famille: Famille, idActionneur: number ): Observable<Famille> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.post<Famille>(`${this.apiUrl}/addFamille`, famille ,  { params });
  }
  updateFamille(famille: Famille, idFamille : number | undefined , idActionneur: number ): Observable<Famille> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.put<Famille>(`${this.apiUrl}/update/${idFamille}`, famille , { params }) ;
  }
  addZonesToFamille(familleId: number, zoneIds: number[]) {
    const params = new HttpParams()
      .set('familleId', familleId.toString())
      .set('zoneIds', zoneIds.join(',')); 
    return this.http.post(`${this.apiUrl}/addZonesToFamille`, null, { params });
  }
//   getFamilleHistory(idFamille: number): Observable<FamilleHistoryDTO[]> {
//   return this.http.get<FamilleHistoryDTO[]>(`${this.apiUrl}/famille-history/${idFamille}`);
//   }
//   // Récupère l'audit des modifications de la table famille_zones
//   getFamilleZonesAudit(idFamille: number): Observable<FamilleZonesAuditDTO[]> {
//     return this.http.get<FamilleZonesAuditDTO[]>(`${this.apiUrl}/zones-audit/${idFamille}`);
// }
getFamilleHistory(idFamille: number): Observable<FamilleHistoryDTO[]> {
  return forkJoin({
      history: this.http.get<FamilleHistoryDTO[]>(`${this.apiUrl}/famille-history/${idFamille}`),
      zonesAudit: this.http.get<FamilleZonesAuditDTO[]>(`${this.apiUrl}/zones-audit/${idFamille}`)
  }).pipe(
      map(({ history, zonesAudit }) => {
          // Fusionner les données
          return history.map(historyEntry => {
              const auditEntry = zonesAudit.find(audit => audit.revisionNumber === historyEntry.revisionNumber);
              return {
                  ...historyEntry,
                  revisionType: auditEntry?.revisionType || 'N/A'
              };
          });
      })
  );
}
}
