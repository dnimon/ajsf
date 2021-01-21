import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialDesignFrameworkComponent implements OnInit, OnChanges {
    private changeDetector;
    private jsf;
    frameworkInitialized: boolean;
    inputType: string;
    options: any;
    widgetLayoutNode: any;
    widgetOptions: any;
    formControl: any;
    parentArray: any;
    isOrderable: boolean;
    dynamicTitle: string;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    parent: any;
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    get showRemoveButton(): boolean;
    ngOnInit(): void;
    ngOnChanges(): void;
    initializeFramework(): void;
    updateTitle(): void;
    removeItem(): void;
}
