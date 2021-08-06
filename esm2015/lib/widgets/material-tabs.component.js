import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export class MaterialTabsComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.selectedItem = 0;
        this.showAddTab = true;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.itemCount = this.layoutNode.items.length - 1;
        this.updateControl();
    }
    select(index) {
        if (this.layoutNode.items[index].type === '$ref') {
            this.jsf.addItem({
                layoutNode: this.layoutNode.items[index],
                layoutIndex: this.layoutIndex.concat(index),
                dataIndex: this.dataIndex.concat(index)
            });
            this.updateControl();
        }
        this.selectedItem = index;
    }
    updateControl() {
        this.itemCount = this.layoutNode.items.length - 1;
        const lastItem = this.layoutNode.items[this.layoutNode.items.length - 1];
        this.showAddTab = lastItem.type === '$ref' &&
            this.itemCount < (lastItem.options.maxItems || 1000);
    }
    setTabTitle(item, index) {
        return this.jsf.setArrayItemTitle(this, item, index);
    }
}
MaterialTabsComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-tabs-widget',
                template: `
    <nav mat-tab-nav-bar
      [attr.aria-label]="options?.label || options?.title || ''"
      [style.width]="'100%'">
        <a mat-tab-link *ngFor="let item of layoutNode?.items; let i = index"
          [active]="selectedItem === i"
          (click)="select(i)">
          <span *ngIf="showAddTab || item.type !== '$ref'"
            [innerHTML]="setTabTitle(item, i)"></span>
        </a>
    </nav>
    <div *ngFor="let layoutItem of layoutNode?.items; let i = index"
      [class]="options?.htmlClass || ''">
      <select-framework-widget *ngIf="selectedItem === i"
        [class]="(options?.fieldHtmlClass || '') + ' ' + (options?.activeClass || '') + ' ' + (options?.style?.selected || '')"
        [dataIndex]="layoutNode?.dataType === 'array' ? (dataIndex || []).concat(i) : dataIndex"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [layoutNode]="layoutItem"></select-framework-widget>
    </div>`,
                styles: [` a { cursor: pointer; } `]
            },] }
];
MaterialTabsComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialTabsComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtdGFicy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC10YWJzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUEwQm5ELE1BQU0sT0FBTyxxQkFBcUI7SUFTaEMsWUFDVSxHQUEwQjtRQUExQixRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQVBwQyxpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUNqQixlQUFVLEdBQUcsSUFBSSxDQUFDO0lBT2QsQ0FBQztJQUVMLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSztRQUNWLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtZQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztnQkFDZixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUN4QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUMzQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ3hDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN0QjtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzVCLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEtBQUssTUFBTTtZQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFTLEVBQUUsS0FBYTtRQUNsQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDOzs7WUFoRUYsU0FBUyxTQUFDO2dCQUNULDhDQUE4QztnQkFDOUMsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FrQkQ7eUJBQ0EsMEJBQTBCO2FBQ3BDOzs7WUF6QlEscUJBQXFCOzs7eUJBK0IzQixLQUFLOzBCQUNMLEtBQUs7d0JBQ0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtdGFicy13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuYXYgbWF0LXRhYi1uYXYtYmFyXG4gICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cIm9wdGlvbnM/LmxhYmVsIHx8IG9wdGlvbnM/LnRpdGxlIHx8ICcnXCJcbiAgICAgIFtzdHlsZS53aWR0aF09XCInMTAwJSdcIj5cbiAgICAgICAgPGEgbWF0LXRhYi1saW5rICpuZ0Zvcj1cImxldCBpdGVtIG9mIGxheW91dE5vZGU/Lml0ZW1zOyBsZXQgaSA9IGluZGV4XCJcbiAgICAgICAgICBbYWN0aXZlXT1cInNlbGVjdGVkSXRlbSA9PT0gaVwiXG4gICAgICAgICAgKGNsaWNrKT1cInNlbGVjdChpKVwiPlxuICAgICAgICAgIDxzcGFuICpuZ0lmPVwic2hvd0FkZFRhYiB8fCBpdGVtLnR5cGUgIT09ICckcmVmJ1wiXG4gICAgICAgICAgICBbaW5uZXJIVE1MXT1cInNldFRhYlRpdGxlKGl0ZW0sIGkpXCI+PC9zcGFuPlxuICAgICAgICA8L2E+XG4gICAgPC9uYXY+XG4gICAgPGRpdiAqbmdGb3I9XCJsZXQgbGF5b3V0SXRlbSBvZiBsYXlvdXROb2RlPy5pdGVtczsgbGV0IGkgPSBpbmRleFwiXG4gICAgICBbY2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCI+XG4gICAgICA8c2VsZWN0LWZyYW1ld29yay13aWRnZXQgKm5nSWY9XCJzZWxlY3RlZEl0ZW0gPT09IGlcIlxuICAgICAgICBbY2xhc3NdPVwiKG9wdGlvbnM/LmZpZWxkSHRtbENsYXNzIHx8ICcnKSArICcgJyArIChvcHRpb25zPy5hY3RpdmVDbGFzcyB8fCAnJykgKyAnICcgKyAob3B0aW9ucz8uc3R5bGU/LnNlbGVjdGVkIHx8ICcnKVwiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwibGF5b3V0Tm9kZT8uZGF0YVR5cGUgPT09ICdhcnJheScgPyAoZGF0YUluZGV4IHx8IFtdKS5jb25jYXQoaSkgOiBkYXRhSW5kZXhcIlxuICAgICAgICBbbGF5b3V0SW5kZXhdPVwiKGxheW91dEluZGV4IHx8IFtdKS5jb25jYXQoaSlcIlxuICAgICAgICBbbGF5b3V0Tm9kZV09XCJsYXlvdXRJdGVtXCI+PC9zZWxlY3QtZnJhbWV3b3JrLXdpZGdldD5cbiAgICA8L2Rpdj5gLFxuICBzdHlsZXM6IFtgIGEgeyBjdXJzb3I6IHBvaW50ZXI7IH0gYF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsVGFic0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIG9wdGlvbnM6IGFueTtcbiAgaXRlbUNvdW50OiBudW1iZXI7XG4gIHNlbGVjdGVkSXRlbSA9IDA7XG4gIHNob3dBZGRUYWIgPSB0cnVlO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5pdGVtQ291bnQgPSB0aGlzLmxheW91dE5vZGUuaXRlbXMubGVuZ3RoIC0gMTtcbiAgICB0aGlzLnVwZGF0ZUNvbnRyb2woKTtcbiAgfVxuXG4gIHNlbGVjdChpbmRleCkge1xuICAgIGlmICh0aGlzLmxheW91dE5vZGUuaXRlbXNbaW5kZXhdLnR5cGUgPT09ICckcmVmJykge1xuICAgICAgdGhpcy5qc2YuYWRkSXRlbSh7XG4gICAgICAgIGxheW91dE5vZGU6IHRoaXMubGF5b3V0Tm9kZS5pdGVtc1tpbmRleF0sXG4gICAgICAgIGxheW91dEluZGV4OiB0aGlzLmxheW91dEluZGV4LmNvbmNhdChpbmRleCksXG4gICAgICAgIGRhdGFJbmRleDogdGhpcy5kYXRhSW5kZXguY29uY2F0KGluZGV4KVxuICAgICAgfSk7XG4gICAgICB0aGlzLnVwZGF0ZUNvbnRyb2woKTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSBpbmRleDtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRyb2woKSB7XG4gICAgdGhpcy5pdGVtQ291bnQgPSB0aGlzLmxheW91dE5vZGUuaXRlbXMubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBsYXN0SXRlbSA9IHRoaXMubGF5b3V0Tm9kZS5pdGVtc1t0aGlzLmxheW91dE5vZGUuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgdGhpcy5zaG93QWRkVGFiID0gbGFzdEl0ZW0udHlwZSA9PT0gJyRyZWYnICYmXG4gICAgICB0aGlzLml0ZW1Db3VudCA8IChsYXN0SXRlbS5vcHRpb25zLm1heEl0ZW1zIHx8IDEwMDApO1xuICB9XG5cbiAgc2V0VGFiVGl0bGUoaXRlbTogYW55LCBpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5qc2Yuc2V0QXJyYXlJdGVtVGl0bGUodGhpcywgaXRlbSwgaW5kZXgpO1xuICB9XG59XG4iXX0=