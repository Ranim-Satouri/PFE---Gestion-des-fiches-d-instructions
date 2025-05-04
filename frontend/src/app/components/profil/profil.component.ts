import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { User } from '../../models/User';
import { UserService } from '../../services/user.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PLATFORM_ID } from '@angular/core';
import { Zone } from '../../models/Zone';
import { UserZoneService } from '../../services/user-zone.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    ProgressSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {
  visible: boolean = false;
  user: User | null = null;
  loading: boolean = true;
  error: string | null = null;
  zones !: Zone[];

  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor( private userZoneService: UserZoneService) {}

  ngOnInit(): void {
    // Chargement seulement côté client
    if (this.isBrowser) {
      this.loadUserProfile();
    } else {
      // En cas de SSR, initialiser un utilisateur vide pour éviter les erreurs
      this.loading = false;
      this.user = {} as User;
    }
  }

  showProfileDialog(userId: number): void {
    if (!this.isBrowser) return;
    
    this.loading = true;
    this.visible = true;
    
    // Récupération depuis localStorage (comme dans votre exemple)
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      try {
        this.user = JSON.parse(userFromLocalStorage);
        this.loading = false;
      } catch (error) {
        this.error = 'Erreur lors du chargement des données utilisateur';
        this.loading = false;
      }
    }
    this.userZoneService.getUserZones(this.user?.idUser!).subscribe(userZones => {
      const zones = userZones.map(zone => zone.zone);
      this.zones = zones;
      console.log(zones);
    })
  }

  loadUserProfile(): void {
    // Cette fonction peut être utilisée pour charger le profil quand accédé directement
    // via la route /profil plutôt que via le dialog
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      try {
        this.user = JSON.parse(userFromLocalStorage);
        this.loading = false;
      } catch (error) {
        this.error = 'Erreur de format dans les données utilisateur';
        this.loading = false;
      }
    } else {
      this.error = 'Aucune donnée utilisateur trouvée';
      this.loading = false;
    }
  }

  hideDialog(): void {
    this.visible = false;
  }

  isModalVisible: boolean = false;

  // Méthode pour ouvrir le modal
  openPasswordModal(event: Event): void {
    event.preventDefault();  // Empêche le comportement par défaut du lien
    this.isModalVisible = true;
  }

  // Méthode pour fermer le modal
  closePasswordModal(): void {
    this.isModalVisible = false;
  }
}