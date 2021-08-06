import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialNumberComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    private jsf;
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
    constructor(matFormFieldDefaultOptions: any, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
}
