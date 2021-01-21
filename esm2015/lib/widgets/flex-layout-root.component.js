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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXRzL2ZsZXgtbGF5b3V0LXJvb3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQTBCbkQsTUFBTSxPQUFPLHVCQUF1QjtJQU9sQyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBSjNCLGVBQVUsR0FBRyxLQUFLLENBQUM7SUFLeEIsQ0FBQztJQUVMLFVBQVUsQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxrRUFBa0U7SUFDbEUsZ0JBQWdCLENBQUMsSUFBUyxFQUFFLFNBQWlCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUMxRCxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDOzs7WUFoREYsU0FBUyxTQUFDO2dCQUNULDhDQUE4QztnQkFDOUMsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7OztVQWlCRjtnQkFDUixlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTzthQUNqRDs7O1lBekJRLHFCQUFxQjs7O3dCQTJCM0IsS0FBSzswQkFDTCxLQUFLO3FCQUNMLEtBQUs7eUJBQ0wsS0FBSztxQkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJ0BhanNmL2NvcmUnO1xuXG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnZmxleC1sYXlvdXQtcm9vdC13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgKm5nRm9yPVwibGV0IGxheW91dE5vZGUgb2YgbGF5b3V0OyBsZXQgaSA9IGluZGV4XCJcbiAgICAgIFtjbGFzcy5mb3JtLWZsZXgtaXRlbV09XCJpc0ZsZXhJdGVtXCJcbiAgICAgIFtzdHlsZS5mbGV4LWdyb3ddPVwiZ2V0RmxleEF0dHJpYnV0ZShsYXlvdXROb2RlLCAnZmxleC1ncm93JylcIlxuICAgICAgW3N0eWxlLmZsZXgtc2hyaW5rXT1cImdldEZsZXhBdHRyaWJ1dGUobGF5b3V0Tm9kZSwgJ2ZsZXgtc2hyaW5rJylcIlxuICAgICAgW3N0eWxlLmZsZXgtYmFzaXNdPVwiZ2V0RmxleEF0dHJpYnV0ZShsYXlvdXROb2RlLCAnZmxleC1iYXNpcycpXCJcbiAgICAgIFtzdHlsZS5hbGlnbi1zZWxmXT1cIihsYXlvdXROb2RlPy5vcHRpb25zIHx8IHt9KVsnYWxpZ24tc2VsZiddXCJcbiAgICAgIFtzdHlsZS5vcmRlcl09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5vcmRlclwiXG4gICAgICBbZnhGbGV4XT1cImxheW91dE5vZGU/Lm9wdGlvbnM/LmZ4RmxleFwiXG4gICAgICBbZnhGbGV4T3JkZXJdPVwibGF5b3V0Tm9kZT8ub3B0aW9ucz8uZnhGbGV4T3JkZXJcIlxuICAgICAgW2Z4RmxleE9mZnNldF09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5meEZsZXhPZmZzZXRcIlxuICAgICAgW2Z4RmxleEFsaWduXT1cImxheW91dE5vZGU/Lm9wdGlvbnM/LmZ4RmxleEFsaWduXCI+XG4gICAgICA8c2VsZWN0LWZyYW1ld29yay13aWRnZXQgKm5nSWY9XCJzaG93V2lkZ2V0KGxheW91dE5vZGUpXCJcbiAgICAgICAgW2RhdGFJbmRleF09XCJsYXlvdXROb2RlPy5hcnJheUl0ZW0gPyAoZGF0YUluZGV4IHx8IFtdKS5jb25jYXQoaSkgOiAoZGF0YUluZGV4IHx8IFtdKVwiXG4gICAgICAgIFtsYXlvdXRJbmRleF09XCIobGF5b3V0SW5kZXggfHwgW10pLmNvbmNhdChpKVwiXG4gICAgICAgIFtwYXJlbnRdPVwicGFyZW50XCJcbiAgICAgICAgW2xheW91dE5vZGVdPVwibGF5b3V0Tm9kZVwiPjwvc2VsZWN0LWZyYW1ld29yay13aWRnZXQ+XG4gICAgPGRpdj5gLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG59KVxuZXhwb3J0IGNsYXNzIEZsZXhMYXlvdXRSb290Q29tcG9uZW50IHtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBsYXlvdXQ6IGFueVtdO1xuICBASW5wdXQoKSBpc0ZsZXhJdGVtID0gZmFsc2U7XG4gIEBJbnB1dCgpIHBhcmVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgcmVtb3ZlSXRlbShpdGVtKSB7XG4gICAgdGhpcy5qc2YucmVtb3ZlSXRlbShpdGVtKTtcbiAgfVxuXG4gIC8vIFNldCBhdHRyaWJ1dGVzIGZvciBmbGV4Ym94IGNoaWxkXG4gIC8vIChjb250YWluZXIgYXR0cmlidXRlcyBhcmUgc2V0IGluIGZsZXgtbGF5b3V0LXNlY3Rpb24uY29tcG9uZW50KVxuICBnZXRGbGV4QXR0cmlidXRlKG5vZGU6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpbmRleCA9IFsnZmxleC1ncm93JywgJ2ZsZXgtc2hyaW5rJywgJ2ZsZXgtYmFzaXMnXS5pbmRleE9mKGF0dHJpYnV0ZSk7XG4gICAgcmV0dXJuICgobm9kZS5vcHRpb25zIHx8IHt9KS5mbGV4IHx8ICcnKS5zcGxpdCgvXFxzKy8pW2luZGV4XSB8fFxuICAgICAgKG5vZGUub3B0aW9ucyB8fCB7fSlbYXR0cmlidXRlXSB8fCBbJzEnLCAnMScsICdhdXRvJ11baW5kZXhdO1xuICB9XG5cbiAgc2hvd1dpZGdldChsYXlvdXROb2RlOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5qc2YuZXZhbHVhdGVDb25kaXRpb24obGF5b3V0Tm9kZSwgdGhpcy5kYXRhSW5kZXgpO1xuICB9XG59XG4iXX0=