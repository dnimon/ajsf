import { AbstractControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import { Subscription } from 'rxjs';
export declare class SubmitComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    subscriptions: Subscription;
    constructor(jsf: JsonSchemaFormService);
    ngOnDestroy(): void;
    ngOnInit(): void;
    updateValue(event: any): void;
}
