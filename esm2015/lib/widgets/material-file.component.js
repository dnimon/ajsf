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
            console.log("!!!", event.target.files);
            if (event.target && event.target.files && event.target.files.length) {
                const base64String = yield toBase64(event.target.files[0]);
                console.log(base64String);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZmlsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1maWxlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFVLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV6QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7SUFDaEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQzs7QUFpQ0gsTUFBTSxPQUFPLHFCQUFxQjtJQVloQyxZQUNVLEdBQTBCLEVBQ3lCLDBCQUEwQjtRQUQ3RSxRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQUN5QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQUE7UUFWdkYsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDeEIsaUJBQVksR0FBRyxLQUFLLENBQUM7SUFVakIsQ0FBQztJQUVMLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFSyxXQUFXLENBQUMsS0FBSzs7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN0QyxJQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNsRSxNQUFNLFlBQVksR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO2dCQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN6QztpQkFDSTtnQkFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNqQztRQUNILENBQUM7S0FBQTs7O1lBL0RGLFNBQVMsU0FBQztnQkFDVCw4Q0FBOEM7Z0JBQzlDLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VEQXFCMkM7eUJBQzNDOzs7O0dBSVQ7YUFDRjs7O1lBekNRLHFCQUFxQjs0Q0F3RHpCLE1BQU0sU0FBQyw4QkFBOEIsY0FBRyxRQUFROzs7eUJBUGxELEtBQUs7MEJBQ0wsS0FBSzt3QkFDTCxLQUFLO3dCQUNMLFNBQVMsU0FBQyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIElucHV0LCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5pbXBvcnQgeyBNQVRfRk9STV9GSUVMRF9ERUZBVUxUX09QVElPTlMgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7IE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmNvbnN0IHRvQmFzZTY0ID0gZmlsZSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICByZWFkZXIub25sb2FkID0gKCkgPT4gcmVzb2x2ZShyZWFkZXIucmVzdWx0KTtcbiAgcmVhZGVyLm9uZXJyb3IgPSBlcnJvciA9PiByZWplY3QoZXJyb3IpO1xufSk7XG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtZmlsZS13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYDxtYXQtZm9ybS1maWVsZCBbYXBwZWFyYW5jZV09XCJvcHRpb25zPy5hcHBlYXJhbmNlIHx8IG1hdEZvcm1GaWVsZERlZmF1bHRPcHRpb25zPy5hcHBlYXJhbmNlIHx8ICdzdGFuZGFyZCdcIlxuICAgICAgICAgICAgICAgICAgICBbY2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCJcbiAgICAgICAgICAgICAgICAgICAgW2Zsb2F0TGFiZWxdPVwib3B0aW9ucz8uZmxvYXRMYWJlbCB8fCBtYXRGb3JtRmllbGREZWZhdWx0T3B0aW9ucz8uZmxvYXRMYWJlbCB8fCAob3B0aW9ucz8ubm90aXRsZSA/ICduZXZlcicgOiAnYXV0bycpXCJcbiAgICAgICAgICAgICAgICAgICAgW2hpZGVSZXF1aXJlZE1hcmtlcl09XCJvcHRpb25zPy5oaWRlUmVxdWlyZWQgPyAndHJ1ZScgOiAnZmFsc2UnXCJcbiAgICAgICAgICAgICAgICAgICAgW3N0eWxlLndpZHRoXT1cIicxMDAlJ1wiPlxuICAgICAgPG1hdC1sYWJlbCAqbmdJZj1cIiFvcHRpb25zPy5ub3RpdGxlXCI+e3tvcHRpb25zPy50aXRsZX19PC9tYXQtbGFiZWw+XG4gICAgICA8c3BhbiBtYXRQcmVmaXggKm5nSWY9XCJvcHRpb25zPy5wcmVmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvbkxlZnRcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LnByZWZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uTGVmdFwiPjwvc3Bhbj5cbiAgICAgIDxuZ3gtbWF0LWZpbGUtaW5wdXQgW3RhYmluZGV4XT1cIm9wdGlvbnM/LnRhYmluZGV4ID8gb3B0aW9ucz8udGFiaW5kZXggOiAwXCIgI2ZpbGVJbnB1dCAoY2hhbmdlKT1cInVwZGF0ZVZhbHVlKCRldmVudCk7b3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZVwiIFtyZXF1aXJlZF09XCJvcHRpb25zPy5yZXF1aXJlZFwiIChibHVyKT1cIm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWVcIlxuICAgICAgICA+XG4gICAgICA8L25neC1tYXQtZmlsZS1pbnB1dD5cbiAgICAgIDxidXR0b24gbWF0LWljb24tYnV0dG9uIG1hdFN1ZmZpeCAqbmdJZj1cIiFmaWxlSW5wdXQuZW1wdHlcIiAoY2xpY2spPVwiZmlsZUlucHV0LmNsZWFyKCRldmVudCk7dXBkYXRlVmFsdWUoJGV2ZW50KVwiIHN0eWxlPSdjdXJzb3I6cG9pbnRlcjsnPlxuICAgICAgICA8bWF0LWljb24+Y2xlYXI8L21hdC1pY29uPlxuICAgICAgPC9idXR0b24+XG4gICAgICA8bWF0LWljb24gbWF0U3VmZml4ICpuZ0lmPVwiZmlsZUlucHV0LmVtcHR5XCIgc3R5bGU9J2N1cnNvcjpwb2ludGVyJz5mb2xkZXI8L21hdC1pY29uPlxuICAgICAgPHNwYW4gbWF0U3VmZml4ICpuZ0lmPVwib3B0aW9ucz8uc3VmZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25SaWdodFwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uc3VmZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25SaWdodFwiPjwvc3Bhbj5cbiAgICAgIDxtYXQtaGludCAqbmdJZj1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uICYmICghb3B0aW9ucz8uc2hvd0Vycm9ycyB8fCAhb3B0aW9ucz8uZXJyb3JNZXNzYWdlKVwiXG4gICAgICAgIGFsaWduPVwiZW5kXCIgW2lubmVySFRNTF09XCJvcHRpb25zPy5kZXNjcmlwdGlvblwiPjwvbWF0LWhpbnQ+XG4gICAgPC9tYXQtZm9ybS1maWVsZD5cbiAgICA8bWF0LWVycm9yICpuZ0lmPVwib3B0aW9ucz8uc2hvd0Vycm9ycyAmJiBvcHRpb25zPy5lcnJvck1lc3NhZ2VcIlxuICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5lcnJvck1lc3NhZ2VcIj48L21hdC1lcnJvcj5gLFxuICAgc3R5bGVzOiBbYFxuICAgIG1hdC1lcnJvciB7IGZvbnQtc2l6ZTogNzUlOyBtYXJnaW4tdG9wOiAtMXJlbTsgbWFyZ2luLWJvdHRvbTogMC41cmVtOyB9XG4gICAgOjpuZy1kZWVwIGpzb24tc2NoZW1hLWZvcm0gbWF0LWZvcm0tZmllbGQgLm1hdC1mb3JtLWZpZWxkLXdyYXBwZXIgLm1hdC1mb3JtLWZpZWxkLWZsZXhcbiAgICAgIC5tYXQtZm9ybS1maWVsZC1pbmZpeCB7IHdpZHRoOiBpbml0aWFsOyB9XG4gIGBdXG59KVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsRmlsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIGZvcm1Db250cm9sOiBBYnN0cmFjdENvbnRyb2w7XG4gIGNvbnRyb2xOYW1lOiBzdHJpbmc7XG4gIGNvbnRyb2xWYWx1ZTogYW55O1xuICBjb250cm9sRGlzYWJsZWQgPSBmYWxzZTtcbiAgYm91bmRDb250cm9sID0gZmFsc2U7XG4gIG9wdGlvbnM6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG4gIEBWaWV3Q2hpbGQoJ2ZpbGVJbnB1dCcpIGZpbGVJbnB1dDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgIEBJbmplY3QoTUFUX0ZPUk1fRklFTERfREVGQVVMVF9PUFRJT05TKSBAT3B0aW9uYWwoKSBwdWJsaWMgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnNcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmpzZi5pbml0aWFsaXplQ29udHJvbCh0aGlzKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZVZhbHVlKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coXCIhISFcIiwgZXZlbnQudGFyZ2V0LmZpbGVzKVxuICAgIGlmKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuZmlsZXMgJiYgZXZlbnQudGFyZ2V0LmZpbGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgYmFzZTY0U3RyaW5nID0gYXdhaXQgdG9CYXNlNjQoZXZlbnQudGFyZ2V0LmZpbGVzWzBdKTtcbiAgICAgIGNvbnNvbGUubG9nKGJhc2U2NFN0cmluZylcbiAgICAgIHRoaXMuZm9ybUNvbnRyb2wuc2V0VmFsdWUoYmFzZTY0U3RyaW5nKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmZvcm1Db250cm9sLnNldFZhbHVlKG51bGwpO1xuICAgIH1cbiAgfVxufVxuIl19