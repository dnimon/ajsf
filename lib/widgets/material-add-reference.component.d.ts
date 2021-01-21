import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialAddReferenceComponent implements OnInit {
    private jsf;
    options: any;
    itemCount: number;
    previousLayoutIndex: number[];
    previousDataIndex: number[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    get showAddButton(): boolean;
    addItem(event: any): void;
    get buttonText(): string;
}
