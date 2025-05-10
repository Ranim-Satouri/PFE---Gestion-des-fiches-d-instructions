import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../services/spinner.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent implements OnInit {
  isLoading = false;
  isTestMode = false;
  constructor(private spinnerService: SpinnerService,
    private route: ActivatedRoute) {}
  ngOnInit(): void {
    // Vérifier si la route est '/spinner'
    this.isTestMode = this.route.snapshot.url.some(segment => segment.path === 'spinner');
    //console.log('SpinnerComponent: isTestMode =', this.isTestMode);

    if (this.isTestMode) {
      // Forcer l'affichage du spinner en mode test
      this.isLoading = true;
    } else {
      // Mode global : écouter LoadingService
      this.spinnerService.isLoading$.subscribe((isLoading) => {
        //console.log('SpinnerComponent: isLoading =', isLoading);
        this.isLoading = isLoading;
      });
    }
  }
}