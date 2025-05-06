import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from './components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SpinnerComponent], // ayy haja bech testa3melha fel html
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
