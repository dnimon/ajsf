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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtdGFicy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXRzL21hdGVyaWFsLXRhYnMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQTBCbkQsTUFBTSxPQUFPLHFCQUFxQjtJQVNoQyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBUHBDLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxJQUFJLENBQUM7SUFPZCxDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLO1FBQ1YsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1lBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2dCQUNmLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQ3hDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQzNDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDeEMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3RCO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUVELGFBQWE7UUFDWCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksS0FBSyxNQUFNO1lBQ3hDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsV0FBVyxDQUFDLElBQVMsRUFBRSxLQUFhO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7OztZQWhFRixTQUFTLFNBQUM7Z0JBQ1QsOENBQThDO2dCQUM5QyxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQWtCRDt5QkFDQSwwQkFBMEI7YUFDcEM7OztZQXpCUSxxQkFBcUI7Ozt5QkErQjNCLEtBQUs7MEJBQ0wsS0FBSzt3QkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICdAYWpzZi9jb3JlJztcblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdtYXRlcmlhbC10YWJzLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5hdiBtYXQtdGFiLW5hdi1iYXJcbiAgICAgIFthdHRyLmFyaWEtbGFiZWxdPVwib3B0aW9ucz8ubGFiZWwgfHwgb3B0aW9ucz8udGl0bGUgfHwgJydcIlxuICAgICAgW3N0eWxlLndpZHRoXT1cIicxMDAlJ1wiPlxuICAgICAgICA8YSBtYXQtdGFiLWxpbmsgKm5nRm9yPVwibGV0IGl0ZW0gb2YgbGF5b3V0Tm9kZT8uaXRlbXM7IGxldCBpID0gaW5kZXhcIlxuICAgICAgICAgIFthY3RpdmVdPVwic2VsZWN0ZWRJdGVtID09PSBpXCJcbiAgICAgICAgICAoY2xpY2spPVwic2VsZWN0KGkpXCI+XG4gICAgICAgICAgPHNwYW4gKm5nSWY9XCJzaG93QWRkVGFiIHx8IGl0ZW0udHlwZSAhPT0gJyRyZWYnXCJcbiAgICAgICAgICAgIFtpbm5lckhUTUxdPVwic2V0VGFiVGl0bGUoaXRlbSwgaSlcIj48L3NwYW4+XG4gICAgICAgIDwvYT5cbiAgICA8L25hdj5cbiAgICA8ZGl2ICpuZ0Zvcj1cImxldCBsYXlvdXRJdGVtIG9mIGxheW91dE5vZGU/Lml0ZW1zOyBsZXQgaSA9IGluZGV4XCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIj5cbiAgICAgIDxzZWxlY3QtZnJhbWV3b3JrLXdpZGdldCAqbmdJZj1cInNlbGVjdGVkSXRlbSA9PT0gaVwiXG4gICAgICAgIFtjbGFzc109XCIob3B0aW9ucz8uZmllbGRIdG1sQ2xhc3MgfHwgJycpICsgJyAnICsgKG9wdGlvbnM/LmFjdGl2ZUNsYXNzIHx8ICcnKSArICcgJyArIChvcHRpb25zPy5zdHlsZT8uc2VsZWN0ZWQgfHwgJycpXCJcbiAgICAgICAgW2RhdGFJbmRleF09XCJsYXlvdXROb2RlPy5kYXRhVHlwZSA9PT0gJ2FycmF5JyA/IChkYXRhSW5kZXggfHwgW10pLmNvbmNhdChpKSA6IGRhdGFJbmRleFwiXG4gICAgICAgIFtsYXlvdXRJbmRleF09XCIobGF5b3V0SW5kZXggfHwgW10pLmNvbmNhdChpKVwiXG4gICAgICAgIFtsYXlvdXROb2RlXT1cImxheW91dEl0ZW1cIj48L3NlbGVjdC1mcmFtZXdvcmstd2lkZ2V0PlxuICAgIDwvZGl2PmAsXG4gIHN0eWxlczogW2AgYSB7IGN1cnNvcjogcG9pbnRlcjsgfSBgXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxUYWJzQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgb3B0aW9uczogYW55O1xuICBpdGVtQ291bnQ6IG51bWJlcjtcbiAgc2VsZWN0ZWRJdGVtID0gMDtcbiAgc2hvd0FkZFRhYiA9IHRydWU7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLml0ZW1Db3VudCA9IHRoaXMubGF5b3V0Tm9kZS5pdGVtcy5sZW5ndGggLSAxO1xuICAgIHRoaXMudXBkYXRlQ29udHJvbCgpO1xuICB9XG5cbiAgc2VsZWN0KGluZGV4KSB7XG4gICAgaWYgKHRoaXMubGF5b3V0Tm9kZS5pdGVtc1tpbmRleF0udHlwZSA9PT0gJyRyZWYnKSB7XG4gICAgICB0aGlzLmpzZi5hZGRJdGVtKHtcbiAgICAgICAgbGF5b3V0Tm9kZTogdGhpcy5sYXlvdXROb2RlLml0ZW1zW2luZGV4XSxcbiAgICAgICAgbGF5b3V0SW5kZXg6IHRoaXMubGF5b3V0SW5kZXguY29uY2F0KGluZGV4KSxcbiAgICAgICAgZGF0YUluZGV4OiB0aGlzLmRhdGFJbmRleC5jb25jYXQoaW5kZXgpXG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlQ29udHJvbCgpO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IGluZGV4O1xuICB9XG5cbiAgdXBkYXRlQ29udHJvbCgpIHtcbiAgICB0aGlzLml0ZW1Db3VudCA9IHRoaXMubGF5b3V0Tm9kZS5pdGVtcy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IGxhc3RJdGVtID0gdGhpcy5sYXlvdXROb2RlLml0ZW1zW3RoaXMubGF5b3V0Tm9kZS5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLnNob3dBZGRUYWIgPSBsYXN0SXRlbS50eXBlID09PSAnJHJlZicgJiZcbiAgICAgIHRoaXMuaXRlbUNvdW50IDwgKGxhc3RJdGVtLm9wdGlvbnMubWF4SXRlbXMgfHwgMTAwMCk7XG4gIH1cblxuICBzZXRUYWJUaXRsZShpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmpzZi5zZXRBcnJheUl0ZW1UaXRsZSh0aGlzLCBpdGVtLCBpbmRleCk7XG4gIH1cbn1cbiJdfQ==