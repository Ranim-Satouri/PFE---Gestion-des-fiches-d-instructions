import { Directive,Input, TemplateRef, ViewContainerRef} from '@angular/core';
import { AccessControlService } from './services/access-control.service';
@Directive({
  selector: '[appHasPermissionDirective]',
  standalone: true
})
export class HasPermissionDirective {
private permission: string | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessControlService: AccessControlService
  ) {}

  @Input() set appHasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  private updateView() {
    if (this.permission && this.accessControlService.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}