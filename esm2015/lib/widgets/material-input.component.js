import { Component, Inject, Input, Optional } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
export class MaterialInputComponent {
    constructor(matFormFieldDefaultOptions, matLabelGlobalOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.matLabelGlobalOptions = matLabelGlobalOptions;
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.autoCompleteList = [];
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    }
    updateValue(event) {
        this.jsf.updateValue(this, event.target.value);
    }
}
MaterialInputComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-input-widget',
                template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matLabelGlobalOptions?.float || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <input matInput *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [readonly]="options?.readonly ? 'readonly' : null"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [type]="layoutNode?.type"
        (blur)="options.showErrors = true">
      <input matInput *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [disabled]="controlDisabled"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [required]="options?.required"
        [style.width]="'100%'"
        [type]="layoutNode?.type"
        [value]="controlValue"
        (input)="updateValue($event)"
        (blur)="options.showErrors = true">
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
      <mat-autocomplete *ngIf="options?.typeahead?.source">
        <mat-option *ngFor="let word of options?.typeahead?.source"
          [value]="word">{{word}}</mat-option>
      </mat-autocomplete>
    </mat-form-field>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`,
                styles: [`
    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }
    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex
      .mat-form-field-infix { width: initial; }
  `]
            },] }
];
MaterialInputComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: Optional }] },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_LABEL_GLOBAL_OPTIONS,] }, { type: Optional }] },
    { type: JsonSchemaFormService }
];
MaterialInputComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtaW5wdXQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Ii9ob21lL2RuaW1vbi9Eb2N1bWVudHMvZ2l0L2NvbnZlcGF5L2Fqc2YvcHJvamVjdHMvYWpzZi1tYXRlcmlhbC9zcmMvIiwic291cmNlcyI6WyJsaWIvd2lkZ2V0cy9tYXRlcmlhbC1pbnB1dC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFVLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbEUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUErRDlFLE1BQU0sT0FBTyxzQkFBc0I7SUFhakMsWUFDNkQsMEJBQTBCLEVBQ2hDLHFCQUFxQixFQUNsRSxHQUEwQjtRQUZ5QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQUE7UUFDaEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFBO1FBQ2xFLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBWnBDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRXJCLHFCQUFnQixHQUFhLEVBQUUsQ0FBQztJQVdoQyxDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7WUFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDckQ7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQUs7UUFDZixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDOzs7WUEzRkYsU0FBUyxTQUFDO2dCQUNULDhDQUE4QztnQkFDOUMsUUFBUSxFQUFFLHVCQUF1QjtnQkFDakMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dURBbUQyQzt5QkFDNUM7Ozs7R0FJUjthQUNGOzs7NENBZUksTUFBTSxTQUFDLDhCQUE4QixjQUFHLFFBQVE7NENBQ2hELE1BQU0sU0FBQyx3QkFBd0IsY0FBRyxRQUFRO1lBaEZ0QyxxQkFBcUI7Ozt5QkF5RTNCLEtBQUs7MEJBQ0wsS0FBSzt3QkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtDb21wb25lbnQsIEluamVjdCwgSW5wdXQsIE9uSW5pdCwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5pbXBvcnQgeyBNQVRfTEFCRUxfR0xPQkFMX09QVElPTlMgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7IE1BVF9GT1JNX0ZJRUxEX0RFRkFVTFRfT1BUSU9OUyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ21hdGVyaWFsLWlucHV0LXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG1hdC1mb3JtLWZpZWxkIFthcHBlYXJhbmNlXT1cIm9wdGlvbnM/LmFwcGVhcmFuY2UgfHwgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnM/LmFwcGVhcmFuY2UgfHwgJ3N0YW5kYXJkJ1wiXG4gICAgICBbY2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCJcbiAgICAgIFtmbG9hdExhYmVsXT1cIm9wdGlvbnM/LmZsb2F0TGFiZWwgfHwgbWF0TGFiZWxHbG9iYWxPcHRpb25zPy5mbG9hdCB8fCAob3B0aW9ucz8ubm90aXRsZSA/ICduZXZlcicgOiAnYXV0bycpXCJcbiAgICAgIFtoaWRlUmVxdWlyZWRNYXJrZXJdPVwib3B0aW9ucz8uaGlkZVJlcXVpcmVkID8gJ3RydWUnIDogJ2ZhbHNlJ1wiXG4gICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCI+XG4gICAgICA8bWF0LWxhYmVsICpuZ0lmPVwiIW9wdGlvbnM/Lm5vdGl0bGVcIj57e29wdGlvbnM/LnRpdGxlfX08L21hdC1sYWJlbD5cbiAgICAgIDxzcGFuIG1hdFByZWZpeCAqbmdJZj1cIm9wdGlvbnM/LnByZWZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uTGVmdFwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8ucHJlZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25MZWZ0XCI+PC9zcGFuPlxuICAgICAgPGlucHV0IG1hdElucHV0ICpuZ0lmPVwiYm91bmRDb250cm9sXCJcbiAgICAgICAgW2Zvcm1Db250cm9sXT1cImZvcm1Db250cm9sXCJcbiAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWQgKyAnU3RhdHVzJ1wiXG4gICAgICAgIFthdHRyLmxpc3RdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ0F1dG9jb21wbGV0ZSdcIlxuICAgICAgICBbYXR0ci5tYXhsZW5ndGhdPVwib3B0aW9ucz8ubWF4TGVuZ3RoXCJcbiAgICAgICAgW2F0dHIubWlubGVuZ3RoXT1cIm9wdGlvbnM/Lm1pbkxlbmd0aFwiXG4gICAgICAgIFthdHRyLnBhdHRlcm5dPVwib3B0aW9ucz8ucGF0dGVyblwiXG4gICAgICAgIFtyZWFkb25seV09XCJvcHRpb25zPy5yZWFkb25seSA/ICdyZWFkb25seScgOiBudWxsXCJcbiAgICAgICAgW2lkXT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZFwiXG4gICAgICAgIFtuYW1lXT1cImNvbnRyb2xOYW1lXCJcbiAgICAgICAgW3BsYWNlaG9sZGVyXT1cIm9wdGlvbnM/Lm5vdGl0bGUgPyBvcHRpb25zPy5wbGFjZWhvbGRlciA6IG9wdGlvbnM/LnRpdGxlXCJcbiAgICAgICAgW3JlcXVpcmVkXT1cIm9wdGlvbnM/LnJlcXVpcmVkXCJcbiAgICAgICAgW3N0eWxlLndpZHRoXT1cIicxMDAlJ1wiXG4gICAgICAgIFt0eXBlXT1cImxheW91dE5vZGU/LnR5cGVcIlxuICAgICAgICAoYmx1cik9XCJvcHRpb25zLnNob3dFcnJvcnMgPSB0cnVlXCI+XG4gICAgICA8aW5wdXQgbWF0SW5wdXQgKm5nSWY9XCIhYm91bmRDb250cm9sXCJcbiAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWQgKyAnU3RhdHVzJ1wiXG4gICAgICAgIFthdHRyLmxpc3RdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ0F1dG9jb21wbGV0ZSdcIlxuICAgICAgICBbYXR0ci5tYXhsZW5ndGhdPVwib3B0aW9ucz8ubWF4TGVuZ3RoXCJcbiAgICAgICAgW2F0dHIubWlubGVuZ3RoXT1cIm9wdGlvbnM/Lm1pbkxlbmd0aFwiXG4gICAgICAgIFthdHRyLnBhdHRlcm5dPVwib3B0aW9ucz8ucGF0dGVyblwiXG4gICAgICAgIFtkaXNhYmxlZF09XCJjb250cm9sRGlzYWJsZWRcIlxuICAgICAgICBbaWRdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkXCJcbiAgICAgICAgW25hbWVdPVwiY29udHJvbE5hbWVcIlxuICAgICAgICBbcGxhY2Vob2xkZXJdPVwib3B0aW9ucz8ubm90aXRsZSA/IG9wdGlvbnM/LnBsYWNlaG9sZGVyIDogb3B0aW9ucz8udGl0bGVcIlxuICAgICAgICBbcmVhZG9ubHldPVwib3B0aW9ucz8ucmVhZG9ubHkgPyAncmVhZG9ubHknIDogbnVsbFwiXG4gICAgICAgIFtyZXF1aXJlZF09XCJvcHRpb25zPy5yZXF1aXJlZFwiXG4gICAgICAgIFtzdHlsZS53aWR0aF09XCInMTAwJSdcIlxuICAgICAgICBbdHlwZV09XCJsYXlvdXROb2RlPy50eXBlXCJcbiAgICAgICAgW3ZhbHVlXT1cImNvbnRyb2xWYWx1ZVwiXG4gICAgICAgIChpbnB1dCk9XCJ1cGRhdGVWYWx1ZSgkZXZlbnQpXCJcbiAgICAgICAgKGJsdXIpPVwib3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZVwiPlxuICAgICAgPHNwYW4gbWF0U3VmZml4ICpuZ0lmPVwib3B0aW9ucz8uc3VmZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25SaWdodFwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uc3VmZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25SaWdodFwiPjwvc3Bhbj5cbiAgICAgIDxtYXQtaGludCAqbmdJZj1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uICYmICghb3B0aW9ucz8uc2hvd0Vycm9ycyB8fCAhb3B0aW9ucz8uZXJyb3JNZXNzYWdlKVwiXG4gICAgICAgIGFsaWduPVwiZW5kXCIgW2lubmVySFRNTF09XCJvcHRpb25zPy5kZXNjcmlwdGlvblwiPjwvbWF0LWhpbnQ+XG4gICAgICA8bWF0LWF1dG9jb21wbGV0ZSAqbmdJZj1cIm9wdGlvbnM/LnR5cGVhaGVhZD8uc291cmNlXCI+XG4gICAgICAgIDxtYXQtb3B0aW9uICpuZ0Zvcj1cImxldCB3b3JkIG9mIG9wdGlvbnM/LnR5cGVhaGVhZD8uc291cmNlXCJcbiAgICAgICAgICBbdmFsdWVdPVwid29yZFwiPnt7d29yZH19PC9tYXQtb3B0aW9uPlxuICAgICAgPC9tYXQtYXV0b2NvbXBsZXRlPlxuICAgIDwvbWF0LWZvcm0tZmllbGQ+XG4gICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZXJyb3JNZXNzYWdlXCI+PC9tYXQtZXJyb3I+YCxcbiAgc3R5bGVzOiBbYFxuICAgIG1hdC1lcnJvciB7IGZvbnQtc2l6ZTogNzUlOyBtYXJnaW4tdG9wOiAtMXJlbTsgbWFyZ2luLWJvdHRvbTogMC41cmVtOyB9XG4gICAgOjpuZy1kZWVwIGpzb24tc2NoZW1hLWZvcm0gbWF0LWZvcm0tZmllbGQgLm1hdC1mb3JtLWZpZWxkLXdyYXBwZXIgLm1hdC1mb3JtLWZpZWxkLWZsZXhcbiAgICAgIC5tYXQtZm9ybS1maWVsZC1pbmZpeCB7IHdpZHRoOiBpbml0aWFsOyB9XG4gIGBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbElucHV0Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgZm9ybUNvbnRyb2w6IEFic3RyYWN0Q29udHJvbDtcbiAgY29udHJvbE5hbWU6IHN0cmluZztcbiAgY29udHJvbFZhbHVlOiBzdHJpbmc7XG4gIGNvbnRyb2xEaXNhYmxlZCA9IGZhbHNlO1xuICBib3VuZENvbnRyb2wgPSBmYWxzZTtcbiAgb3B0aW9uczogYW55O1xuICBhdXRvQ29tcGxldGVMaXN0OiBzdHJpbmdbXSA9IFtdO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTUFUX0ZPUk1fRklFTERfREVGQVVMVF9PUFRJT05TKSBAT3B0aW9uYWwoKSBwdWJsaWMgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnMsXG4gICAgQEluamVjdChNQVRfTEFCRUxfR0xPQkFMX09QVElPTlMpIEBPcHRpb25hbCgpIHB1YmxpYyBtYXRMYWJlbEdsb2JhbE9wdGlvbnMsXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuanNmLmluaXRpYWxpemVDb250cm9sKHRoaXMpO1xuICAgIGlmICghdGhpcy5vcHRpb25zLm5vdGl0bGUgJiYgIXRoaXMub3B0aW9ucy5kZXNjcmlwdGlvbiAmJiB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5kZXNjcmlwdGlvbiA9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcjtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWYWx1ZShldmVudCkge1xuICAgIHRoaXMuanNmLnVwZGF0ZVZhbHVlKHRoaXMsIGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH1cbn1cbiJdfQ==