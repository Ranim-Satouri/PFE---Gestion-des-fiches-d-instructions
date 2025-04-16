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
    next: (user) => { // Réponse typée comme User
      console.log('Connexion réussie:', user);
      this.loginError = null;
      // Le token est déjà stocké dans localStorage par UserService
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé dans localStorage');
        this.router.navigate(['/login']);
        return;
      }

// Stockage du groupe et de l'utilisateur
const groupe = user.groupe || { nom: 'OPERATEUR', idGroupe: 6, isDeleted: false, modifieLe: new Date().toISOString() };
localStorage.setItem('groupeNom', groupe.nom); // Conserver pour la compatibilité
localStorage.setItem('groupe', JSON.stringify(groupe));
// this.accessControlService.setCurrentGroupe(groupe); // Utiliser l'objet groupe
localStorage.setItem('user', JSON.stringify(user));
this.redirectToGroupeDashboard(groupe.nom);
},
error: (err) =>{
  this.loginError = "Matricule ou mot de passe invalide";
  console.error('Erreur de connexion', err)}
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
