import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fiche } from '../models/Fiche';

@Injectable({
  providedIn: 'root'
})
export class FicheService {
  private apiUrl = 'http://localhost:8080/fiche'; 
  constructor(private http: HttpClient) { } 
  
   // Méthode pour ajouter une fiche
  addFiche(fiche: Fiche): Observable<any> {
    // const formData = new FormData();
    // formData.append('fiche', JSON.stringify(fiche)); // Envoie l'objet fiche en JSON
    // formData.append('filePDF', file, file.name); // Ajoute le fichier PDF

    return this.http.post(`${this.apiUrl}/addFiche`, fiche);
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

  // Méthode pour mettre à jour une fiche avec un fichier PDF
  updateFiche(fiche: Fiche): Observable<any> {
    
    return this.http.put(`${this.apiUrl}/updateFiche`, fiche);
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
   validationIQP(idFiche: number | undefined, idIQP: number, status: string, ficheAQL: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('ficheAQL', ficheAQL);
    formData.append('status', status);

    return this.http.put(`${this.apiUrl}/validationIQP/${idFiche}/${idIQP}`, formData);
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
  
   // Méthode pour récupérer l'historique d'une fiche
   getFicheHistory(id: number): Observable<any> {
    const url = `http://localhost:8080/ficheAudit/getFicheAudit/${id}`;
    return this.http.get(url);
  }
}
