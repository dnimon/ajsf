import { JsonSchemaFormService } from '@ajsf/core';
export declare class FlexLayoutRootComponent {
    private jsf;
    dataIndex: number[];
    layoutIndex: number[];
    layout: any[];
    isFlexItem: boolean;
    parent: any;
    constructor(jsf: JsonSchemaFormService);
    removeItem(item: any): void;
    getFlexAttribute(node: any, attribute: string): any;
    showWidget(layoutNode: any): boolean;
}
