import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { FicheListComponent } from './components/fiche-list/fiche-list.component';
import { LayoutComponent } from './layout/layout.component';
import {LoginComponent} from './pages/login/login.component';
import {ParticlesComponent} from './components/particles/particles.component';
import { RoleAccessGuard } from './guards/role-access.guard';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { FamilleListComponent } from './components/famille-list/famille-list.component';
import { ZoneListComponent } from './components/zone-list/zone-list.component';
import { ProduitListComponent } from './components/produit-list/produit-list.component';
import {RegisterFormComponent} from './components/register-form/register-form.component';
import {FicheFormComponent} from './components/fiche-form/fiche-form.component';
import { AddProduitFormComponent } from './components/add-produit-form/add-produit-form.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
  { path: 'form' , component:RegisterFormComponent},
  { path: 'ficheForm' , component:FicheFormComponent},
  { path: 'produitForm' , component:AddProduitFormComponent},

  { path: '', component: LoginComponent },
    { path: 'form', component: FormComponent},
    {
      path: 'form',
      component: FormComponent,
      canActivate: [RoleAccessGuard]
    },
    { path: 'login' , component:LoginComponent},
    {
      path:'particles' ,
      component :ParticlesComponent,
      canActivate: [RoleAccessGuard]
    },
    {
      path: 'access-denied',
      component: AccessDeniedComponent
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'fichelist', component: FicheListComponent},
            { path: 'famillelist', component: FamilleListComponent },
            { path: 'zonelist', component: ZoneListComponent },
            { path: 'produitlist', component: ProduitListComponent },
            { path: 'userlist', component: UserListComponent }
        ]
    },
    {
      path: '**',
      redirectTo: 'access-denied'
    }
];
