// src/app/services/access-control.service.ts
import { Injectable } from '@angular/core';
import {Groupe} from '../models/Groupe';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private currentGroupe?: Groupe;

  // Configuration des accès par nom de groupe (chaîne)
  private readonly groupeAccessMap: Record<string, string[]> = {
    'SUPERUSER': ['userlist','/fichelist', '/dashboard'],
    'ADMIN': ['/fichelist'],
    'PREPARATEUR': ['/fichelist'],
    'IPDF': ['/fichelist'],
    'IQP': ['/fichelist'],
    'OPERATEUR': ['/fichelist']
  };

 // Définir le groupe courant
 setCurrentGroupe(groupe: Groupe): void {
  this.currentGroupe = groupe;
  }

  // Obtenir les interfaces autorisées (routes)
  getAllowedInterfaces(): string[] {
    if (!this.currentGroupe || !this.currentGroupe.nom) {
      return [];
    }
    return [...this.groupeAccessMap[this.currentGroupe.nom.toUpperCase()]];
  }

// Vérifier si l'utilisateur peut accéder au chemin
canAccess(path: string): boolean {
  return this.getAllowedInterfaces().some(route => path.startsWith(route));
}

// // Vérifier si l'utilisateur a une permission spécifique
// hasPermission(permissionNom: string): boolean {
//   if (!this.currentGroupe || !this.currentGroupe.permission) {
//     return false;
//   }
//   return this.currentGroupe.permission.some(p => p.nom === permissionNom);
// }

// // Obtenir les menus autorisés pour le groupe
// getMenus(): string[] {
//   if (!this.currentGroupe || !this.currentGroupe.menus) {
//     return [];
//   }
//   return this.currentGroupe.menus.map(m => m.nom);
// }

// Obtenir le groupe courant
getCurrentGroupe(): Groupe | undefined {
  return this.currentGroupe;
}

// Méthode temporaire pour la compatibilité avec l'ancienne logique
getCurrentGroupeNom(): string | undefined {
  return this.currentGroupe?.nom;
}
}