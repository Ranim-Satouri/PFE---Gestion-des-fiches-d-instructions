import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) {}

  getKpis(): Observable<any> {
    return this.http.get(`${this.baseUrl}/kpis`);
  }

  getFichesByStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/fiches-by-status`);
  }

  getFicheTransitionMetrics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fiches-transitions-metrics`);
  }
}
