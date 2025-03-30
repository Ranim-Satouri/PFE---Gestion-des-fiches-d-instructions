import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm.component.html',
  styleUrl: './delete-confirm.component.css'
})
export class DeleteConfirmComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() message1: string = '';
  @Input() message2: string = '';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm() {
    console.log("confirm")
    this.onConfirm.emit();
  }

  cancel() {
    console.log("cancel")
    this.onCancel.emit();
  }
}

