import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export class FlexLayoutRootComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.isFlexItem = false;
    }
    removeItem(item) {
        this.jsf.removeItem(item);
    }
    // Set attributes for flexbox child
    // (container attributes are set in flex-layout-section.component)
    getFlexAttribute(node, attribute) {
        const index = ['flex-grow', 'flex-shrink', 'flex-basis'].indexOf(attribute);
        return ((node.options || {}).flex || '').split(/\s+/)[index] ||
            (node.options || {})[attribute] || ['1', '1', 'auto'][index];
    }
    showWidget(layoutNode) {
        return this.jsf.evaluateCondition(layoutNode, this.dataIndex);
    }
}
FlexLayoutRootComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'flex-layout-root-widget',
                template: `
    <div *ngFor="let layoutNode of layout; let i = index"
      [class.form-flex-item]="isFlexItem"
      [ngClass]="layoutNode?.options.layoutHtmlClass"
      [style.flex-grow]="getFlexAttribute(layoutNode, 'flex-grow')"
      [style.flex-shrink]="getFlexAttribute(layoutNode, 'flex-shrink')"
      [style.flex-basis]="getFlexAttribute(layoutNode, 'flex-basis')"
      [style.align-self]="(layoutNode?.options || {})['align-self']"
      [style.order]="layoutNode?.options?.order"
      [fxFlex]="layoutNode?.options?.fxFlex"
      [fxFlexOrder]="layoutNode?.options?.fxFlexOrder"
      [fxFlexOffset]="layoutNode?.options?.fxFlexOffset"
      [fxFlexAlign]="layoutNode?.options?.fxFlexAlign">
      <select-framework-widget *ngIf="showWidget(layoutNode)"
        [dataIndex]="layoutNode?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [parent]="parent"
        [layoutNode]="layoutNode"></select-framework-widget>
    <div>`,
                changeDetection: ChangeDetectionStrategy.Default
            },] }
];
FlexLayoutRootComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
FlexLayoutRootComponent.propDecorators = {
    dataIndex: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    layout: [{ type: Input }],
    isFlexItem: [{ type: Input }],
    parent: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXRzL2ZsZXgtbGF5b3V0LXJvb3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQTJCbkQsTUFBTSxPQUFPLHVCQUF1QjtJQU9sQyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBSjNCLGVBQVUsR0FBRyxLQUFLLENBQUM7SUFLeEIsQ0FBQztJQUVMLFVBQVUsQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxrRUFBa0U7SUFDbEUsZ0JBQWdCLENBQUMsSUFBUyxFQUFFLFNBQWlCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUMxRCxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDOzs7WUFqREYsU0FBUyxTQUFDO2dCQUNULDhDQUE4QztnQkFDOUMsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFrQkY7Z0JBQ1IsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87YUFDakQ7OztZQTFCUSxxQkFBcUI7Ozt3QkE0QjNCLEtBQUs7MEJBQ0wsS0FBSztxQkFDTCxLQUFLO3lCQUNMLEtBQUs7cUJBQ0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICdAYWpzZi9jb3JlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ2ZsZXgtbGF5b3V0LXJvb3Qtd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2ICpuZ0Zvcj1cImxldCBsYXlvdXROb2RlIG9mIGxheW91dDsgbGV0IGkgPSBpbmRleFwiXG4gICAgICBbY2xhc3MuZm9ybS1mbGV4LWl0ZW1dPVwiaXNGbGV4SXRlbVwiXG4gICAgICBbbmdDbGFzc109XCJsYXlvdXROb2RlPy5vcHRpb25zLmxheW91dEh0bWxDbGFzc1wiXG4gICAgICBbc3R5bGUuZmxleC1ncm93XT1cImdldEZsZXhBdHRyaWJ1dGUobGF5b3V0Tm9kZSwgJ2ZsZXgtZ3JvdycpXCJcbiAgICAgIFtzdHlsZS5mbGV4LXNocmlua109XCJnZXRGbGV4QXR0cmlidXRlKGxheW91dE5vZGUsICdmbGV4LXNocmluaycpXCJcbiAgICAgIFtzdHlsZS5mbGV4LWJhc2lzXT1cImdldEZsZXhBdHRyaWJ1dGUobGF5b3V0Tm9kZSwgJ2ZsZXgtYmFzaXMnKVwiXG4gICAgICBbc3R5bGUuYWxpZ24tc2VsZl09XCIobGF5b3V0Tm9kZT8ub3B0aW9ucyB8fCB7fSlbJ2FsaWduLXNlbGYnXVwiXG4gICAgICBbc3R5bGUub3JkZXJdPVwibGF5b3V0Tm9kZT8ub3B0aW9ucz8ub3JkZXJcIlxuICAgICAgW2Z4RmxleF09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5meEZsZXhcIlxuICAgICAgW2Z4RmxleE9yZGVyXT1cImxheW91dE5vZGU/Lm9wdGlvbnM/LmZ4RmxleE9yZGVyXCJcbiAgICAgIFtmeEZsZXhPZmZzZXRdPVwibGF5b3V0Tm9kZT8ub3B0aW9ucz8uZnhGbGV4T2Zmc2V0XCJcbiAgICAgIFtmeEZsZXhBbGlnbl09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5meEZsZXhBbGlnblwiPlxuICAgICAgPHNlbGVjdC1mcmFtZXdvcmstd2lkZ2V0ICpuZ0lmPVwic2hvd1dpZGdldChsYXlvdXROb2RlKVwiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwibGF5b3V0Tm9kZT8uYXJyYXlJdGVtID8gKGRhdGFJbmRleCB8fCBbXSkuY29uY2F0KGkpIDogKGRhdGFJbmRleCB8fCBbXSlcIlxuICAgICAgICBbbGF5b3V0SW5kZXhdPVwiKGxheW91dEluZGV4IHx8IFtdKS5jb25jYXQoaSlcIlxuICAgICAgICBbcGFyZW50XT1cInBhcmVudFwiXG4gICAgICAgIFtsYXlvdXROb2RlXT1cImxheW91dE5vZGVcIj48L3NlbGVjdC1mcmFtZXdvcmstd2lkZ2V0PlxuICAgIDxkaXY+YCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxufSlcbmV4cG9ydCBjbGFzcyBGbGV4TGF5b3V0Um9vdENvbXBvbmVudCB7XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgbGF5b3V0OiBhbnlbXTtcbiAgQElucHV0KCkgaXNGbGV4SXRlbSA9IGZhbHNlO1xuICBASW5wdXQoKSBwYXJlbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIHJlbW92ZUl0ZW0oaXRlbSkge1xuICAgIHRoaXMuanNmLnJlbW92ZUl0ZW0oaXRlbSk7XG4gIH1cblxuICAvLyBTZXQgYXR0cmlidXRlcyBmb3IgZmxleGJveCBjaGlsZFxuICAvLyAoY29udGFpbmVyIGF0dHJpYnV0ZXMgYXJlIHNldCBpbiBmbGV4LWxheW91dC1zZWN0aW9uLmNvbXBvbmVudClcbiAgZ2V0RmxleEF0dHJpYnV0ZShub2RlOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgaW5kZXggPSBbJ2ZsZXgtZ3JvdycsICdmbGV4LXNocmluaycsICdmbGV4LWJhc2lzJ10uaW5kZXhPZihhdHRyaWJ1dGUpO1xuICAgIHJldHVybiAoKG5vZGUub3B0aW9ucyB8fCB7fSkuZmxleCB8fCAnJykuc3BsaXQoL1xccysvKVtpbmRleF0gfHxcbiAgICAgIChub2RlLm9wdGlvbnMgfHwge30pW2F0dHJpYnV0ZV0gfHwgWycxJywgJzEnLCAnYXV0byddW2luZGV4XTtcbiAgfVxuXG4gIHNob3dXaWRnZXQobGF5b3V0Tm9kZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuanNmLmV2YWx1YXRlQ29uZGl0aW9uKGxheW91dE5vZGUsIHRoaXMuZGF0YUluZGV4KTtcbiAgfVxufVxuIl19