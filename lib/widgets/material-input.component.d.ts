import { AbstractControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialInputComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    private jsf;
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
    constructor(matFormFieldDefaultOptions: any, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
}
