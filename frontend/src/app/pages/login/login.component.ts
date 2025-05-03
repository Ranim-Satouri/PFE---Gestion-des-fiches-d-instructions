import { Component } from '@angular/core';
import { ParticlesComponent } from '../../components/particles/particles.component';
import {UserService} from '../../services/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {AccessControlService} from '../../services/access-control.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ParticlesComponent,FormsModule,CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html', styleUrl: './login.component.css' })
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
          this.loginError = 'Erreur : aucun token reçu';
          this.router.navigate(['/login']);
          return;
        }
        localStorage.setItem('token', token);
        console.log('Token stocké:', token);  
        // Store user with groupe and permissions
        const user = response.user || {
          matricule: this.matricule,
          groupe: response.groupe
        };
        localStorage.setItem('user', JSON.stringify(user));
        console.log('User stocké:', user);
        this.redirectToGroupeDashboard(user.groupe?.nom);
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        console.log('Statut HTTP:', err.status);
        console.log('ErrorCode:', err.errorCode);
        console.log('Message:', err.message);
  
        // Utiliser err.errorCode et err.message directement
        const errorCode = err.errorCode || 'UNKNOWN';
        const errorMessage = err.message || 'Erreur inconnue';
  
        if (err.status === 401) {
          switch (errorCode) {
            case 'Matricule ou mot de passe incorrect':
              this.loginError = 'Matricule ou mot de passe incorrect';
              break;
            case 'Utilisateur non trouvé':
              this.loginError = 'Utilisateur non trouvé';
              break;
            case 'NO_GROUP':
              this.loginError = 'Aucun groupe assigné. Veuillez contacter votre administrateur.';
              this.router.navigate(['/access-denied'], {
                state: { message: 'Vous ne faites partie d\'aucun groupe' }
              });
              break;
            case 'INACTIVE':
              this.loginError = 'Compte désactivé. Veuillez contacter votre administrateur.';
              this.router.navigate(['/access-denied'], {
                state: { message: 'Votre compte est désactivé' }
              });
              break;
            default:
              this.loginError = 'Erreur d\'authentification. Veuillez réessayer.';
              console.warn('ErrorCode inattendu pour 401:', errorCode);
              break;
          }
        } else if (err.status === 404) {
          this.loginError = 'Utilisateur non trouvé';
        } else {
          this.loginError = 'Erreur inattendue. Veuillez réessayer plus tard.';
          console.error('Erreur non gérée:', errorMessage);
        }
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
'OPERATEUR': '/fichelist',
'': '/access-denied',
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
