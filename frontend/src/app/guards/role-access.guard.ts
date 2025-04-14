import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';

@Injectable({ providedIn: 'root'})

export class RoleAccessGuard implements CanActivate {
  constructor(private accessControlService: AccessControlService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requestedPath = state.url;
    const canAccess = this.accessControlService.canAccess(requestedPath);

    console.log(`Tentative d'accès à ${requestedPath}`, {
      groupeNom: this.accessControlService.getCurrentGroupe(),
      authorizedPaths: this.accessControlService.getAllowedInterfaces(),
      accessGranted: canAccess
    });

    if (!canAccess) {
      this.router.navigate(['/access-denied']);
      return false;
    }
    return true; }
  }