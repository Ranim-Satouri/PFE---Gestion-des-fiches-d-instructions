import { Component } from '@angular/core';
import { ParticlesComponent } from '../../components/particles/particles.component';
import {UserService} from '../../services/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {AccessControlService} from '../../services/access-control.service';
import { CommonModule } from '@angular/common';
declare var particlesJS: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ParticlesComponent,FormsModule,CommonModule, ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  matricule: string = "";
  password: string = "";
  loginError: string | null = null;

  constructor( private userService: UserService, private router: Router, private accessControlService: AccessControlService ) {}

  authenticate() {
    this.userService.Login(this.matricule, this.password).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.loginError = null;

        const token = response.token;
        if (!token) {
          console.error('Aucun token reçu');
          this.loginError = 'Erreur: aucun token reçu';
          this.router.navigate(['/login']);
          return;
        }
        localStorage.setItem('token', token);
        console.log('Token stocké:', token);

        // Store user with groupe and permissions
        const user = response.user || {
          matricule: this.matricule,
          groupe: response.groupe || { nom: 'OPERATEUR', permissions: [] }
        };
        localStorage.setItem('user', JSON.stringify(user));
        console.log('User stocké:', user);

        this.router.navigate(['/userlist']);
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        this.loginError = 'Échec de la connexion';
      }
    });
  }
private redirectToGroupeDashboard(groupeNom: string) {
const groupeRoutes: Record<string, string> = {
'SUPERUSER': '/userlist',
'ADMIN': '/fichelist',
'PREPARATEUR': '/fichelist',
'IPDF': '/fichelist',
'IQP': '/fichelist',
'OPERATEUR': '/fichelist'
};
const route = groupeRoutes[groupeNom];
if (!route) {
console.error(`Aucune route définie pour le groupe : ${groupeNom}`);
this.router.navigate(['/access-denied']);
return;
}
console.log('Redirection vers:', route);
this.router.navigate([route]);
}
  clearError() {
    this.loginError = null;
  }
  focusInput(input: HTMLInputElement) {
    input.focus();
  }
  
  blurInput(input: HTMLInputElement) {
    // Optionnel : si tu veux qu’il perde le focus quand la souris sort
    // input.blur();
  }
  
  }
