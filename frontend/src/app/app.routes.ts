import { Routes } from '@angular/router';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { RegisterFormComponent } from './components/add/register-form/register-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FamilleHistoryComponent } from './components/History/famille-history/famille-history.component';
import { UserHistoryComponent } from './components/History/user-history/user-history.component';
import { ZoneHistoryComponent } from './components/History/zone-history/zone-history.component';
import { FamilleListComponent } from './components/lists/famille-list/famille-list.component';
import { FicheListComponent } from './components/lists/fiche-list/fiche-list.component';
import { GroupeListComponent } from './components/lists/groupe-list/groupe-list.component';
import { LigneListComponent } from './components/lists/ligne-list/ligne-list.component';
import { OperationListComponent } from './components/lists/operation-list/operation-list.component';
import { ProduitListComponent } from './components/lists/produit-list/produit-list.component';
import { UserListComponent } from './components/lists/user-list/user-list.component';
import { ZoneListComponent } from './components/lists/zone-list/zone-list.component';
import { ParticlesComponent } from './components/particles/particles.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { RoleAccessGuard } from './guards/role-access.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
export const routes: Routes = [
    { path: '', component: LoginComponent},
    { path : 'history/:idUser', component: UserHistoryComponent,canActivate: [RoleAccessGuard]  },
    {path : "zone-history/:idZone", component : ZoneHistoryComponent ,canActivate: [RoleAccessGuard] },
    {path : "famille-history/:idFamille", component : FamilleHistoryComponent ,canActivate: [RoleAccessGuard] },
    {path : 'spinner', component: SpinnerComponent},
    {
      path:'particles' ,
      component :ParticlesComponent,
      // canActivate: [RoleAccessGuard]
    },
    {
      path: 'access-denied',
      component: AccessDeniedComponent
    },
  {
    path: 'form',
    component: RegisterFormComponent ,canActivate: [RoleAccessGuard] 
  },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [RoleAccessGuard],
        children: [
            { path: 'fichelist', component: FicheListComponent },
            { path: 'famillelist', component: FamilleListComponent },
            { path: 'zonelist', component: ZoneListComponent },
            { path: 'produitlist', component: ProduitListComponent},
            { path: 'userlist', component: UserListComponent},
            { path: 'groupelist', component: GroupeListComponent },
            { path: 'lignelist', component: LigneListComponent },
            { path: 'operationlist', component: OperationListComponent},
            { path: 'dashboard', component: DashboardComponent }
        ]
    },
    {
      path: '**',
      redirectTo: 'access-denied'
    }
];
