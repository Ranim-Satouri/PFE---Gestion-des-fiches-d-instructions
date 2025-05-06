import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password'; // Ajoutez cette importation
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../../models/User';
import { Zone } from '../../models/Zone';
import { UserZoneService } from '../../services/user-zone.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    DialogModule,FormsModule,
    ProgressSpinnerModule,PasswordModule
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

  showPasswordInput: boolean = false; // Contrôle l'affichage du champ de mot de passe
  newPassword: string = ''; // Stocke le nouveau mot de passe
  confirmPassword: string = ''; // Stocke la confirmation du mot de passe
  passwordError: string | null = null; // Erreur pour le mot de passe
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor(private userZoneService: UserZoneService, private userService: UserService) {}

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
  onPasswordInput() {
    this.passwordError = null;
  }
  // Méthode pour ouvrir le modal
  openPasswordModal(event: Event): void {
    event.preventDefault();  // Empêche le comportement par défaut du lien
    this.isModalVisible = true;
  }

  // Méthode pour fermer le modal
  closePasswordModal(): void {
    this.isModalVisible = false;
  }
    // Méthode pour basculer l'affichage du champ de mot de passe
  togglePasswordInput() {
    this.showPasswordInput = !this.showPasswordInput;
    this.newPassword = ''; // Réinitialiser les champs
    this.confirmPassword = '';
    this.passwordError = null;
  }
  changePassword() {
    
    if (this.newPassword.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.loading = true;
    if (this.user && this.user.idUser !== undefined) {
      const idActionneur = this.user.idUser; // À remplacer par la valeur correcte
           this.userService.updatePassword(this.user.idUser, this.newPassword, idActionneur).subscribe({        next: (response) => {
          this.loading = false;
          this.showPasswordInput = false;
          this.error = response; // Affiche "Mot de passe mis à jour avec succès"
        },
        error: (err) => {
          this.loading = false;
          this.passwordError = 'Erreur lors du changement de mot de passe.';
          console.error(err);
        },
      });
    } else {
      this.passwordError = 'Utilisateur non valide ou identifiant manquant.';
    }
  }
}