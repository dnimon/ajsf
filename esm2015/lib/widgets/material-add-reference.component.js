import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export class MaterialAddReferenceComponent {
    constructor(jsf) {
        this.jsf = jsf;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
    }
    get showAddButton() {
        return !this.layoutNode.arrayItem ||
            this.layoutIndex[this.layoutIndex.length - 1] < this.options.maxItems;
    }
    addItem(event) {
        event.preventDefault();
        this.jsf.addItem(this);
    }
    get buttonText() {
        const parent = {
            dataIndex: this.dataIndex.slice(0, -1),
            layoutIndex: this.layoutIndex.slice(0, -1),
            layoutNode: this.jsf.getParentNode(this),
        };
        return parent.layoutNode.add ||
            this.jsf.setArrayItemTitle(parent, this.layoutNode, this.itemCount);
    }
}
MaterialAddReferenceComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-add-reference-widget',
                template: `
    <section [class]="options?.htmlClass || ''" align="end">
      <button mat-raised-button *ngIf="showAddButton"
        [color]="options?.color || 'accent'"
        [disabled]="options?.readonly"
        (click)="addItem($event)">
        <span *ngIf="options?.icon" [class]="options?.icon"></span>
        <span *ngIf="options?.title" [innerHTML]="buttonText"></span>
      </button>
    </section>`,
                changeDetection: ChangeDetectionStrategy.Default
            },] }
];
MaterialAddReferenceComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialAddReferenceComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1hZGQtcmVmZXJlbmNlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUNsRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFrQm5ELE1BQU0sT0FBTyw2QkFBNkI7SUFTeEMsWUFDVSxHQUEwQjtRQUExQixRQUFHLEdBQUgsR0FBRyxDQUF1QjtJQUNoQyxDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDMUUsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFLO1FBQ1gsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixNQUFNLE1BQU0sR0FBUTtZQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztTQUN6QyxDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUc7WUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEUsQ0FBQzs7O1lBbERGLFNBQVMsU0FBQztnQkFDVCw4Q0FBOEM7Z0JBQzlDLFFBQVEsRUFBRSwrQkFBK0I7Z0JBQ3pDLFFBQVEsRUFBRTs7Ozs7Ozs7O2VBU0c7Z0JBQ2IsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87YUFDakQ7OztZQWpCUSxxQkFBcUI7Ozt5QkF1QjNCLEtBQUs7MEJBQ0wsS0FBSzt3QkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdtYXRlcmlhbC1hZGQtcmVmZXJlbmNlLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHNlY3Rpb24gW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiIGFsaWduPVwiZW5kXCI+XG4gICAgICA8YnV0dG9uIG1hdC1yYWlzZWQtYnV0dG9uICpuZ0lmPVwic2hvd0FkZEJ1dHRvblwiXG4gICAgICAgIFtjb2xvcl09XCJvcHRpb25zPy5jb2xvciB8fCAnYWNjZW50J1wiXG4gICAgICAgIFtkaXNhYmxlZF09XCJvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgIChjbGljayk9XCJhZGRJdGVtKCRldmVudClcIj5cbiAgICAgICAgPHNwYW4gKm5nSWY9XCJvcHRpb25zPy5pY29uXCIgW2NsYXNzXT1cIm9wdGlvbnM/Lmljb25cIj48L3NwYW4+XG4gICAgICAgIDxzcGFuICpuZ0lmPVwib3B0aW9ucz8udGl0bGVcIiBbaW5uZXJIVE1MXT1cImJ1dHRvblRleHRcIj48L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L3NlY3Rpb24+YCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIG9wdGlvbnM6IGFueTtcbiAgaXRlbUNvdW50OiBudW1iZXI7XG4gIHByZXZpb3VzTGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBwcmV2aW91c0RhdGFJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgfVxuXG4gIGdldCBzaG93QWRkQnV0dG9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5sYXlvdXROb2RlLmFycmF5SXRlbSB8fFxuICAgICAgdGhpcy5sYXlvdXRJbmRleFt0aGlzLmxheW91dEluZGV4Lmxlbmd0aCAtIDFdIDwgdGhpcy5vcHRpb25zLm1heEl0ZW1zO1xuICB9XG5cbiAgYWRkSXRlbShldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5qc2YuYWRkSXRlbSh0aGlzKTtcbiAgfVxuXG4gIGdldCBidXR0b25UZXh0KCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyZW50OiBhbnkgPSB7XG4gICAgICBkYXRhSW5kZXg6IHRoaXMuZGF0YUluZGV4LnNsaWNlKDAsIC0xKSxcbiAgICAgIGxheW91dEluZGV4OiB0aGlzLmxheW91dEluZGV4LnNsaWNlKDAsIC0xKSxcbiAgICAgIGxheW91dE5vZGU6IHRoaXMuanNmLmdldFBhcmVudE5vZGUodGhpcyksXG4gICAgfTtcbiAgICByZXR1cm4gcGFyZW50LmxheW91dE5vZGUuYWRkIHx8XG4gICAgICB0aGlzLmpzZi5zZXRBcnJheUl0ZW1UaXRsZShwYXJlbnQsIHRoaXMubGF5b3V0Tm9kZSwgdGhpcy5pdGVtQ291bnQpO1xuICB9XG59XG4iXX0=