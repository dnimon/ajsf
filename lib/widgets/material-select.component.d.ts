import { AbstractControl } from '@angular/forms';
import { OnInit, ChangeDetectorRef } from '@angular/core';
import { JsonSchemaFormService, isArray } from '@ajsf/core';
export declare class MaterialSelectComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    matLabelGlobalOptions: any;
    private jsf;
    cdf: ChangeDetectorRef;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    selectList: any[];
    isArray: typeof isArray;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    parent: any;
    constructor(matFormFieldDefaultOptions: any, matLabelGlobalOptions: any, jsf: JsonSchemaFormService, cdf: ChangeDetectorRef);
    ngOnInit(): void;
    updateValue(event: any): void;
}
