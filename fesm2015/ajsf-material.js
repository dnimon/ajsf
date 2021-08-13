import { Component, ChangeDetectionStrategy, Input, Inject, Optional, ChangeDetectorRef, ViewChild, Injectable, NgModule } from '@angular/core';
import { JsonSchemaFormService, hasOwn, buildTitleMap, isDefined, isArray, Framework, WidgetLibraryModule, JsonSchemaFormModule, FrameworkLibraryService, WidgetLibraryService } from '@ajsf/core';
import { Subscription } from 'rxjs';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import * as moment from 'moment';
import { utc } from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import { __awaiter } from 'tslib';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_LOCALE, MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MediaMarshaller } from '@angular/flex-layout/core';
import { MomentDateAdapter, MatMomentDateModule } from '@angular/material-moment-adapter';
import { MaterialFileInputModule } from 'ngx-material-file-input';

class FlexLayoutRootComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.isFlexItem = false;
    }
    removeItem(item) {
        this.jsf.removeItem(item);
    }
    // Set attributes for flexbox child
    // (container attributes are set in flex-layout-section.component)
    getFlexAttribute(node, attribute) {
        const index = ['flex-grow', 'flex-shrink', 'flex-basis'].indexOf(attribute);
        return ((node.options || {}).flex || '').split(/\s+/)[index] ||
            (node.options || {})[attribute] || ['1', '1', 'auto'][index];
    }
    showWidget(layoutNode) {
        return this.jsf.evaluateCondition(layoutNode, this.dataIndex);
    }
}
FlexLayoutRootComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'flex-layout-root-widget',
                template: `
    <div *ngFor="let layoutNode of layout; let i = index"
      [class.form-flex-item]="isFlexItem"
      [ngClass]="layoutNode?.options.layoutHtmlClass"
      [style.flex-grow]="getFlexAttribute(layoutNode, 'flex-grow')"
      [style.flex-shrink]="getFlexAttribute(layoutNode, 'flex-shrink')"
      [style.flex-basis]="getFlexAttribute(layoutNode, 'flex-basis')"
      [style.align-self]="(layoutNode?.options || {})['align-self']"
      [style.order]="layoutNode?.options?.order"
      [fxFlex]="layoutNode?.options?.fxFlex"
      [fxFlexOrder]="layoutNode?.options?.fxFlexOrder"
      [fxFlexOffset]="layoutNode?.options?.fxFlexOffset"
      [fxFlexAlign]="layoutNode?.options?.fxFlexAlign">
      <select-framework-widget *ngIf="showWidget(layoutNode)"
        [dataIndex]="layoutNode?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [parent]="parent"
        [layoutNode]="layoutNode"></select-framework-widget>
    <div>`,
                changeDetection: ChangeDetectionStrategy.Default
            },] }
];
FlexLayoutRootComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
FlexLayoutRootComponent.propDecorators = {
    dataIndex: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    layout: [{ type: Input }],
    isFlexItem: [{ type: Input }],
    parent: [{ type: Input }]
};

class FlexLayoutSectionComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.expanded = true;
        this.containerType = 'div';
    }
    get sectionTitle() {
        return this.options.notitle ? null : this.jsf.setItemTitle(this);
    }
    ngOnInit() {
        this.jsf.initializeControl(this);
        this.options = this.layoutNode.options || {};
        this.expanded = typeof this.options.expanded === 'boolean' ?
            this.options.expanded : !this.options.expandable;
        switch (this.layoutNode.type) {
            case 'section':
            case 'array':
            case 'fieldset':
            case 'advancedfieldset':
            case 'authfieldset':
            case 'optionfieldset':
            case 'selectfieldset':
                this.containerType = 'fieldset';
                break;
            case 'card':
                this.containerType = 'card';
                break;
            case 'expansion-panel':
                this.containerType = 'expansion-panel';
                break;
            default: // 'div', 'flex', 'tab', 'conditional', 'actions'
                this.containerType = 'div';
        }
    }
    toggleExpanded() {
        if (this.options.expandable) {
            this.expanded = !this.expanded;
        }
    }
    // Set attributes for flexbox container
    // (child attributes are set in flex-layout-root.component)
    getFlexAttribute(attribute) {
        const flexActive = this.layoutNode.type === 'flex' ||
            !!this.options.displayFlex ||
            this.options.display === 'flex';
        // if (attribute !== 'flex' && !flexActive) { return null; }
        switch (attribute) {
            case 'is-flex':
                return flexActive;
            case 'display':
                return flexActive ? 'flex' : 'initial';
            case 'flex-direction':
            case 'flex-wrap':
                const index = ['flex-direction', 'flex-wrap'].indexOf(attribute);
                return (this.options['flex-flow'] || '').split(/\s+/)[index] ||
                    this.options[attribute] || ['column', 'nowrap'][index];
            case 'justify-content':
            case 'align-items':
            case 'align-content':
                return this.options[attribute];
            case 'layout':
                return (this.options.fxLayout || 'row') +
                    this.options.fxLayoutWrap ? ' ' + this.options.fxLayoutWrap : '';
        }
    }
}
FlexLayoutSectionComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'flex-layout-section-widget',
                template: `
    <div *ngIf="containerType === 'div'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <label *ngIf="sectionTitle"
        [class]="'legend ' + (options?.labelHtmlClass || '')"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></label>
      <flex-layout-root-widget *ngIf="expanded"
        [layout]="layoutNode.items"
        [dataIndex]="dataIndex"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.align-content]="getFlexAttribute('align-content')"
        [fxLayout]="getFlexAttribute('layout')"
        [fxLayoutGap]="options?.fxLayoutGap"
        [fxLayoutAlign]="options?.fxLayoutAlign"
        [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>

    <fieldset *ngIf="containerType === 'fieldset'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded"
      [disabled]="options?.readonly">
      <legend *ngIf="sectionTitle"
        [class]="'legend ' + (options?.labelHtmlClass || '')"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></legend>
      <flex-layout-root-widget *ngIf="expanded"
        [layout]="layoutNode.items"
        [dataIndex]="dataIndex"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.align-content]="getFlexAttribute('align-content')"
        [fxLayout]="getFlexAttribute('layout')"
        [fxLayoutGap]="options?.fxLayoutGap"
        [fxLayoutAlign]="options?.fxLayoutAlign"
        [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </fieldset>

    <mat-card *ngIf="containerType === 'card'"
      [ngClass]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <mat-card-header *ngIf="sectionTitle">
        <legend
          [class]="'legend ' + (options?.labelHtmlClass || '')"
          [innerHTML]="sectionTitle"
          (click)="toggleExpanded()"></legend>
      </mat-card-header>
      <mat-card-content *ngIf="expanded">
        <fieldset [disabled]="options?.readonly">
          <flex-layout-root-widget *ngIf="expanded"
            [layout]="layoutNode.items"
            [dataIndex]="dataIndex"
            [layoutIndex]="layoutIndex"
            [isFlexItem]="getFlexAttribute('is-flex')"
            [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
            [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
            [style.display]="getFlexAttribute('display')"
            [style.flex-direction]="getFlexAttribute('flex-direction')"
            [style.flex-wrap]="getFlexAttribute('flex-wrap')"
            [style.justify-content]="getFlexAttribute('justify-content')"
            [style.align-items]="getFlexAttribute('align-items')"
            [style.align-content]="getFlexAttribute('align-content')"
            [fxLayout]="getFlexAttribute('layout')"
            [fxLayoutGap]="options?.fxLayoutGap"
            [fxLayoutAlign]="options?.fxLayoutAlign"
            [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
          </fieldset>
      </mat-card-content>
      <mat-card-footer>
        <mat-error *ngIf="options?.showErrors && options?.errorMessage"
          [innerHTML]="options?.errorMessage"></mat-error>
      </mat-card-footer>
    </mat-card>

    <mat-expansion-panel *ngIf="containerType === 'expansion-panel'"
      [expanded]="expanded"
      [hideToggle]="!options?.expandable">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <legend *ngIf="sectionTitle"
            [class]="options?.labelHtmlClass"
            [innerHTML]="sectionTitle"
            (click)="toggleExpanded()"></legend>
        </mat-panel-title>
      </mat-expansion-panel-header>
      <fieldset [disabled]="options?.readonly">
        <flex-layout-root-widget *ngIf="expanded"
          [layout]="layoutNode.items"
          [dataIndex]="dataIndex"
          [layoutIndex]="layoutIndex"
          [isFlexItem]="getFlexAttribute('is-flex')"
          [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
          [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
          [style.display]="getFlexAttribute('display')"
          [style.flex-direction]="getFlexAttribute('flex-direction')"
          [style.flex-wrap]="getFlexAttribute('flex-wrap')"
          [style.justify-content]="getFlexAttribute('justify-content')"
          [style.align-items]="getFlexAttribute('align-items')"
          [style.align-content]="getFlexAttribute('align-content')"
          [fxLayout]="getFlexAttribute('layout')"
          [fxLayoutGap]="options?.fxLayoutGap"
          [fxLayoutAlign]="options?.fxLayoutAlign"
          [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      </fieldset>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </mat-expansion-panel>`,
                styles: [`
    fieldset { border: 0; margin: 0; padding: 0; }
    .legend { font-weight: bold; }
    .expandable > .legend:before { content: '▶'; padding-right: .3em; }
    .expanded > .legend:before { content: '▼'; padding-right: .2em; }
  `]
            },] }
];
FlexLayoutSectionComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
FlexLayoutSectionComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialAddReferenceComponent {
    constructor(jsf) {
        this.jsf = jsf;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
    }
    get showAddButton() {
        return !this.layoutNode.arrayItem ||
            this.layoutIndex[this.layoutIndex.length - 1] < this.options.maxItems;
    }
    addItem(event) {
        event.preventDefault();
        this.jsf.addItem(this);
    }
    get buttonText() {
        const parent = {
            dataIndex: this.dataIndex.slice(0, -1),
            layoutIndex: this.layoutIndex.slice(0, -1),
            layoutNode: this.jsf.getParentNode(this),
        };
        return parent.layoutNode.add ||
            this.jsf.setArrayItemTitle(parent, this.layoutNode, this.itemCount);
    }
}
MaterialAddReferenceComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-add-reference-widget',
                template: `
    <section [class]="options?.htmlClass || ''" align="end">
      <button mat-raised-button *ngIf="showAddButton"
        [color]="options?.color || 'accent'"
        [disabled]="options?.readonly"
        (click)="addItem($event)">
        <span *ngIf="options?.icon" [class]="options?.icon"></span>
        <span *ngIf="options?.title" [innerHTML]="buttonText"></span>
      </button>
    </section>`,
                changeDetection: ChangeDetectionStrategy.Default
            },] }
];
MaterialAddReferenceComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialAddReferenceComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialButtonComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.subscriptions = new Subscription();
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
        if (hasOwn(this.options, 'disabled')) {
            this.controlDisabled = this.options.disabled;
        }
        else if (this.jsf.formOptions.disableInvalidSubmit) {
            this.controlDisabled = !this.jsf.isValid;
            this.subscriptions.add(this.jsf.isValidChanges.subscribe(isValid => this.controlDisabled = !isValid));
        }
    }
    updateValue(event) {
        if (typeof this.options.onClick === 'function') {
            this.options.onClick(event);
        }
        else {
            this.jsf.updateValue(this, event.target.value);
        }
    }
}
MaterialButtonComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-button-widget',
                template: `
    <div class="button-row" [class]="options?.htmlClass || ''">
      <button mat-raised-button
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [color]="options?.color || 'primary'"
        [disabled]="controlDisabled || options?.readonly"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [type]="layoutNode?.type"
        [value]="controlValue"
        (click)="updateValue($event)">
        <mat-icon *ngIf="options?.icon" class="mat-24">{{options?.icon}}</mat-icon>
        <span *ngIf="options?.title" [innerHTML]="options?.title"></span>
      </button>
    </div>`,
                styles: [` button { margin-top: 10px; } `]
            },] }
];
MaterialButtonComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialButtonComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialButtonGroupComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.radiosList = [];
        this.vertical = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.radiosList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        this.jsf.initializeControl(this);
    }
    updateValue(value) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, value);
    }
}
MaterialButtonGroupComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-button-group-widget',
                template: `
    <div>
      <div *ngIf="options?.title">
        <label
          [attr.for]="'control' + layoutNode?._id"
          [class]="options?.labelHtmlClass || ''"
          [style.display]="options?.notitle ? 'none' : ''"
          [innerHTML]="options?.title"></label>
      </div>
      <mat-button-toggle-group
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [disabled]="controlDisabled || options?.readonly"
        [name]="controlName"
        [value]="controlValue"
        [vertical]="!!options.vertical">
        <mat-button-toggle *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value"
          (click)="updateValue(radioItem?.value)">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-button-toggle>
      </mat-button-toggle-group>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`,
                styles: [` mat-error { font-size: 75%; } `]
            },] }
];
MaterialButtonGroupComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialButtonGroupComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialCheckboxComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.trueValue = true;
        this.falseValue = false;
        this.showSlideToggle = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this, !this.options.readonly);
        if (this.controlValue === null || this.controlValue === undefined) {
            this.controlValue = false;
            this.jsf.updateValue(this, this.falseValue);
        }
        if (this.layoutNode.type === 'slide-toggle' ||
            this.layoutNode.format === 'slide-toggle') {
            this.showSlideToggle = true;
        }
    }
    updateValue(event) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, event.checked ? this.trueValue : this.falseValue);
    }
    get isChecked() {
        return this.jsf.getFormControlValue(this) === this.trueValue;
    }
}
MaterialCheckboxComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-checkbox-widget',
                template: `
    <mat-checkbox *ngIf="boundControl && !showSlideToggle"
      [formControl]="formControl"
      align="left"
      [color]="options?.color || 'primary'"
      [id]="'control' + layoutNode?._id"
      labelPosition="after"
      [name]="controlName"
      (blur)="options.showErrors = true">
      <span *ngIf="options?.title"
        class="checkbox-name"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></span>
    </mat-checkbox>
    <mat-checkbox *ngIf="!boundControl && !showSlideToggle"
      align="left"
      [color]="options?.color || 'primary'"
      [disabled]="controlDisabled || options?.readonly"
      [id]="'control' + layoutNode?._id"
      labelPosition="after"
      [name]="controlName"
      [checked]="isChecked"
      (blur)="options.showErrors = true"
      (change)="updateValue($event)">
      <span *ngIf="options?.title"
        class="checkbox-name"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></span>
    </mat-checkbox>
    <mat-slide-toggle *ngIf="boundControl && showSlideToggle"
      [formControl]="formControl"
      align="left"
      [color]="options?.color || 'primary'"
      [id]="'control' + layoutNode?._id"
      labelPosition="after"
      [name]="controlName"
      (blur)="options.showErrors = true">
      <span *ngIf="options?.title"
        class="checkbox-name"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></span>
    </mat-slide-toggle>
    <mat-slide-toggle *ngIf="!boundControl && showSlideToggle"
      align="left"
      [color]="options?.color || 'primary'"
      [disabled]="controlDisabled || options?.readonly"
      [id]="'control' + layoutNode?._id"
      labelPosition="after"
      [name]="controlName"
      [checked]="isChecked"
      (blur)="options.showErrors = true"
      (change)="updateValue($event)">
      <span *ngIf="options?.title"
        class="checkbox-name"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></span>
    </mat-slide-toggle>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`,
                styles: [`
    .checkbox-name { white-space: nowrap; }
    mat-error { font-size: 75%; }
  `]
            },] }
];
MaterialCheckboxComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialCheckboxComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

