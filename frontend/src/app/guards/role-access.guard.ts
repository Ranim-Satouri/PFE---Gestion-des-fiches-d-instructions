import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';

@Injectable({ providedIn: 'root'})

export class RoleAccessGuard implements CanActivate {
 constructor(
   private accessControlService: AccessControlService , private router: Router) {}

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requestedPath = state.url;
console.log('Tentative d’accès à:', requestedPath);
    // Vérifier la présence du token
    const token = localStorage.getItem('token');
    console.log('Token trouvé:', token ? 'Oui' : 'Non');
    if (!token) {
      console.log('Aucun token trouvé, redirection vers login');
      this.router.navigate(['/']);
      return false;
    }

    // Vérifier si le groupe est défini
const groupe = this.accessControlService.getCurrentGroupe();
    if (!groupe) {
      console.log('Aucun groupe défini, redirection vers login');
      this.router.navigate(['/access-denied']);
      return false;
    }

    // Vérifier l'accès basé sur les permissions
    const canAccess = this.accessControlService.canAccess(requestedPath);

    console.log(`Tentative d'accès à ${requestedPath}`, {
      groupeNom: this.accessControlService.getCurrentGroupeNom(),
      authorizedPaths: this.accessControlService.getAllowedInterfaces(),
      accessGranted: canAccess
    });

    if (!canAccess) {
      console.log('Accès refusé');
      this.router.navigate(['/access-denied'],
        { state: { message: 'Accès refusé, vous etes pas autorisés' } }
       );
      return false;
    }

    return true;
  }
}