import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
// import { NgChartsModule } from 'ng2-charts';
// import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule , RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
  
})

export class DashboardComponent  implements OnInit{
  reportUrl!: string;
  safeReportUrl!: SafeResourceUrl;
  
 constructor(private sanitizer: DomSanitizer) { }
  
  ngOnInit(): void {
    // const baseUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMTExMzQxYmItNDI4ZC00MDViLThiOGEtMDYwOWRkN2MzZmFmIiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9';
    const baseUrl = 'https://app.powerbi.com/view?r=eyJrIjoiZTExNjBlMTMtNDMyNS00ZjNiLThlZjktOGZkMmQ2ZTM4M2ZhIiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9';
    
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
    
    this.reportUrl = `${baseUrl}&${params.join('&')}`;
    
    this.safeReportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.reportUrl);
  }
 
  
}