// TODO: Change this to use a Selection List instead?
// https://material.angular.io/components/list/overview
class MaterialCheckboxesComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.horizontalList = false;
        this.checkboxList = [];
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.horizontalList = this.layoutNode.type === 'checkboxes-inline' ||
            this.layoutNode.type === 'checkboxbuttons';
        this.jsf.initializeControl(this);
        this.checkboxList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        if (this.boundControl) {
            const formArray = this.jsf.getFormControl(this);
            for (const checkboxItem of this.checkboxList) {
                checkboxItem.checked = formArray.value.includes(checkboxItem.value);
            }
        }
    }
    get allChecked() {
        return this.checkboxList.filter(t => t.checked).length === this.checkboxList.length;
    }
    get someChecked() {
        const checkedItems = this.checkboxList.filter(t => t.checked).length;
        return checkedItems > 0 && checkedItems < this.checkboxList.length;
    }
    updateValue() {
        this.options.showErrors = true;
        if (this.boundControl) {
            this.jsf.updateArrayCheckboxList(this, this.checkboxList);
        }
    }
    updateAllValues(event) {
        this.options.showErrors = true;
        this.checkboxList.forEach(t => t.checked = event.checked);
        this.updateValue();
    }
}
MaterialCheckboxesComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-checkboxes-widget',
                template: `
    <div>
      <mat-checkbox type="checkbox"
        [checked]="allChecked"
        [color]="options?.color || 'primary'"
        [disabled]="controlDisabled || options?.readonly"
        [indeterminate]="someChecked"
        [name]="options?.name"
        (blur)="options.showErrors = true"
        (change)="updateAllValues($event)">
        <span class="checkbox-name" [innerHTML]="options?.name"></span>
      </mat-checkbox>
      <label *ngIf="options?.title"
        class="title"
        [class]="options?.labelHtmlClass || ''"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></label>
      <ul class="checkbox-list" [class.horizontal-list]="horizontalList">
        <li *ngFor="let checkboxItem of checkboxList"
          [class]="options?.htmlClass || ''">
          <mat-checkbox type="checkbox"
            [(ngModel)]="checkboxItem.checked"
            [color]="options?.color || 'primary'"
            [disabled]="controlDisabled || options?.readonly"
            [name]="checkboxItem?.name"
            (blur)="options.showErrors = true"
            (change)="updateValue()">
            <span class="checkbox-name" [innerHTML]="checkboxItem?.name"></span>
          </mat-checkbox>
        </li>
      </ul>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`,
                styles: [`
    .title { font-weight: bold; }
    .checkbox-list { list-style-type: none; }
    .horizontal-list > li { display: inline-block; margin-right: 10px; zoom: 1; }
    .checkbox-name { white-space: nowrap; }
    mat-error { font-size: 75%; }
  `]
            },] }
];
MaterialCheckboxesComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialCheckboxesComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

