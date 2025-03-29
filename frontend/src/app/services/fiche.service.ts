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
  addFiche(fiche: Fiche, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fiche', JSON.stringify(fiche)); // Envoie l'objet fiche en JSON
    formData.append('filePDF', file, file.name); // Ajoute le fichier PDF

    return this.http.post(`${this.apiUrl}/addFiche`, formData);
  }

  // Méthode pour récupérer le PDF en tant que ressource
  getPdf(filename: string): Observable<Blob> {
    return this.http.get( `${this.apiUrl}/getPdf/${filename}`, { responseType: 'blob' });
  }
  getAllFiches(): Observable<Fiche[]> {
    return this.http.get<Fiche[]>(`${this.apiUrl}/getAllFiches`);
  }

  // Méthode pour mettre à jour une fiche avec un fichier PDF
  updateFiche(fiche: Fiche, filePDF: File): Observable<any> {
    const formData = new FormData();
    formData.append('fiche', JSON.stringify(fiche));
    formData.append('filePDF', filePDF, filePDF.name);

    return this.http.put(`${this.apiUrl}/updateFiche`, formData);
  }

  // Méthode pour supprimer une fiche
  deleteFiche(idFiche: number | undefined , idSupprimateur: number | undefined): Observable<any> {
    return this.http.put( `${this.apiUrl}/deleteFiche/${idFiche}/${idSupprimateur}`, null); 
  }
  
  // Méthode pour valider l'IPDF
  validationIPDF(idFiche: number, idIPDF: number, status: string, commentaire: string): Observable<any> {
    const params = new HttpParams()
      .set('status', status)
      .set('commentaire', commentaire);

    return this.http.put(`${this.apiUrl}/validationIPDF/${idFiche}/${idIPDF}`, null, { params }); 
  }

   // Méthode pour valider l'IQP
   validationIQP(idFiche: number, idIQP: number, status: string, ficheAQL: File): Observable<any> {
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
  getFichesSheetByIPDF(idIPDF: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByIPDF/${idIPDF}`);
  }

  // Récupérer les fiches par ID IQP
  getFichesSheetByIQP(idIQP: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFichesSheetByIQP/${idIQP}`);
  }
  
   // Méthode pour récupérer l'historique d'une fiche
   getFicheHistory(id: number): Observable<any> {
    const url = `http://localhost:8080/ficheAudit/getFicheAudit/${id}`;
    return this.http.get(url);
  }
}
