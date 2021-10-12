import { ChangeDetectorRef, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialNumberComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    private jsf;
    cdf: ChangeDetectorRef;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    allowNegative: boolean;
    allowDecimal: boolean;
    allowExponents: boolean;
    lastValidNumber: string;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    parent: any;
    constructor(matFormFieldDefaultOptions: any, jsf: JsonSchemaFormService, cdf: ChangeDetectorRef);
    ngOnInit(): void;
    updateValue(event: any): void;
}
