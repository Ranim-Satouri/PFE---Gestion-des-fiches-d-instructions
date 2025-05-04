import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  reportUrl!: string;
  safeReportUrl!: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) { }
  
  ngOnInit(): void {
    const baseUrl = 'https://app.powerbi.com/view?r=eyJrIjoiODM2MzAzY2MtMDU4NS00MWI0LTk3NzQtZGM3OWM0NWEwNDZhIiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9';
    
    // Ajout des paramètres pour masquer tous les éléments d'interface
    const params = [
      'pageName=ReportSection',
      'navContentPaneEnabled=false',
      'filterPaneEnabled=false',
      'toolbarEnabled=false',
      'chrome=false',
      'noToolbar=true',
      'hideActionBar=true',
      'hideReportHeader=true'
    ];
    
    // Création de l'URL complète
    this.reportUrl = `${baseUrl}&${params.join('&')}`;
    
    // Sécurisation de l'URL pour Angular
    this.safeReportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.reportUrl);
  }
}