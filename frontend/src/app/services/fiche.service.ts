import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fiche } from '../models/Fiche';
import { FicheHistoryDTO } from '../models/FicheHistoryDto';
@Injectable({
  providedIn: 'root'
})
export class FicheService {
  private apiUrl = 'http://localhost:8080/fiche'; 
  constructor(private http: HttpClient) { } 
  getFicheHistory(idFiche: number): Observable<FicheHistoryDTO[]> {
    return this.http.get<FicheHistoryDTO[]>(`${this.apiUrl}/fiche-history/${idFiche}`);
  }

  addFiche(fiche: Fiche): Observable<Fiche> {
    console.log(fiche);
    if (fiche.zone) {
      return this.addFicheZone(fiche);
    } else if (fiche.ligne) {
      return this.addFicheLigne(fiche);
    } else if (fiche.operation) {
      return this.addFicheOperation(fiche);
    } else {
      throw new Error('Type de fiche inconnu');
    }
  }
  addFicheOperation(fiche: Fiche): Observable<any> {
    return this.http.post(`${this.apiUrl}/addFicheOperation`, fiche);
  }
  addFicheLigne(fiche: Fiche): Observable<any> {
    return this.http.post(`${this.apiUrl}/addFicheLigne`, fiche);
  }
  addFicheZone(fiche: Fiche): Observable<any> {
    return this.http.post(`${this.apiUrl}/addFicheZone`, fiche);
  }



  updateFiche(fiche: Fiche): Observable<Fiche> {
    if (fiche.zone) {
      return this.updateFicheZone(fiche);
    } else if (fiche.ligne) {
      return this.updateFicheLigne(fiche);
    } else if (fiche.operation) {
      return this.updateFicheOperation(fiche);
    } else {
      throw new Error('Type de fiche inconnu');
    }
  }
  updateFicheOperation(fiche: Fiche): Observable<any> {
    
    return this.http.put(`${this.apiUrl}/updateFicheOperation`, fiche);
  }
  updateFicheZone(fiche: Fiche): Observable<any> {
    
    return this.http.put(`${this.apiUrl}/updateFicheZone`, fiche);
  }
  updateFicheLigne(fiche: Fiche): Observable<any> {
    
    return this.http.put(`${this.apiUrl}/updateFicheLigne`, fiche);
  }

  getFichesByUserZones(idUser: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByUserZones/${idUser}`);
  }

  uploadPDF(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/uploadPDF`, formData);
  }

  // Méthode pour récupérer le PDF en tant que ressource
  getPdf(filename: string): Observable<Blob> {
    return this.http.get( `${this.apiUrl}/getPdf/${filename}`, { responseType: 'blob' });
  }
  getAllFiches(): Observable<Fiche[]> {
    return this.http.get<Fiche[]>(`${this.apiUrl}/getAllFiches`);
  }

  // Méthode pour supprimer une fiche
  deleteFiche(idFiche: number | undefined , idSupprimateur: number ): Observable<any> {
    const params = new HttpParams()
              .set('idActionneur',idSupprimateur)
    return this.http.put( `${this.apiUrl}/deleteFiche/${idFiche}`, null , { params }); 
  }
  
  // Méthode pour valider l'IPDF
  validationIPDF(idFiche: number | undefined, idIPDF: number, status: string, commentaire: string): Observable<any> {
    const params = new HttpParams()
      .set('status', status)
      .set('commentaire', commentaire)
      .set('idIPDF', idIPDF);

    return this.http.put(`${this.apiUrl}/validationIPDF/${idFiche}`, null, { params }); 
  }

   // Méthode pour valider l'IQP
   validationIQP(idFiche: number | undefined, idIQP: number, status: string ,  ficheAql : string , commentaire : string): Observable<any> {
    console.log(idFiche, idIQP, status);  
    const params = new HttpParams()
    .set('commentaire', commentaire)
    .set('status', status)
    .set('ficheAql', ficheAql)
    .set('idIQP', idIQP);
    return this.http.put(`${this.apiUrl}/validationIQP/${idFiche}`,null, {params});
  }

   // Récupérer les fiches par préparateur
   getFichesByPreparateur(idPreparateur: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesByPreparateur/${idPreparateur}`);
  }

  // Récupérer les fiches par ID IPDF
  getFichesByIPDF(idIPDF: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByIPDF/${idIPDF}`);
  }

  // Récupérer les fiches par ID IQP
  getFichesByIQP(idIQP: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByIQP/${idIQP}`);
  }
  getFichesByOperateur(idOperateur: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByOperateur/${idOperateur}`);
  }
  getFichesByAdmin(idAdmin: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByAdmin/${idAdmin}`);
  }
  checkFicheStatusUpdate(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/updateStatus`);
  }
  
  // Méthode pour ajouter une fiche
  // addFiche(fiche: Fiche): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/addFiche`, fiche);
  // }

  // // Méthode pour mettre à jour une fiche avec un fichier PDF
  // updateFiche(fiche: Fiche): Observable<any> {
    
  //   return this.http.put(`${this.apiUrl}/updateFicheOperation`, fiche);
  // }

  searchFichesAvancee( requete: string,situations: string[], idUser: number): Observable<Fiche[]> {
  const params = {
    requete: requete || '',
    idUser: idUser.toString(),
    situations: situations.join(',') // format "EXPIRED,PENDING"
  };

  return this.http.get<Fiche[]>(`${this.apiUrl}/search`, { params });
}

}