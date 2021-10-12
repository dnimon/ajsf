import { AbstractControl } from '@angular/forms';
import { ChangeDetectorRef, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialInputComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    private jsf;
    cdf: ChangeDetectorRef;
    formControl: AbstractControl;
    controlName: string;
    controlValue: string;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    autoCompleteList: string[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    parent: any;
    constructor(matFormFieldDefaultOptions: any, jsf: JsonSchemaFormService, cdf: ChangeDetectorRef);
    ngOnInit(): void;
    updateValue(event: any): void;
    processKeydown(event: any): void;
}
