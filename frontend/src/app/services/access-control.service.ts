// src/app/services/access-control.service.ts
import { Injectable } from '@angular/core';
import { Role } from '../models/User';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private currentRole?: Role;

  // Configuration unique des accès par rôle
  private readonly roleAccessMap: Record<Role, string[]> = {
    [Role.SUPERUSER]: ['/particles', '/form', '/admin', '/reports'],
    [Role.ADMIN]: ['/admin', '/dashboard', '/users'],
    [Role.PREPARATEUR]: ['/preparation', '/inventory'],
    [Role.IPDF]: ['/quality-control', '/defects'],
    [Role.IQP]: ['/quality-control', '/stats'],
    [Role.OPERATEUR]: ['/production', '/tasks']
  };
  setCurrentRole(role: Role): void {
    this.currentRole = role;
  }

  getAllowedInterfaces(): string[] {
    return this.currentRole ? [...this.roleAccessMap[this.currentRole]] : [];
  }

  canAccess(path: string): boolean {
    return this.getAllowedInterfaces().some(route => path.startsWith(route));

  }
  getCurrentRole(): Role | undefined {
    return this.currentRole;
  }
}
