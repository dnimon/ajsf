import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { JsonSchemaFormService } from '@ajsf/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
export declare class MaterialDatepickerComponent implements OnInit {
    matFormFieldDefaultOptions: any;
    matLabelGlobalOptions: any;
    private jsf;
    formControl: FormControl;
    controlName: string;
    controlValue: string;
    dateValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    autoCompleteList: string[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(matFormFieldDefaultOptions: any, matLabelGlobalOptions: any, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: MatDatepickerInputEvent<Date>): void;
}