// TODO: Add this control
class MaterialChipListComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
    }
    updateValue(event) {
        this.jsf.updateValue(this, event.target.value);
    }
}
MaterialChipListComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-chip-list-widget',
                template: ``
            },] }
];
MaterialChipListComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialChipListComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialDatepickerComponent {
    constructor(matFormFieldDefaultOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.autoCompleteList = [];
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this, !this.options.readonly);
        if (this.controlValue) {
            this.formControl.setValue(moment(this.controlValue).toISOString());
            this.dateValueStr = utc(this.controlValue);
        }
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    }
    updateValue(event) {
        this.formControl.setValue(event.value.toISOString());
        this.options.showErrors = true;
        this.dateValueStr = utc(this.controlValue);
    }
}
MaterialDatepickerComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-datepicker-widget',
                template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
                    [class]="options?.htmlClass || ''"
                    [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
                    [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
                    [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
        <input matInput *ngIf="boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [id]="'control' + layoutNode?._id"
        [max]="options?.maximum"
        [matDatepicker]="picker"
        [min]="options?.minimum"
        [name]="controlName"
        [placeholder]="options?.title"
        [readonly]="true"
        [required]="options?.required"
        [value]="dateValueStr"
        [style.width]="'100%'"
        (blur)="options.showErrors = true"
        [tabindex]="options?.tabindex ? options?.tabindex : 0"
        (dateChange)="updateValue($event)"
        (dateInput)="updateValue($event)"
        [style.cursor]="'default'">
      <input matInput *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [disabled]="controlDisabled || options?.readonly"
        [id]="'control' + layoutNode?._id"
        [max]="options?.maximum"
        [matDatepicker]="picker"
        [min]="options?.minimum"
        [name]="controlName"
        [placeholder]="options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [readonly]="options?.readonly"
        [tabindex]="options?.tabindex ? options?.tabindex : 0"
        (blur)="options.showErrors = true"
        (dateChange)="updateValue($event)"
        (dateInput)="updateValue($event)">
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
    </mat-form-field>
    <mat-datepicker #picker ></mat-datepicker>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`,
                styles: [`
    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }
    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex
      .mat-form-field-infix { width: initial; }
  `]
            },] }
];
MaterialDatepickerComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: Optional }] },
    { type: JsonSchemaFormService }
];
MaterialDatepickerComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialDesignFrameworkComponent {
    constructor(changeDetector, jsf) {
        this.changeDetector = changeDetector;
        this.jsf = jsf;
        this.frameworkInitialized = false;
        this.formControl = null;
        this.parentArray = null;
        this.isOrderable = false;
        this.dynamicTitle = null;
    }
    get showRemoveButton() {
        if (!this.layoutNode || !this.widgetOptions.removable ||
            this.widgetOptions.readonly || this.layoutNode.type === '$ref') {
            return false;
        }
        if (this.layoutNode.recursiveReference) {
            return true;
        }
        if (!this.layoutNode.arrayItem || !this.parentArray) {
            return false;
        }
        // If array length <= minItems, don't allow removing any items
        return this.parentArray.items.length - 1 <= this.parentArray.options.minItems ? false :
            // For removable list items, allow removing any item
            this.layoutNode.arrayItemType === 'list' ? true :
                // For removable tuple items, only allow removing last item in list
                this.layoutIndex[this.layoutIndex.length - 1] === this.parentArray.items.length - 2;
    }
    ngOnInit() {
        this.initializeFramework();
    }
    ngOnChanges() {
        if (!this.frameworkInitialized) {
            this.initializeFramework();
        }
        if (this.dynamicTitle) {
            this.updateTitle();
        }
    }
    initializeFramework() {
        if (this.layoutNode) {
            this.options = cloneDeep(this.layoutNode.options || {});
            this.widgetLayoutNode = Object.assign(Object.assign({}, this.layoutNode), { options: cloneDeep(this.layoutNode.options || {}) });
            this.widgetOptions = this.widgetLayoutNode.options;
            this.formControl = this.jsf.getFormControl(this);
            if (isDefined(this.widgetOptions.minimum) &&
                isDefined(this.widgetOptions.maximum) &&
                this.widgetOptions.multipleOf >= 1) {
                this.layoutNode.type = 'range';
            }
            if (!['$ref', 'advancedfieldset', 'authfieldset', 'button', 'card',
                'checkbox', 'expansion-panel', 'help', 'message', 'msg', 'section',
                'submit', 'tabarray', 'tabs'].includes(this.layoutNode.type) &&
                /{{.+?}}/.test(this.widgetOptions.title || '')) {
                this.dynamicTitle = this.widgetOptions.title;
                this.updateTitle();
            }
            if (this.layoutNode.arrayItem && this.layoutNode.type !== '$ref') {
                this.parentArray = this.jsf.getParentNode(this);
                if (this.parentArray) {
                    this.isOrderable =
                        this.parentArray.type.slice(0, 3) !== 'tab' &&
                            this.layoutNode.arrayItemType === 'list' &&
                            !this.widgetOptions.readonly &&
                            this.parentArray.options.orderable;
                }
            }
            this.frameworkInitialized = true;
        }
        else {
            this.options = {};
        }
    }
    updateTitle() {
        this.widgetLayoutNode.options.title = this.jsf.parseText(this.dynamicTitle, this.jsf.getFormControlValue(this), this.jsf.getFormControlGroup(this).value, this.dataIndex[this.dataIndex.length - 1]);
    }
    removeItem() {
        this.jsf.removeItem(this);
    }
}
MaterialDesignFrameworkComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-design-framework',
                template: "<div\n  [class.array-item]=\"widgetLayoutNode?.arrayItem && widgetLayoutNode?.type !== '$ref'\"\n  [orderable]=\"isOrderable\"\n  [dataIndex]=\"dataIndex\"\n  [layoutIndex]=\"layoutIndex\"\n  [layoutNode]=\"widgetLayoutNode\">\n  <svg *ngIf=\"showRemoveButton\"\n       xmlns=\"http://www.w3.org/2000/svg\"\n       height=\"18\" width=\"18\" viewBox=\"0 0 24 24\"\n       class=\"close-button\"\n       (click)=\"removeItem()\">\n    <path\n      d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z\"/>\n  </svg>\n  <select-widget-widget\n    [dataIndex]=\"dataIndex\"\n    [layoutIndex]=\"layoutIndex\"\n    [parent]=\"parent\"\n    [layoutNode]=\"widgetLayoutNode\"></select-widget-widget>\n</div>\n<div class=\"spacer\" *ngIf=\"widgetLayoutNode?.arrayItem && widgetLayoutNode?.type !== '$ref'\"></div>\n",
                styles: [".array-item{border-radius:2px;box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);padding:6px;position:relative;transition:all .28s cubic-bezier(.4,0,.2,1)}.close-button{cursor:pointer;position:absolute;top:6px;right:6px;fill:rgba(0,0,0,.4);visibility:hidden;z-index:500}.close-button:hover{fill:rgba(0,0,0,.8)}.array-item:hover>.close-button{visibility:visible}.spacer{margin:6px 0}[draggable=true]:hover{box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);cursor:move;z-index:10}[draggable=true].drag-target-top{box-shadow:0 -2px 0 #000;position:relative;z-index:20}[draggable=true].drag-target-bottom{box-shadow:0 2px 0 #000;position:relative;z-index:20}"]
            },] }
];
MaterialDesignFrameworkComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: JsonSchemaFormService }
];
MaterialDesignFrameworkComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }],
    parent: [{ type: Input }]
};

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
const ɵ0 = toBase64;
class MaterialFileComponent {
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

class MaterialInputComponent {
    constructor(matFormFieldDefaultOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
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
    processKeydown(event) {
        this.jsf.updateKeydown({
            controlName: this.controlName,
            event
        });
    }
}
MaterialInputComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-input-widget',
                template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
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
        [tabindex]="options?.tabindex ? options?.tabindex : 0"
        (blur)="options.showErrors = true"
        (keydown)="processKeydown($event)">
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
        [tabindex]="options?.tabindex ? options?.tabindex : 0"
        (input)="updateValue($event)"
        (blur)="options.showErrors = true" (keydown)="processKeydown($event)">
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
    { type: JsonSchemaFormService }
];
MaterialInputComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialNumberComponent {
    constructor(matFormFieldDefaultOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.allowNegative = true;
        this.allowDecimal = true;
        this.allowExponents = false;
        this.lastValidNumber = '';
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
        if (this.layoutNode.dataType === 'integer') {
            this.allowDecimal = false;
        }
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    }
    updateValue(event) {
        this.jsf.updateValue(this, event.target.value);
    }
}
MaterialNumberComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-number-widget',
                template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
    [class]="options?.htmlClass || ''"
    [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
    [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
    [style.width]="'100%'">
    <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <input matInput *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.max]="options?.maximum"
        [attr.min]="options?.minimum"
        [attr.step]="options?.multipleOf || options?.step || 'any'"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [required]="options?.required"
        [style.width]="'100%'"
        [type]="'number'"
        (blur)="options.showErrors = true">
      <input matInput *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.max]="options?.maximum"
        [attr.min]="options?.minimum"
        [attr.step]="options?.multipleOf || options?.step || 'any'"
        [disabled]="controlDisabled"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [required]="options?.required"
        [style.width]="'100%'"
        [type]="'number'"
        [value]="controlValue"
        (input)="updateValue($event)"
        (blur)="options.showErrors = true">
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="layoutNode?.type === 'range'" align="start"
        [innerHTML]="controlValue"></mat-hint>
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
MaterialNumberComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: Optional }] },
    { type: JsonSchemaFormService }
];
MaterialNumberComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

