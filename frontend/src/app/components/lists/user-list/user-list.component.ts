import { CommonModule } from '@angular/common';
import {ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { forkJoin, map } from 'rxjs';
import { Role, User, UserStatus } from '../../../models/User';
import { User_Zone } from '../../../models/User_Zone';
import { Zone } from '../../../models/Zone';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { UserZoneService } from '../../../services/user-zone.service';
import { UserService } from '../../../services/user.service';
import { ZoneService } from '../../../services/zone.service';
import { DeleteConfirmComponent } from '../../delete-confirm/delete-confirm.component';
import { RegisterFormComponent } from '../../add/register-form/register-form.component';
import { GroupeService } from '../../../services/groupe.service';
import { Groupe } from '../../../models/Groupe';
@Component({selector: 'app-user-list', standalone: true,
  imports: [NgxPaginationModule, CommonModule, FormsModule, RegisterFormComponent, DeleteConfirmComponent,FilterPipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'})
export class UserListComponent implements  OnDestroy {
  @ViewChild('groupeInput', { static: false }) groupeInput?: ElementRef;
  @ViewChild('groupeDropdown', { static: false }) groupeDropdown?: ElementRef;
  @ViewChild('grpArrowButton', { static: false }) grpArrowButton?: ElementRef;
  @ViewChild('zoneToggleButton', { static: false }) zoneToggleButton?: ElementRef;
  @ViewChild('zoneDropdown', { static: false }) zoneDropdown?: ElementRef;

  private observer?: MutationObserver;

  constructor( private userService: UserService, private userZoneService: UserZoneService, private zoneService: ZoneService, private groupeService: GroupeService ,private cdr: ChangeDetectorRef ) {}

  users: any[] = []; dropdownOpen: number | null = null; page: number = 1;
  itemsPerPage: number = 5;
  Role!: Role;
  userConnected!: User;
  dropdownPosition = { top: 0, left: 0 };
  displayAbove = false;
  UserStatus = UserStatus;
  isDeleteModelOpen: boolean = false;
  selectedUser!: User | null;
  searchText: string = '';
  role?: Role;
  searchbar: string = '';
  filteredUsers: User[] = [];
  zones: Zone[] = [];
  selectedZones: number[] = [];
  selectedStatus: string = '';
  // les groupes
    groupes: Groupe[] = [];
    selectedGroupe: Groupe | null | undefined;
    filteredGroupes: Groupe[] = [];
    isGrpDropdownPositioned = false;
    showGrpDropdown = false;
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
      this.Role=this.userConnected.role;
      this.loadGroupes();
     }
    this.getUsers();
    this.zoneService.getAll().subscribe({
      next: (zones: Zone[]) => {
        this.zones = zones;
        console.log('Zones loaded:', this.zones);},
      error: (error: any) => { console.error('Fetching zones error:', error) ; },});
    }
loadGroupes() {
  this.groupeService.getAll().subscribe({
    next: (groupes) => {
      this.groupes = groupes;
      this.filteredGroupes = this.groupes;
      console.log('Groupes chargés depuis le backend:', this.groupes);
}, error: (error) => { console.error('Erreur lors du chargement des groupes:', error);}}); }

//essay dropdown Grouuuuuuuuupe
toggleGrpDropdown() {
  this.showGrpDropdown = !this.showGrpDropdown;
  if (this.showGrpDropdown) {
    this.filterGroupes();
    setTimeout(() => {
      console.log('toggleFamilleDropdown: Adjusting dropdown position');
      this.adjustGrpDropdownPosition();}, 100); }
   }

adjustGrpDropdownPosition() {
  if (!this.grpArrowButton || !this.groupeDropdown || !this.groupeInput) {
    console.log('adjustFamilleDropdownPosition: One or more elements are undefined', {
     grpArrowButton: this.grpArrowButton,
     groupeDropdown: this.groupeDropdown,
      groupeInput: this.groupeInput,
    });
    return;
  }
  const arrow = this.grpArrowButton.nativeElement;
  const input = this.groupeInput.nativeElement;
  const arrowRect = arrow.getBoundingClientRect();
  const inputRect = input.getBoundingClientRect();

  console.log('Arrow button position:', arrowRect);
  console.log('Input position:', inputRect);

  if (arrowRect.top === 0 && arrowRect.left === 0) {
    console.warn(
      'adjustFamilleDropdownPosition: Arrow button is not visible in the viewport');
    return;
  }
  this.isGrpDropdownPositioned = true;
  this.cdr.detectChanges();
}
  zoneDropdownOpen = false;
  toggleZoneDropdown() {
    this.zoneDropdownOpen = !this.zoneDropdownOpen;
  }
  onCheckboxChange(event: any) {
    const value = +event.target.value;
    if (event.target.checked) {
      if (!this.selectedZones.includes(value)) {
        this.selectedZones.push(value);
      }
    } else {
      this.selectedZones = this.selectedZones.filter((z) => z !== value);
    }
    this.applyFilters();
  }
  clearFilters() {  this.selectedZones = [];
                    this.selectedStatus = '';
                    this.selectedGroupe = null;
                    this.searchText = '';
                    this.applyFilters();
                  }
  ngOnDestroy() { if (this.observer) {this.observer.disconnect();}}

  applyFilters() {
    let filtered = [...this.users];
    // Filter by Zone
    if (this.selectedZones.length > 0) {
      filtered = filtered.filter((user) => {
        if (!user.zones || user.zones.length === 0) return false;
        return user.zones.some(
          (zone: Zone) =>
            zone.idZone !== undefined &&
            this.selectedZones.includes(zone.idZone));});}
    // Filter by Status
    if (this.selectedStatus) {
      filtered = filtered.filter((user) => user.status === this.selectedStatus);
    }

    // Filter by Groupe
    if (this.selectedGroupe) {
      filtered = filtered.filter(
        (user) => user.groupe?.idGroupe === this.selectedGroupe?.idGroupe);
    }
    this.filteredUsers = filtered;
    this.cdr.detectChanges();
  }
  // Groupe filter handlers
  filterGroupes() {
    if (!this.searchText) {
      this.filteredGroupes = this.groupes;
      return;
    }
    this.filteredGroupes = this.groupes.filter((groupe) =>
      groupe.nom?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  selectGroupe(groupe: Groupe) {
    console.log('✅ Groupe sélectionné :', groupe);
    this.searchText = groupe.nom;
    this.selectedGroupe = groupe;
    this.showGrpDropdown = false;
    this.applyFilters();
  }
  onGroupeSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.filterGroupes();
    this.showGrpDropdown = true;
    setTimeout(() => {
      console.log('onGroupeSearchChange: Adjusting dropdown position');
      this.adjustGrpDropdownPosition();
    }, 0); // Reduced delay for faster response
  }

  getSelectedZoneNames(): string {
    if (this.selectedZones.length === 0) {
      return 'Sélectionner des zones';
    }
    const selected = this.zones.filter(
      (z) => z.idZone !== undefined && this.selectedZones.includes(z.idZone)
    ); return selected.map((z) => z.nom).join(', ');}
  // Status filter handler
  onStatusChange() {this.applyFilters(); }
  openUpdateForm(user: User) {
    this.selectedUser=user;
    this.showForm = true;
    }
    closeRegisterForm() {
      this.hideRegisterForm();
      this.selectedUser=null;
    }
    onUserUpdated() {
      this.getUsers(); // Refresh the user list after update
      this.closeRegisterForm();
    }
  getUsers() {
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.users = users.sort((a, b) => b.idUser! - a.idUser!);  // ligne hedhy bech yjiw sorted bel le plus recent

        // Créer un tableau d'observables pour récupérer les zones de chaque utilisateur
        const zoneRequests = users.map(user =>
          this.userZoneService.getUserZones(user.idUser).pipe(
            // Assigner les zones à l'utilisateur correspondant
            map((zones: User_Zone[]) => {
              user.zones = zones.map(uz => uz.zone);
              return user;
            })
          )
        );
        // Exécuter toutes les requêtes en parallèle et mettre à jour this.users une fois terminé
        forkJoin(zoneRequests).subscribe({
          next: (updatedUsers: User[]) => {
            this.users = updatedUsers;
            this.filteredUsers = [...this.users]; // Initialize filteredUsers
            this.applyFilters();
            console.log(this.users);
          },
          error: (error: any) => {
            console.error('Fetching user zones error:', error);
          },
        });
      },
      error: (error: any) => {
        console.error('Fetching users error:', error);
      },
    });
  }
  getZoneNames(user: User): string {
    if (user.zones && user.zones.length > 0) {
      return user.zones.map(zone => zone.nom).join(', ');
    }
    return '-'; // Default message if no zones
  }
  onRoleToggleChange(user: User, event: any) {
    console.log("ken",user.role);

    if(user.role === Role.ADMIN){
      user.role = Role.SUPERUSER;
    }else{
      user.role = Role.ADMIN;
    }

    this.userService.ChangeRole(user.idUser || undefined , this.userConnected.idUser || undefined , user.role).subscribe({
      next : (response :any[]) => {
        console.log('Role changed successuly'); },
      error : (error : any) => {console.error('changing user Role error:', error);
      }
    });
  }
  onStatusToggleChange(user: User, event: any) {
      console.log("status", user.status);
      if(user.status === UserStatus.ACTIVE){
        user.status = UserStatus.INACTIVE
      }else{
        user.status = UserStatus.ACTIVE
      }
     this.ChangeUserStatus(user.idUser,user.status)
  }
  openDeleteModel(user : User){
      this.selectedUser = user;
      this.dropdownOpen = null;
      this.isDeleteModelOpen = true;
    }
  closeDeleteModel(){
    this.isDeleteModelOpen = false;

  }
  ChangeUserStatus(idUser : number | undefined , status : UserStatus){
    this.userService.ChangeStatus(idUser , this.userConnected.idUser , status).subscribe({
      next : (response :any[]) => {
        console.log('Status changed successuly  ');
        this.getUsers();
      },
      error : (error : any) => {
        console.error('changing user Status error:', error);
      }
    });
    if(this.isDeleteModelOpen){ this.closeDeleteModel()}
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 145; // kol ma nbaddelou nzidou walla na9sou haja fel drop down lezem nbadlou height ta3 lenna
        const spaceBelow = window.innerHeight - rect.bottom + 50;   // lenna a partir men 9adeh bedhabet ywali yaffichi el fou9

        this.displayAbove = spaceBelow < dropdownHeight;

        this.dropdownPosition = {
          top: this.displayAbove
            ? rect.top + window.scrollY - dropdownHeight + 25
            : rect.bottom + window.scrollY - 25,
          left: rect.left + window.scrollX - 190 + (button?.offsetWidth || 0),
        };
      } this.dropdownOpen = index; }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.dropdownOpen !== null) {
      this.dropdownOpen = null;  }
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(`dropdownDots-${this.dropdownOpen}`);
    const button = target.closest('button[data-dropdown-toggle]');

    // Vérifiez si le clic est en dehors du dropdown et du bouton
    if (this.dropdownOpen !== null && dropdown && !dropdown.contains(target) && !button) {
      this.dropdownOpen = null;  }
    // Logique pour le dropdown du groupe
      const clickedInsideInput = this.groupeInput?.nativeElement.contains(target);
      const clickedInsideArrow = this.grpArrowButton?.nativeElement.contains(target);
      const clickedInsideGrpDropdown = this.groupeDropdown?.nativeElement.contains(target);

      if (
        this.showGrpDropdown &&
        !clickedInsideInput &&
        !clickedInsideArrow &&
        !clickedInsideGrpDropdown
      ) {
        this.showGrpDropdown = false;
        this.isGrpDropdownPositioned = false;
        this.cdr.detectChanges();
      }
         // Logique pour le dropdown des zones
  const clickedInsideZoneToggle = this.zoneToggleButton?.nativeElement.contains(target);
  const clickedInsideZoneDropdown = this.zoneDropdown?.nativeElement.contains(target);
  if (
    this.zoneDropdownOpen &&
    !clickedInsideZoneToggle &&
    !clickedInsideZoneDropdown
  ) {
    this.zoneDropdownOpen = false;
    this.cdr.detectChanges();
  }
  }
  showForm = false;
  showRegisterForm() {this.showForm = true;}
  hideRegisterForm() {
    this.getUsers();
    this.showForm = false;
  }
  onUserRegistered(newUser: any) {
    // Ajoutez le nouvel utilisateur à votre liste
    this.users.unshift(newUser);
    this.hideRegisterForm();
  }
  isDescending: boolean = true;
  sortByDate() {
    this.isDescending = !this.isDescending; // Alterner entre croissant et décroissant
    console.log('isDescending:', this.isDescending);
    this.filteredUsers.sort((a, b) => {
      // Comparaison des dates
      const dateA = new Date(a.modifieLe!);
      const dateB = new Date(b.modifieLe!);
      return this.isDescending
        ? dateB.getTime() - dateA.getTime()  // Tri décroissant
        : dateA.getTime() - dateB.getTime();  // Tri croissant
    });
  }}
