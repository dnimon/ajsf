import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from '@ajsf/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
export declare class MaterialDatepickerComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    matLabelGlobalOptions: any;
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: string;
    dateValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    dateStr: any;
    dateValueStr: any;
    autoCompleteList: string[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(matFormFieldDefaultOptions: any, matLabelGlobalOptions: any, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: MatDatepickerInputEvent<Date>): void;
}
