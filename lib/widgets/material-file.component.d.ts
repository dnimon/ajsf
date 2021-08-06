import { AbstractControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialFileComponent implements OnInit {
    private jsf;
    matFormFieldDefaultOptions: any;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    fileInput: any;
    constructor(jsf: JsonSchemaFormService, matFormFieldDefaultOptions: any);
    ngOnInit(): void;
    updateValue(event: any): Promise<void>;
}
