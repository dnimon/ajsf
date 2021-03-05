import { AbstractControl } from '@angular/forms';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { Optional } from '@angular/core';
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'material-file-widget',
  template: `<mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
                    [class]="options?.htmlClass || ''"
                    [floatLabel]="options?.floatLabel || matLabelGlobalOptions?.float || (options?.notitle ? 'never' : 'auto')"
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
})
export class MaterialFileComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: any;
  controlDisabled = false;
  boundControl = false;
  options: any;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];
  @ViewChild('fileInput') fileInput;

  constructor(
    private jsf: JsonSchemaFormService,
    @Inject(MAT_FORM_FIELD_DEFAULT_OPTIONS) @Optional() public matFormFieldDefaultOptions,
    @Inject(MAT_LABEL_GLOBAL_OPTIONS) @Optional() public matLabelGlobalOptions
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.jsf.initializeControl(this);
  }

  async updateValue(event) {
    console.log("!!!", event.target.files)
    if(event.target && event.target.files && event.target.files.length) {
      const base64String = await toBase64(event.target.files[0]);
      console.log(base64String)
      this.formControl.setValue(base64String);
    }
    else {
      this.formControl.setValue(null);
    }
  }
}
