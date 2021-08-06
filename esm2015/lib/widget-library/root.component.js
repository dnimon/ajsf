import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export class RootComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.isFlexItem = false;
        this.selectFrameworkWidgets = [];
    }
    isDraggable(node) {
        return node.arrayItem && node.type !== '$ref' &&
            node.arrayItemType === 'list' && this.isOrderable !== false;
    }
    // Set attributes for flexbox child
    // (container attributes are set in section.component)
    getFlexAttribute(node, attribute) {
        const index = ['flex-grow', 'flex-shrink', 'flex-basis'].indexOf(attribute);
        return ((node.options || {}).flex || '').split(/\s+/)[index] ||
            (node.options || {})[attribute] || ['1', '1', 'auto'][index];
    }
    showWidget(layoutNode) {
        return this.jsf.evaluateCondition(layoutNode, this.dataIndex);
    }
}
RootComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'root-widget',
                template: `
    <div *ngFor="let layoutItem of layout; let i = index"
      [class.form-flex-item]="isFlexItem"
      [style.align-self]="(layoutItem.options || {})['align-self']"
      [style.flex-basis]="getFlexAttribute(layoutItem, 'flex-basis')"
      [style.flex-grow]="getFlexAttribute(layoutItem, 'flex-grow')"
      [style.flex-shrink]="getFlexAttribute(layoutItem, 'flex-shrink')"
      [style.order]="(layoutItem.options || {}).order">
      <div
        [dataIndex]="layoutItem?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [layoutNode]="layoutItem"
        [orderable]="isDraggable(layoutItem)">
        <select-framework-widget *ngIf="showWidget(layoutItem)"
          [dataIndex]="layoutItem?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])"
          [layoutIndex]="(layoutIndex || []).concat(i)"
          [parent]="this"
          [layoutNode]="layoutItem"></select-framework-widget>
      </div>
    </div>`,
                styles: [`
    [draggable=true] {
      transition: all 150ms cubic-bezier(.4, 0, .2, 1);
    }
    [draggable=true]:hover {
      cursor: move;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      position: relative; z-index: 10;
      margin-top: -1px;
      margin-left: -1px;
      margin-right: 1px;
      margin-bottom: 1px;
    }
    [draggable=true].drag-target-top {
      box-shadow: 0 -2px 0 #000;
      position: relative; z-index: 20;
    }
    [draggable=true].drag-target-bottom {
      box-shadow: 0 2px 0 #000;
      position: relative; z-index: 20;
    }
  `]
            },] }
];
RootComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
RootComponent.propDecorators = {
    dataIndex: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    layout: [{ type: Input }],
    isOrderable: [{ type: Input }],
    isFlexItem: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWNvcmUvc3JjL2xpYi93aWRnZXQtbGlicmFyeS9yb290LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDL0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFpRHBFLE1BQU0sT0FBTyxhQUFhO0lBU3hCLFlBQ1UsR0FBMEI7UUFBMUIsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFKM0IsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUM1QiwyQkFBc0IsR0FBRyxFQUFFLENBQUM7SUFJeEIsQ0FBQztJQUVMLFdBQVcsQ0FBQyxJQUFTO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU07WUFDM0MsSUFBSSxDQUFDLGFBQWEsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUM7SUFDaEUsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxzREFBc0Q7SUFDdEQsZ0JBQWdCLENBQUMsSUFBUyxFQUFFLFNBQWlCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUMxRCxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDOzs7WUExRUYsU0FBUyxTQUFDO2dCQUNULDhDQUE4QztnQkFDOUMsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW1CRDt5QkFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJSO2FBQ0Y7OztZQWhEUSxxQkFBcUI7Ozt3QkFtRDNCLEtBQUs7MEJBQ0wsS0FBSztxQkFDTCxLQUFLOzBCQUNMLEtBQUs7eUJBQ0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIFZpZXdDaGlsZHJlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ3Jvb3Qtd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2ICpuZ0Zvcj1cImxldCBsYXlvdXRJdGVtIG9mIGxheW91dDsgbGV0IGkgPSBpbmRleFwiXG4gICAgICBbY2xhc3MuZm9ybS1mbGV4LWl0ZW1dPVwiaXNGbGV4SXRlbVwiXG4gICAgICBbc3R5bGUuYWxpZ24tc2VsZl09XCIobGF5b3V0SXRlbS5vcHRpb25zIHx8IHt9KVsnYWxpZ24tc2VsZiddXCJcbiAgICAgIFtzdHlsZS5mbGV4LWJhc2lzXT1cImdldEZsZXhBdHRyaWJ1dGUobGF5b3V0SXRlbSwgJ2ZsZXgtYmFzaXMnKVwiXG4gICAgICBbc3R5bGUuZmxleC1ncm93XT1cImdldEZsZXhBdHRyaWJ1dGUobGF5b3V0SXRlbSwgJ2ZsZXgtZ3JvdycpXCJcbiAgICAgIFtzdHlsZS5mbGV4LXNocmlua109XCJnZXRGbGV4QXR0cmlidXRlKGxheW91dEl0ZW0sICdmbGV4LXNocmluaycpXCJcbiAgICAgIFtzdHlsZS5vcmRlcl09XCIobGF5b3V0SXRlbS5vcHRpb25zIHx8IHt9KS5vcmRlclwiPlxuICAgICAgPGRpdlxuICAgICAgICBbZGF0YUluZGV4XT1cImxheW91dEl0ZW0/LmFycmF5SXRlbSA/IChkYXRhSW5kZXggfHwgW10pLmNvbmNhdChpKSA6IChkYXRhSW5kZXggfHwgW10pXCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cIihsYXlvdXRJbmRleCB8fCBbXSkuY29uY2F0KGkpXCJcbiAgICAgICAgW2xheW91dE5vZGVdPVwibGF5b3V0SXRlbVwiXG4gICAgICAgIFtvcmRlcmFibGVdPVwiaXNEcmFnZ2FibGUobGF5b3V0SXRlbSlcIj5cbiAgICAgICAgPHNlbGVjdC1mcmFtZXdvcmstd2lkZ2V0ICpuZ0lmPVwic2hvd1dpZGdldChsYXlvdXRJdGVtKVwiXG4gICAgICAgICAgW2RhdGFJbmRleF09XCJsYXlvdXRJdGVtPy5hcnJheUl0ZW0gPyAoZGF0YUluZGV4IHx8IFtdKS5jb25jYXQoaSkgOiAoZGF0YUluZGV4IHx8IFtdKVwiXG4gICAgICAgICAgW2xheW91dEluZGV4XT1cIihsYXlvdXRJbmRleCB8fCBbXSkuY29uY2F0KGkpXCJcbiAgICAgICAgICBbcGFyZW50XT1cInRoaXNcIlxuICAgICAgICAgIFtsYXlvdXROb2RlXT1cImxheW91dEl0ZW1cIj48L3NlbGVjdC1mcmFtZXdvcmstd2lkZ2V0PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YCxcbiAgc3R5bGVzOiBbYFxuICAgIFtkcmFnZ2FibGU9dHJ1ZV0ge1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDE1MG1zIGN1YmljLWJlemllciguNCwgMCwgLjIsIDEpO1xuICAgIH1cbiAgICBbZHJhZ2dhYmxlPXRydWVdOmhvdmVyIHtcbiAgICAgIGN1cnNvcjogbW92ZTtcbiAgICAgIGJveC1zaGFkb3c6IDJweCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgei1pbmRleDogMTA7XG4gICAgICBtYXJnaW4tdG9wOiAtMXB4O1xuICAgICAgbWFyZ2luLWxlZnQ6IC0xcHg7XG4gICAgICBtYXJnaW4tcmlnaHQ6IDFweDtcbiAgICAgIG1hcmdpbi1ib3R0b206IDFweDtcbiAgICB9XG4gICAgW2RyYWdnYWJsZT10cnVlXS5kcmFnLXRhcmdldC10b3Age1xuICAgICAgYm94LXNoYWRvdzogMCAtMnB4IDAgIzAwMDtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgei1pbmRleDogMjA7XG4gICAgfVxuICAgIFtkcmFnZ2FibGU9dHJ1ZV0uZHJhZy10YXJnZXQtYm90dG9tIHtcbiAgICAgIGJveC1zaGFkb3c6IDAgMnB4IDAgIzAwMDtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgei1pbmRleDogMjA7XG4gICAgfVxuICBgXSxcbn0pXG5leHBvcnQgY2xhc3MgUm9vdENvbXBvbmVudCB7XG4gIG9wdGlvbnM6IGFueTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBsYXlvdXQ6IGFueVtdO1xuICBASW5wdXQoKSBpc09yZGVyYWJsZTogYm9vbGVhbjtcbiAgQElucHV0KCkgaXNGbGV4SXRlbSA9IGZhbHNlO1xuICBzZWxlY3RGcmFtZXdvcmtXaWRnZXRzID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIGlzRHJhZ2dhYmxlKG5vZGU6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBub2RlLmFycmF5SXRlbSAmJiBub2RlLnR5cGUgIT09ICckcmVmJyAmJlxuICAgICAgbm9kZS5hcnJheUl0ZW1UeXBlID09PSAnbGlzdCcgJiYgdGhpcy5pc09yZGVyYWJsZSAhPT0gZmFsc2U7XG4gIH1cblxuICAvLyBTZXQgYXR0cmlidXRlcyBmb3IgZmxleGJveCBjaGlsZFxuICAvLyAoY29udGFpbmVyIGF0dHJpYnV0ZXMgYXJlIHNldCBpbiBzZWN0aW9uLmNvbXBvbmVudClcbiAgZ2V0RmxleEF0dHJpYnV0ZShub2RlOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgaW5kZXggPSBbJ2ZsZXgtZ3JvdycsICdmbGV4LXNocmluaycsICdmbGV4LWJhc2lzJ10uaW5kZXhPZihhdHRyaWJ1dGUpO1xuICAgIHJldHVybiAoKG5vZGUub3B0aW9ucyB8fCB7fSkuZmxleCB8fCAnJykuc3BsaXQoL1xccysvKVtpbmRleF0gfHxcbiAgICAgIChub2RlLm9wdGlvbnMgfHwge30pW2F0dHJpYnV0ZV0gfHwgWycxJywgJzEnLCAnYXV0byddW2luZGV4XTtcbiAgfVxuXG4gIHNob3dXaWRnZXQobGF5b3V0Tm9kZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuanNmLmV2YWx1YXRlQ29uZGl0aW9uKGxheW91dE5vZGUsIHRoaXMuZGF0YUluZGV4KTtcbiAgfVxufVxuIl19