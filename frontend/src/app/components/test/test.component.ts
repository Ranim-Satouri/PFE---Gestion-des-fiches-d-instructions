import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {
  form: FormGroup;
  familles: string[] = ['Électronique', 'Mécanique', 'Chimie'];
  filteredFamilles: string[] = [];
  familleSearch: string = '';
  showDropdown = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      indice: ['', Validators.required],
      reference: ['', Validators.required],
      famille: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.filteredFamilles = [...this.familles];
  }

  onFamilleSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.familleSearch = value;
    this.filteredFamilles = this.familles.filter(f =>
      f.toLowerCase().includes(value.toLowerCase())
    );
    this.showDropdown = true;
  }

  selectFamille(famille: string) {
    this.form.get('famille')?.setValue(famille);
    this.familleSearch = famille;
    this.showDropdown = false;
  }

  addFamille(value: string) {
    this.familles.push(value);
    this.selectFamille(value);
  }

  submitForm() {
    if (this.form.valid) {
      console.log('Produit:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}