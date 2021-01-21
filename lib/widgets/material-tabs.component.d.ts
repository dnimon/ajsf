import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export declare class MaterialTabsComponent implements OnInit {
    private jsf;
    options: any;
    itemCount: number;
    selectedItem: number;
    showAddTab: boolean;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    select(index: any): void;
    updateControl(): void;
    setTabTitle(item: any, index: number): string;
}
