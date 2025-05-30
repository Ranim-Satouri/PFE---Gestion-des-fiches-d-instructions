// src/app/services/access-control.service.ts
import { Injectable } from '@angular/core';
import {Groupe} from '../models/Groupe';
import {Permission} from '../models/Permission';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private currentGroupeSubject = new BehaviorSubject<Groupe | undefined>(undefined);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);

  // Mappage des noms de menus aux routes frontend
  private readonly menuRouteMap: Record<string, string[]> = {
    'Dashboard': ['/dashboard'],
    'fiches': ['/fichelist', '/advanced'],
    'utilisateurs': ['/userlist'],
    'zones': ['/zonelist'],
    'produits': ['/produitlist'],
    'familles': ['/famillelist'],
    'groupes': ['/groupelist'],
    'lignes': ['/lignelist'],
    'operations': ['/operationlist'],
  };

  constructor() {this.restoreGroupeFromStorage();}

// Restaurer le groupe depuis localStorage
  private restoreGroupeFromStorage(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user?.groupe) {
          console.log('Restauration du groupe depuis localStorage:', user.groupe.nom);
          this.setCurrentGroupe(user.groupe);
        } else {
          console.warn('Aucun groupe trouvé dans localStorage.user');
        }
      } catch (error) {
        console.error('Erreur lors de la restauration du groupe:', error);
      }
    } else {
      console.log('Aucun utilisateur trouvé dans localStorage');
    }
  }

  setCurrentGroupe(groupe: Groupe): void {
    console.log('Définition du groupe:', groupe.nom, 'avec permissions:', groupe.permissions);
    this.currentGroupeSubject.next(groupe);
    this.permissionsSubject.next(groupe.permissions || []);
  }

  getCurrentGroupe(): Groupe | undefined {
    return this.currentGroupeSubject.value;
  }

  getCurrentGroupeNom(): string | undefined {
    return this.currentGroupeSubject.value?.nom;
  }

  getPermissions(): Permission[] {
    return this.permissionsSubject.value;
  }

  getAllowedInterfaces(): string[] {
    const permissions = this.getPermissions();
    if (!permissions.length) {
      console.warn('Aucune permission chargée, interfaces autorisées vides');
      return [];
    }

    const routes = new Set<string>();
    permissions.forEach(p => {
      const menuName = p.menu?.nom;
      const mappedRoutes = this.menuRouteMap[menuName];
      if (mappedRoutes && Array.isArray(mappedRoutes)) {
        mappedRoutes.forEach(route => routes.add(route));
      }
    });

    const allowedRoutes = Array.from(routes);
    console.log('Interfaces autorisées calculées:', allowedRoutes);
    return allowedRoutes;
  }

  canAccess(path: string): boolean {
    const allowedInterfaces = this.getAllowedInterfaces();
    const normalizedPath = '/' + path.replace(/^\/+|\/+$/g, '');
    const canAccess = allowedInterfaces.some(route => normalizedPath.startsWith(route));
    console.log(`Vérification d'accès pour ${path} (normalisé: ${normalizedPath}):`, {
      allowedInterfaces,
      canAccess
    });
    return canAccess;
  }

  hasPermission(permissionNom: string): boolean {
    const permissions = this.getPermissions();
    const hasPerm = permissions.some(p => p.nom === permissionNom);
    console.log(`Vérification permission ${permissionNom}:`, hasPerm);
    return hasPerm;
  }
}
