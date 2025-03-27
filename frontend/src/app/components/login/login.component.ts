import { Component } from '@angular/core';
import { ParticlesComponent } from '../particles/particles.component';
import {UserService} from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import {Role} from '../../models/User';
import {Router} from '@angular/router';
import {AccessControlService} from '../../services/access-control.service';
declare var particlesJS: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ParticlesComponent,FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  matricule: string = "";
  password: string = "";

  constructor(
    private userService: UserService,
    private router: Router,
    private accessControlService: AccessControlService
  ) {}

  authenticate() {
    this.userService.Login(this.matricule, this.password).subscribe({
      next: (response: any) => {
        console.log('Connexion réussie:', response);

        // Stockage du token et du rôle
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_role', response.role);
        this.accessControlService.setCurrentRole(response.role);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.redirectToRoleDashboard(response.role); // C'est ici que la redirection se passe
      },
      error: (err) => console.error('Erreur de connexion', err)
    });
  }

  private redirectToRoleDashboard(role: Role) {
    const roleRoutes = {
      [Role.SUPERUSER]: '/fichelist', // À adapter selon vos besoins
      [Role.ADMIN]: '/fichelist',
      [Role.PREPARATEUR]: '/fichelist',
      [Role.IPDF]: '/fichelist',
      [Role.IQP]: '/fichelist',
      [Role.OPERATEUR]: '/fichelist'
    };
    const route = roleRoutes[role];
    if (!route) {
      console.error(`Aucune route définie pour le rôle : ${role}`);
      this.router.navigate(['/role-error']);
      return;
    }
    this.router.navigate([route]);

  }}
