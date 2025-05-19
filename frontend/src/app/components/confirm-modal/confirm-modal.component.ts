import { ApplicationRef, Component, EventEmitter, Inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-confirm-modal', standalone: true,
  imports: [CommonModule, DialogModule,ButtonModule,], templateUrl: './confirm-modal.component.html',styleUrl: './confirm-modal.component.css'})

 export class ConfirmModalComponent {
@Output() onResult = new EventEmitter<{ success: boolean, message: string }>();
 visible: boolean = false;
 idUser: number | undefined;
  idActionneur: number | undefined;
  successMessage: string | null = null;
  errorMessage: string | null = null;

 constructor(private userService: UserService,private route: ActivatedRoute,@Inject(ApplicationRef) private appRef: ApplicationRef) {}
openConfirmModal(idUser: number | undefined, idActionneur: number | undefined): void {
    this.idUser = idUser;
    this.idActionneur = idActionneur;
    this.successMessage = null;
    this.errorMessage = null;
    this.visible = true;
  }
onResetPassword(): void {
    if (this.idUser === undefined || this.idActionneur === undefined) {
      this.errorMessage = 'Utilisateur ou actionneur non spécifié';
      this.onResult.emit({ success: false, message: this.errorMessage ?? '' }); // Émettre l'erreur
      this.visible = false;
      return;    }

    this.userService.resetPassword(this.idUser, this.idActionneur)
      .subscribe({
        next: () => {
          this.successMessage = 'Mot de passe réinitialisé avec succès ! Un email a été envoyé à l’utilisateur.';
          this.errorMessage = null;
          this.onResult.emit({ success: true, message: this.successMessage }); // Émettre le succès
          this.visible = false;
        },
        error: (err) => {
       this.errorMessage = err.message;
          this.successMessage = null;
          this.onResult.emit({ success: false, message: this.errorMessage ?? '' }); // Émettre l'erreur
          this.visible = false;
        }
      });
  }
  onCancel(): void {
    this.visible = false;
    this.successMessage = null;
    this.errorMessage = null;
  }
}