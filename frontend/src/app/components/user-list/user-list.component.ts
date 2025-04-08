import { CommonModule } from '@angular/common';
import { AfterViewInit,ChangeDetectorRef,Component,ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { forkJoin, map } from 'rxjs';
import { Role, User, UserStatus } from '../../models/User';
import { User_Zone } from '../../models/User_Zone';
import { Zone } from '../../models/Zone';
import { FilterPipe } from '../../pipes/filter.pipe';
import { UserZoneService } from '../../services/user-zone.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import { DeleteConfirmComponent } from '../delete-confirm/delete-confirm.component';
import { RegisterFormComponent } from '../register-form/register-form.component';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    RegisterFormComponent,
    DeleteConfirmComponent,
    FilterPipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements AfterViewInit, OnDestroy {
  @ViewChild('roleInput', { static: false }) roleInput?: ElementRef;
  @ViewChild('roleDropdown', { static: false }) roleDropdown?: ElementRef;
  @ViewChild('arrowButton', { static: false }) arrowButton?: ElementRef;
  @ViewChild('divFiltrage', { static: false }) divFiltrage?: ElementRef;

  private observer?: MutationObserver;

  constructor(
    private userService: UserService,
    private userZoneService: UserZoneService,
    private zoneService: ZoneService,
    private cdr: ChangeDetectorRef
  ) {}

  users: any[] = [];
  dropdownOpen: number | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  Role!: Role;
  userConnected!: User;
  dropdownPosition = { top: 0, left: 0 };

  displayAbove = false;
  UserStatus = UserStatus;
  isDeleteModelOpen: boolean = false;
  selectedUser: number | undefined;
  isFiltrageOpen: boolean = false;
  showDropdown = false;
  roles: Role[] = [];
  searchText: string = '';
  filteredRoles: Role[] = [];
  role?: Role;
  searchbar: string = '';
  isDropdownPositioned = false;
  filteredUsers: User[] = [];
  zones: Zone[] = [];
  selectedZones: number[] = [];
  selectedStatus: string = '';
  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
      this.Role = this.userConnected.role;
    }
    this.getUsers();
    this.roles = Object.values(Role);
    this.filteredRoles = this.roles;
    this.zoneService.getAll().subscribe({
      next: (zones: Zone[]) => {
        this.zones = zones;
        console.log('Zones loaded:', this.zones);
      },
      error: (error: any) => {
        console.error('Fetching zones error:', error);
      },
    });
  }
  onZonesChange() {
    console.log('Selected zones:', this.selectedZones);
    // Filter users based on selected zones
    this.filterUsersByZones();
  }

  filterUsersByZones() {
    if (this.selectedZones.length === 0) {
      this.filteredUsers = [...this.users]; // Show all users if no zones are selected
      return;
    }

    this.filteredUsers = this.users.filter((user) => {
      if (!user.zones || user.zones.length === 0) return false;
      // Check if the user has at least one zone that matches the selected zones
      return user.zones.some(
        (zone: Zone) =>
          zone.idZone !== undefined && this.selectedZones.includes(zone.idZone)
      );
    });
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
  clearFilters() {
    this.selectedZones = [];
    this.selectedStatus = '';
    this.role = undefined;
    this.searchText = '';
    this.applyFilters();
  }
  ngAfterViewInit() {
    // Set up a MutationObserver to watch for changes to divFiltrage
    if (this.divFiltrage) {
      this.observer = new MutationObserver(() => {
        if (this.showDropdown && this.isFiltrageOpen) {
          console.log(
            'MutationObserver: divFiltrage changed, adjusting dropdown position'
          );
          this.adjustDropdownPosition();
        }
      });
      this.observer.observe(this.divFiltrage.nativeElement, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    if (this.showDropdown && this.isFiltrageOpen) {
      console.log('ngAfterViewInit: Adjusting dropdown position');
      this.adjustDropdownPosition();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleFiltrage() {
    this.isFiltrageOpen = !this.isFiltrageOpen;
    console.log('isFiltrageOpen:', this.isFiltrageOpen);
    this.cdr.detectChanges(); // Force change detection to update the DOM
    if (this.showDropdown && this.isFiltrageOpen) {
      setTimeout(() => {
        console.log('toggleFiltrage: Adjusting dropdown position');
        this.adjustDropdownPosition();
      }, 100); // Increased delay to ensure DOM is fully updated
    }
  }

  adjustDropdownPosition() {
    if (!this.isFiltrageOpen) {
      console.log(
        'adjustDropdownPosition: Filtrage section is not open, skipping positioning'
      );
      return;
    }

    if (!this.arrowButton || !this.roleDropdown || !this.roleInput) {
      console.log(
        'adjustDropdownPosition: One or more elements are undefined',
        {
          arrowButton: this.arrowButton,
          roleDropdown: this.roleDropdown,
          roleInput: this.roleInput,
        }
      );
      return;
    }

    const arrow = this.arrowButton.nativeElement;
    const dropdown = this.roleDropdown.nativeElement;
    const input = this.roleInput.nativeElement;

    const arrowRect = arrow.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    console.log('Arrow button position:', arrowRect);
    console.log('Input position:', inputRect);

    if (arrowRect.top === 0 && arrowRect.left === 0) {
      console.warn(
        'adjustDropdownPosition: Arrow button is not visible in the viewport'
      );
      return;
    }

    // Position the dropdown below the SVG, but align its left edge with the input's left edge
    dropdown.style.top = `${arrowRect.bottom + window.scrollY + 4}px`;
    dropdown.style.left = `${inputRect.left + window.scrollX}px`;
    dropdown.style.width = `${inputRect.width}px`;

    console.log('Dropdown positioned at:', {
      top: dropdown.style.top,
      left: dropdown.style.left,
      width: dropdown.style.width,
    });

    // Make the dropdown visible after positioning
    this.isDropdownPositioned = true;
    this.cdr.detectChanges();
  }
  // Role filter handlers
  filterRoles() {
    if (!this.searchText) {
      this.filteredRoles = this.roles;
      return;
    }

    this.filteredRoles = this.roles.filter((r) =>
      r.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectRole(role: Role) {
    console.log('✅ Rôle sélectionné :', role);
    this.searchText = role;
    this.role = role;
    this.showDropdown = false;
    this.applyFilters();
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.filterRoles();
    this.showDropdown = true;
    if (this.isFiltrageOpen) {
      setTimeout(() => {
        console.log('onSearchChange: Adjusting dropdown position');
        this.adjustDropdownPosition();
      }, 100);
    }
  }

  applyFilters() {
    let filtered = [...this.users];

    // Filter by Zone
    if (this.selectedZones.length > 0) {
      filtered = filtered.filter((user) => {
        if (!user.zones || user.zones.length === 0) return false;
        return user.zones.some(
          (zone: Zone) =>
            zone.idZone !== undefined &&
            this.selectedZones.includes(zone.idZone)
        );
      });
    }

    // Filter by Status
    if (this.selectedStatus) {
      filtered = filtered.filter((user) => user.status === this.selectedStatus);
    }

    // Filter by Role
    if (this.role) {
      filtered = filtered.filter((user) => user.role === this.role);
    }

    this.filteredUsers = filtered;
    this.cdr.detectChanges(); // Ensure UI updates
  }

  getSelectedZoneNames(): string {
    if (this.selectedZones.length === 0) {
      return 'Sélectionner des zones';
    }
    const selected = this.zones.filter(
      (z) => z.idZone !== undefined && this.selectedZones.includes(z.idZone)
    );
    return selected.map((z) => z.nom).join(', ');
  }

  // Status filter handler
  onStatusChange() {
    this.applyFilters();
  }

  toggleDropdown2() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown && this.isFiltrageOpen) {
      this.filterRoles();
      setTimeout(() => {
        console.log('toggleDropdown2: Adjusting dropdown position');
        this.adjustDropdownPosition();
      }, 100);
    }
  }
  @HostListener('document:click', ['$event'])
  closeDropdown2(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('dropDown');
    const button = target.closest('button');

    if (
      this.showDropdown &&
      dropdown &&
      !dropdown.contains(target) &&
      !button
    ) {
      this.showDropdown = false;
    }
  }

  getUsers() {
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.users = users;
        const zoneRequests = users.map((user) =>
          this.userZoneService.getUserZones(user.idUser).pipe(
            map((zones: User_Zone[]) => {
              user.zones = zones.map((uz) => uz.zone);
              return user;
            })
          )
        );

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
      return user.zones.map((zone) => zone.nom).join(', ');
    }
    return '-';
  }

  onRoleToggleChange(user: User, event: any) {
    console.log('ken', user.role);
    if (user.role === Role.ADMIN) {
      user.role = Role.SUPERUSER;
    } else {
      user.role = Role.ADMIN;
    }

    this.userService
      .ChangeRole(
        user.idUser || undefined,
        this.userConnected.idUser || undefined,
        user.role
      )
      .subscribe({
        next: (response: any[]) => {
          console.log('Role changed successfully');
        },
        error: (error: any) => {
          console.error('changing user Role error:', error);
        },
      });
  }

  onStatusToggleChange(user: User, event: any) {
    console.log('status', user.status);
    if (user.status === UserStatus.ACTIVE) {
      user.status = UserStatus.INACTIVE;
    } else {
      user.status = UserStatus.ACTIVE;
    }
    this.ChangeUserStatus(user.idUser, user.status);
  }

  openDeleteModel(user: User) {
    this.selectedUser = user.idUser;
    this.dropdownOpen = null;
    this.isDeleteModelOpen = true;
  }

  closeDeleteModel() {
    this.selectedUser = undefined;
    this.isDeleteModelOpen = false;
  }

  ChangeUserStatus(idUser: number | undefined, status: UserStatus) {
    this.userService
      .ChangeStatus(idUser, this.userConnected.idUser, status)
      .subscribe({
        next: (response: any[]) => {
          console.log('Status changed successfully');
          this.getUsers();
        },
        error: (error: any) => {
          console.error('changing user Status error:', error);
        },
      });
    if (this.isDeleteModelOpen) {
      this.closeDeleteModel();
    }
  }

  toggleDropdown(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest('button');

    if (this.dropdownOpen === index) {
      this.dropdownOpen = null;
    } else {
      const rect = button?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 145;
        const spaceBelow = window.innerHeight - rect.bottom + 50;

        this.displayAbove = spaceBelow < dropdownHeight;

        this.dropdownPosition = {
          top: this.displayAbove
            ? rect.top + window.scrollY - dropdownHeight + 25
            : rect.bottom + window.scrollY - 25,
          left: rect.left + window.scrollX - 190 + (button?.offsetWidth || 0),
        };
      }
      this.dropdownOpen = index;
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.dropdownOpen !== null) {
      this.dropdownOpen = null;
    }
    if (this.showDropdown) {
      this.adjustDropdownPosition();
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById(
      `dropdownDots-${this.dropdownOpen}`
    );
    const button = target.closest('button[data-dropdown-toggle]');

    if (
      this.dropdownOpen !== null &&
      dropdown &&
      !dropdown.contains(target) &&
      !button
    ) {
      this.dropdownOpen = null;
    }
  }

  showForm = false;

  showRegisterForm() {
    this.showForm = true;
  }

  hideRegisterForm() {
    this.showForm = false;
    console.log('Form closed');
  }

  onUserRegistered(newUser: any) {
    this.users.unshift(newUser);
    this.hideRegisterForm();
  }
}