// TODO: Add this control
class MaterialOneOfComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
    }
    updateValue(event) {
        this.jsf.updateValue(this, event.target.value);
    }
}
MaterialOneOfComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-one-of-widget',
                template: ``
            },] }
];
MaterialOneOfComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialOneOfComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialRadiosComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.flexDirection = 'column';
        this.radiosList = [];
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        if (this.layoutNode.type === 'radios-inline') {
            this.flexDirection = 'row';
        }
        this.radiosList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        this.jsf.initializeControl(this, !this.options.readonly);
    }
    updateValue(value) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, value);
    }
}
MaterialRadiosComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-radios-widget',
                template: `
    <div>
      <div *ngIf="options?.title">
        <label
          [attr.for]="'control' + layoutNode?._id"
          [class]="options?.labelHtmlClass || ''"
          [style.display]="options?.notitle ? 'none' : ''"
          [innerHTML]="options?.title"></label>
      </div>
      <mat-radio-group *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [style.flex-direction]="flexDirection"
        [name]="controlName"
        (blur)="options.showErrors = true">
        <mat-radio-button *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-radio-button>
      </mat-radio-group>
      <mat-radio-group *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [style.flex-direction]="flexDirection"
        [disabled]="controlDisabled || options?.readonly"
        [name]="controlName"
        [value]="controlValue">
        <mat-radio-button *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value"
          (click)="updateValue(radioItem?.value)">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`,
                styles: [`
    mat-radio-group { display: inline-flex; }
    mat-radio-button { margin: 2px; }
    mat-error { font-size: 75%; }
  `]
            },] }
];
MaterialRadiosComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialRadiosComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialSelectComponent {
    constructor(matFormFieldDefaultOptions, jsf, cdf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.jsf = jsf;
        this.cdf = cdf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.selectList = [];
        this.isArray = isArray;
    }
    ngOnInit() {
        if (this.parent) {
            this.parent.selectFrameworkWidgets.push(this);
        }
        else {
            console.warn('Missing parent for', this);
        }
        this.options = this.layoutNode.options || {};
        this.selectList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, !!this.options.required, !!this.options.flatList);
        this.jsf.initializeControl(this, !this.options.readonly);
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    }
    updateValue(event) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, event.value);
    }
}
MaterialSelectComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-select-widget',
                template: `
    <mat-form-field
      [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <mat-select *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [tabIndex]="options?.tabindex ? options?.tabindex : 0"
        (blur)="options.showErrors = true">
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option *ngIf="!isArray(selectItem?.items)"
            [value]="selectItem?.value">
            <span [innerHTML]="selectItem?.name"></span>
          </mat-option>
          <mat-optgroup *ngIf="isArray(selectItem?.items)"
            [label]="selectItem?.group">
            <mat-option *ngFor="let subItem of selectItem.items"
              [value]="subItem?.value">
              <span [innerHTML]="subItem?.name"></span>
            </mat-option>
          </mat-optgroup>
        </ng-template>
      </mat-select>
      <mat-select *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [disabled]="controlDisabled || options?.readonly"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [value]="controlValue"
        [tabIndex]="options?.tabindex ? options?.tabindex : 0"
        (blur)="options.showErrors = true"
        (change)="updateValue($event)">
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option *ngIf="!isArray(selectItem?.items)"
            [attr.selected]="selectItem?.value === controlValue"
            [value]="selectItem?.value">
            <span [innerHTML]="selectItem?.name"></span>
          </mat-option>
          <mat-optgroup *ngIf="isArray(selectItem?.items)"
            [label]="selectItem?.group">
            <mat-option *ngFor="let subItem of selectItem.items"
              [attr.selected]="subItem?.value === controlValue"
              [value]="subItem?.value">
              <span [innerHTML]="subItem?.name"></span>
            </mat-option>
          </mat-optgroup>
        </ng-template>
      </mat-select>
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
MaterialSelectComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: Optional }] },
    { type: JsonSchemaFormService },
    { type: ChangeDetectorRef }
];
MaterialSelectComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }],
    parent: [{ type: Input }]
};

class MaterialSliderComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.allowNegative = true;
        this.allowDecimal = true;
        this.allowExponents = false;
        this.lastValidNumber = '';
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this, !this.options.readonly);
    }
    updateValue(event) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, event.value);
    }
}
MaterialSliderComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-slider-widget',
                template: `
    <mat-slider thumbLabel *ngIf="boundControl"
      [formControl]="formControl"
      [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
      [id]="'control' + layoutNode?._id"
      [max]="options?.maximum"
      [min]="options?.minimum"
      [step]="options?.multipleOf || options?.step || 'any'"
      [style.width]="'100%'"
      (blur)="options.showErrors = true"></mat-slider>
    <mat-slider thumbLabel *ngIf="!boundControl"
      [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
      [disabled]="controlDisabled || options?.readonly"
      [id]="'control' + layoutNode?._id"
      [max]="options?.maximum"
      [min]="options?.minimum"
      [step]="options?.multipleOf || options?.step || 'any'"
      [style.width]="'100%'"
      [value]="controlValue"
      (blur)="options.showErrors = true"
      (change)="updateValue($event)"></mat-slider>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`,
                styles: [` mat-error { font-size: 75%; } `]
            },] }
];
MaterialSliderComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialSliderComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

// TODO: Add this control
class MaterialStepperComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
    }
    updateValue(event) {
        this.jsf.updateValue(this, event.target.value);
    }
}
MaterialStepperComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-stepper-widget',
                template: ``
            },] }
];
MaterialStepperComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialStepperComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialTabsComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.selectedItem = 0;
        this.showAddTab = true;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.itemCount = this.layoutNode.items.length - 1;
        this.updateControl();
    }
    select(index) {
        if (this.layoutNode.items[index].type === '$ref') {
            this.jsf.addItem({
                layoutNode: this.layoutNode.items[index],
                layoutIndex: this.layoutIndex.concat(index),
                dataIndex: this.dataIndex.concat(index)
            });
            this.updateControl();
        }
        this.selectedItem = index;
    }
    updateControl() {
        this.itemCount = this.layoutNode.items.length - 1;
        const lastItem = this.layoutNode.items[this.layoutNode.items.length - 1];
        this.showAddTab = lastItem.type === '$ref' &&
            this.itemCount < (lastItem.options.maxItems || 1000);
    }
    setTabTitle(item, index) {
        return this.jsf.setArrayItemTitle(this, item, index);
    }
}
MaterialTabsComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-tabs-widget',
                template: `
    <nav mat-tab-nav-bar
      [attr.aria-label]="options?.label || options?.title || ''"
      [style.width]="'100%'">
        <a mat-tab-link *ngFor="let item of layoutNode?.items; let i = index"
          [active]="selectedItem === i"
          (click)="select(i)">
          <span *ngIf="showAddTab || item.type !== '$ref'"
            [innerHTML]="setTabTitle(item, i)"></span>
        </a>
    </nav>
    <div *ngFor="let layoutItem of layoutNode?.items; let i = index"
      [class]="options?.htmlClass || ''">
      <select-framework-widget *ngIf="selectedItem === i"
        [class]="(options?.fieldHtmlClass || '') + ' ' + (options?.activeClass || '') + ' ' + (options?.style?.selected || '')"
        [dataIndex]="layoutNode?.dataType === 'array' ? (dataIndex || []).concat(i) : dataIndex"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [layoutNode]="layoutItem"></select-framework-widget>
    </div>`,
                styles: [` a { cursor: pointer; } `]
            },] }
];
MaterialTabsComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialTabsComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

class MaterialTextareaComponent {
    constructor(matFormFieldDefaultOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
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
MaterialTextareaComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-textarea-widget',
                template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <textarea matInput *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [required]="options?.required"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [style.width]="'100%'"
        (blur)="options.showErrors = true"></textarea>
      <textarea matInput *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [required]="options?.required"
        [disabled]="controlDisabled"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [style.width]="'100%'"
        [value]="controlValue"
        (input)="updateValue($event)"
        (blur)="options.showErrors = true"></textarea>
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
MaterialTextareaComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: Optional }] },
    { type: JsonSchemaFormService }
];
MaterialTextareaComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};

const MATERIAL_FRAMEWORK_COMPONENTS = [
    FlexLayoutRootComponent, FlexLayoutSectionComponent,
    MaterialAddReferenceComponent, MaterialOneOfComponent,
    MaterialButtonComponent, MaterialButtonGroupComponent,
    MaterialCheckboxComponent, MaterialCheckboxesComponent,
    MaterialChipListComponent, MaterialDatepickerComponent,
    MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent,
    MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent,
    MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent,
    MaterialDesignFrameworkComponent
];

// Material Design Framework
// https://github.com/angular/material2
class MaterialDesignFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this.widgets = {
            'root': FlexLayoutRootComponent,
            'section': FlexLayoutSectionComponent,
            '$ref': MaterialAddReferenceComponent,
            'button': MaterialButtonComponent,
            'button-group': MaterialButtonGroupComponent,
            'checkbox': MaterialCheckboxComponent,
            'checkboxes': MaterialCheckboxesComponent,
            'chip-list': MaterialChipListComponent,
            'date': MaterialDatepickerComponent,
            'file': MaterialFileComponent,
            'number': MaterialNumberComponent,
            'one-of': MaterialOneOfComponent,
            'radios': MaterialRadiosComponent,
            'select': MaterialSelectComponent,
            'slider': MaterialSliderComponent,
            'stepper': MaterialStepperComponent,
            'tabs': MaterialTabsComponent,
            'text': MaterialInputComponent,
            'textarea': MaterialTextareaComponent,
            'alt-date': 'date',
            'any-of': 'one-of',
            'card': 'section',
            'color': 'text',
            'expansion-panel': 'section',
            'hidden': 'none',
            'image': 'none',
            'integer': 'number',
            'radiobuttons': 'button-group',
            'range': 'slider',
            'submit': 'button',
            'tagsinput': 'chip-list',
            'wizard': 'stepper',
        };
    }
}
MaterialDesignFramework.decorators = [
    { type: Injectable }
];

function fixAngularFlex() {
    // monkey patch based on errors in console  - https://github.com/angular/flex-layout/issues/1011
    const MediaMarshallerUpdateElement = MediaMarshaller.prototype.updateElement;
    MediaMarshaller.prototype.updateElement = function (element, key, value) {
        if (key === 'layout-gap' && (value === null || value === undefined)) {
            value = '0px';
        }
        MediaMarshallerUpdateElement.apply(this, [element, key, value]);
    };
}

class MomentUtcDateAdapter extends MomentDateAdapter {
    constructor(dateLocale) {
        super(dateLocale);
    }
    createDate(year, month, date) {
        // Moment.js will create an invalid date if any of the components are out of bounds, but we
        // explicitly check each case so we can throw more descriptive errors.
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }
        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }
        let result = utc({ year, month, date }).locale(this.locale);
        // If the result isn't valid, the date must have been out of bounds for this month.
        if (!result.isValid()) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }
        return result;
    }
}
MomentUtcDateAdapter.decorators = [
    { type: Injectable }
];
MomentUtcDateAdapter.ctorParameters = () => [
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [MAT_DATE_LOCALE,] }] }
];

/**
 * unused @angular/material modules:
 * MatDialogModule, MatGridListModule, MatListModule, MatMenuModule,
 * MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
 * MatSidenavModule, MatSnackBarModule, MatSortModule, MatTableModule,
 * ,
 */
const ANGULAR_MATERIAL_MODULES = [
    MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
    MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
    MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
    MatStepperModule, MatTabsModule, MatTooltipModule,
    MatToolbarModule, MatMenuModule, MatToolbarModule,
];
class MaterialDesignFrameworkModule {
    constructor() {
        fixAngularFlex();
    }
}
MaterialDesignFrameworkModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    FlexLayoutModule,
                    ...ANGULAR_MATERIAL_MODULES,
                    WidgetLibraryModule,
                    JsonSchemaFormModule,
                    MatMomentDateModule,
                    MaterialFileInputModule,
                ],
                declarations: [
                    ...MATERIAL_FRAMEWORK_COMPONENTS,
                ],
                exports: [
                    JsonSchemaFormModule,
                    ...MATERIAL_FRAMEWORK_COMPONENTS,
                ],
                providers: [
                    JsonSchemaFormService,
                    FrameworkLibraryService,
                    WidgetLibraryService,
                    { provide: Framework, useClass: MaterialDesignFramework, multi: true },
                    { provide: DateAdapter, useClass: MomentUtcDateAdapter }
                ],
                entryComponents: [
                    ...MATERIAL_FRAMEWORK_COMPONENTS,
                ]
            },] }
];
MaterialDesignFrameworkModule.ctorParameters = () => [];

/*
 * Public API Surface of @ajsf/material-framework
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ANGULAR_MATERIAL_MODULES, FlexLayoutRootComponent, FlexLayoutSectionComponent, MATERIAL_FRAMEWORK_COMPONENTS, MaterialAddReferenceComponent, MaterialButtonComponent, MaterialButtonGroupComponent, MaterialCheckboxComponent, MaterialCheckboxesComponent, MaterialChipListComponent, MaterialDatepickerComponent, MaterialDesignFramework, MaterialDesignFrameworkComponent, MaterialDesignFrameworkModule, MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent, MaterialOneOfComponent, MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent, MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent, MomentUtcDateAdapter as ɵa };
//# sourceMappingURL=ajsf-material.js.map
