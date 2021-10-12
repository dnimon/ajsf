import { __awaiter } from "tslib";
import { Component, Inject, Input, ViewChild } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { Optional } from '@angular/core';
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
const ɵ0 = toBase64;
export class MaterialFileComponent {
    constructor(jsf, matFormFieldDefaultOptions) {
        this.jsf = jsf;
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.controlDisabled = false;
        this.boundControl = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
    }
    updateValue(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.target && event.target.files && event.target.files.length) {
                const base64String = yield toBase64(event.target.files[0]);
                this.formControl.setValue(base64String);
            }
            else {
                this.formControl.setValue(null);
            }
        });
    }
}
MaterialFileComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-file-widget',
                template: `<mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
                    [class]="options?.htmlClass || ''"
                    [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
                    [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
                    [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <ngx-mat-file-input [tabindex]="options?.tabindex ? options?.tabindex : 0" #fileInput (change)="updateValue($event);options.showErrors = true" [required]="options?.required" (blur)="options.showErrors = true"
        >
      </ngx-mat-file-input>
      <button mat-icon-button matSuffix *ngIf="!fileInput.empty" (click)="fileInput.clear($event);updateValue($event)" style='cursor:pointer;'>
        <mat-icon>clear</mat-icon>
      </button>
      <mat-icon matSuffix *ngIf="fileInput.empty" style='cursor:pointer'>folder</mat-icon>
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
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
MaterialFileComponent.ctorParameters = () => [
    { type: JsonSchemaFormService },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: Optional }] }
];
MaterialFileComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }],
    fileInput: [{ type: ViewChild, args: ['fileInput',] }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZmlsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1maWxlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFVLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV6QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7SUFDaEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQzs7QUFpQ0gsTUFBTSxPQUFPLHFCQUFxQjtJQVloQyxZQUNVLEdBQTBCLEVBQ3lCLDBCQUEwQjtRQUQ3RSxRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQUN5QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQUE7UUFWdkYsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDeEIsaUJBQVksR0FBRyxLQUFLLENBQUM7SUFVakIsQ0FBQztJQUVMLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFSyxXQUFXLENBQUMsS0FBSzs7WUFDckIsSUFBRyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDbEUsTUFBTSxZQUFZLEdBQUcsTUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDekM7aUJBQ0k7Z0JBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakM7UUFDSCxDQUFDO0tBQUE7OztZQTdERixTQUFTLFNBQUM7Z0JBQ1QsOENBQThDO2dCQUM5QyxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1REFxQjJDO3lCQUMzQzs7OztHQUlUO2FBQ0Y7OztZQXpDUSxxQkFBcUI7NENBd0R6QixNQUFNLFNBQUMsOEJBQThCLGNBQUcsUUFBUTs7O3lCQVBsRCxLQUFLOzBCQUNMLEtBQUs7d0JBQ0wsS0FBSzt3QkFDTCxTQUFTLFNBQUMsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0LCBJbnB1dCwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJ0BhanNmL2NvcmUnO1xuaW1wb3J0IHsgTUFUX0ZPUk1fRklFTERfREVGQVVMVF9PUFRJT05TIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZCc7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5jb25zdCB0b0Jhc2U2NCA9IGZpbGUgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgcmVhZGVyLm9ubG9hZCA9ICgpID0+IHJlc29sdmUocmVhZGVyLnJlc3VsdCk7XG4gIHJlYWRlci5vbmVycm9yID0gZXJyb3IgPT4gcmVqZWN0KGVycm9yKTtcbn0pO1xuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ21hdGVyaWFsLWZpbGUtd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGA8bWF0LWZvcm0tZmllbGQgW2FwcGVhcmFuY2VdPVwib3B0aW9ucz8uYXBwZWFyYW5jZSB8fCBtYXRGb3JtRmllbGREZWZhdWx0T3B0aW9ucz8uYXBwZWFyYW5jZSB8fCAnc3RhbmRhcmQnXCJcbiAgICAgICAgICAgICAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICAgICAgICAgICAgICAgIFtmbG9hdExhYmVsXT1cIm9wdGlvbnM/LmZsb2F0TGFiZWwgfHwgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnM/LmZsb2F0TGFiZWwgfHwgKG9wdGlvbnM/Lm5vdGl0bGUgPyAnbmV2ZXInIDogJ2F1dG8nKVwiXG4gICAgICAgICAgICAgICAgICAgIFtoaWRlUmVxdWlyZWRNYXJrZXJdPVwib3B0aW9ucz8uaGlkZVJlcXVpcmVkID8gJ3RydWUnIDogJ2ZhbHNlJ1wiXG4gICAgICAgICAgICAgICAgICAgIFtzdHlsZS53aWR0aF09XCInMTAwJSdcIj5cbiAgICAgIDxtYXQtbGFiZWwgKm5nSWY9XCIhb3B0aW9ucz8ubm90aXRsZVwiPnt7b3B0aW9ucz8udGl0bGV9fTwvbWF0LWxhYmVsPlxuICAgICAgPHNwYW4gbWF0UHJlZml4ICpuZ0lmPVwib3B0aW9ucz8ucHJlZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25MZWZ0XCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5wcmVmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvbkxlZnRcIj48L3NwYW4+XG4gICAgICA8bmd4LW1hdC1maWxlLWlucHV0IFt0YWJpbmRleF09XCJvcHRpb25zPy50YWJpbmRleCA/IG9wdGlvbnM/LnRhYmluZGV4IDogMFwiICNmaWxlSW5wdXQgKGNoYW5nZSk9XCJ1cGRhdGVWYWx1ZSgkZXZlbnQpO29wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWVcIiBbcmVxdWlyZWRdPVwib3B0aW9ucz8ucmVxdWlyZWRcIiAoYmx1cik9XCJvcHRpb25zLnNob3dFcnJvcnMgPSB0cnVlXCJcbiAgICAgICAgPlxuICAgICAgPC9uZ3gtbWF0LWZpbGUtaW5wdXQ+XG4gICAgICA8YnV0dG9uIG1hdC1pY29uLWJ1dHRvbiBtYXRTdWZmaXggKm5nSWY9XCIhZmlsZUlucHV0LmVtcHR5XCIgKGNsaWNrKT1cImZpbGVJbnB1dC5jbGVhcigkZXZlbnQpO3VwZGF0ZVZhbHVlKCRldmVudClcIiBzdHlsZT0nY3Vyc29yOnBvaW50ZXI7Jz5cbiAgICAgICAgPG1hdC1pY29uPmNsZWFyPC9tYXQtaWNvbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPG1hdC1pY29uIG1hdFN1ZmZpeCAqbmdJZj1cImZpbGVJbnB1dC5lbXB0eVwiIHN0eWxlPSdjdXJzb3I6cG9pbnRlcic+Zm9sZGVyPC9tYXQtaWNvbj5cbiAgICAgIDxzcGFuIG1hdFN1ZmZpeCAqbmdJZj1cIm9wdGlvbnM/LnN1ZmZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uUmlnaHRcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LnN1ZmZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uUmlnaHRcIj48L3NwYW4+XG4gICAgICA8bWF0LWhpbnQgKm5nSWY9XCJvcHRpb25zPy5kZXNjcmlwdGlvbiAmJiAoIW9wdGlvbnM/LnNob3dFcnJvcnMgfHwgIW9wdGlvbnM/LmVycm9yTWVzc2FnZSlcIlxuICAgICAgICBhbGlnbj1cImVuZFwiIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZGVzY3JpcHRpb25cIj48L21hdC1oaW50PlxuICAgIDwvbWF0LWZvcm0tZmllbGQ+XG4gICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZXJyb3JNZXNzYWdlXCI+PC9tYXQtZXJyb3I+YCxcbiAgIHN0eWxlczogW2BcbiAgICBtYXQtZXJyb3IgeyBmb250LXNpemU6IDc1JTsgbWFyZ2luLXRvcDogLTFyZW07IG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxuICAgIDo6bmctZGVlcCBqc29uLXNjaGVtYS1mb3JtIG1hdC1mb3JtLWZpZWxkIC5tYXQtZm9ybS1maWVsZC13cmFwcGVyIC5tYXQtZm9ybS1maWVsZC1mbGV4XG4gICAgICAubWF0LWZvcm0tZmllbGQtaW5maXggeyB3aWR0aDogaW5pdGlhbDsgfVxuICBgXVxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbEZpbGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBmb3JtQ29udHJvbDogQWJzdHJhY3RDb250cm9sO1xuICBjb250cm9sTmFtZTogc3RyaW5nO1xuICBjb250cm9sVmFsdWU6IGFueTtcbiAgY29udHJvbERpc2FibGVkID0gZmFsc2U7XG4gIGJvdW5kQ29udHJvbCA9IGZhbHNlO1xuICBvcHRpb25zOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuICBAVmlld0NoaWxkKCdmaWxlSW5wdXQnKSBmaWxlSW5wdXQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgICBASW5qZWN0KE1BVF9GT1JNX0ZJRUxEX0RFRkFVTFRfT1BUSU9OUykgQE9wdGlvbmFsKCkgcHVibGljIG1hdEZvcm1GaWVsZERlZmF1bHRPcHRpb25zXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5qc2YuaW5pdGlhbGl6ZUNvbnRyb2wodGhpcyk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVWYWx1ZShldmVudCkge1xuICAgIGlmKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuZmlsZXMgJiYgZXZlbnQudGFyZ2V0LmZpbGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgYmFzZTY0U3RyaW5nID0gYXdhaXQgdG9CYXNlNjQoZXZlbnQudGFyZ2V0LmZpbGVzWzBdKTtcbiAgICAgIHRoaXMuZm9ybUNvbnRyb2wuc2V0VmFsdWUoYmFzZTY0U3RyaW5nKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmZvcm1Db250cm9sLnNldFZhbHVlKG51bGwpO1xuICAgIH1cbiAgfVxufVxuIl19