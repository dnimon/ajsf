import { buildTitleMap } from '@ajsf/core';
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
// TODO: Change this to use a Selection List instead?
// https://material.angular.io/components/list/overview
export class MaterialCheckboxesComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.horizontalList = false;
        this.checkboxList = [];
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.horizontalList = this.layoutNode.type === 'checkboxes-inline' ||
            this.layoutNode.type === 'checkboxbuttons';
        this.jsf.initializeControl(this);
        this.checkboxList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        if (this.boundControl) {
            const formArray = this.jsf.getFormControl(this);
            for (const checkboxItem of this.checkboxList) {
                checkboxItem.checked = formArray.value.includes(checkboxItem.value);
            }
        }
    }
    get allChecked() {
        return this.checkboxList.filter(t => t.checked).length === this.checkboxList.length;
    }
    get someChecked() {
        const checkedItems = this.checkboxList.filter(t => t.checked).length;
        return checkedItems > 0 && checkedItems < this.checkboxList.length;
    }
    updateValue() {
        this.options.showErrors = true;
        if (this.boundControl) {
            this.jsf.updateArrayCheckboxList(this, this.checkboxList);
        }
    }
    updateAllValues(event) {
        this.options.showErrors = true;
        this.checkboxList.forEach(t => t.checked = event.checked);
        this.updateValue();
    }
}
MaterialCheckboxesComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-checkboxes-widget',
                template: `
    <div>
      <mat-checkbox type="checkbox"
        [checked]="allChecked"
        [color]="options?.color || 'primary'"
        [disabled]="controlDisabled || options?.readonly"
        [indeterminate]="someChecked"
        [name]="options?.name"
        (blur)="options.showErrors = true"
        (change)="updateAllValues($event)">
        <span class="checkbox-name" [innerHTML]="options?.name"></span>
      </mat-checkbox>
      <label *ngIf="options?.title"
        class="title"
        [class]="options?.labelHtmlClass || ''"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></label>
      <ul class="checkbox-list" [class.horizontal-list]="horizontalList">
        <li *ngFor="let checkboxItem of checkboxList"
          [class]="options?.htmlClass || ''">
          <mat-checkbox type="checkbox"
            [(ngModel)]="checkboxItem.checked"
            [color]="options?.color || 'primary'"
            [disabled]="controlDisabled || options?.readonly"
            [name]="checkboxItem?.name"
            (blur)="options.showErrors = true"
            (change)="updateValue()">
            <span class="checkbox-name" [innerHTML]="checkboxItem?.name"></span>
          </mat-checkbox>
        </li>
      </ul>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`,
                styles: [`
    .title { font-weight: bold; }
    .checkbox-list { list-style-type: none; }
    .horizontal-list > li { display: inline-block; margin-right: 10px; zoom: 1; }
    .checkbox-name { white-space: nowrap; }
    mat-error { font-size: 75%; }
  `]
            },] }
];
MaterialCheckboxesComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
MaterialCheckboxesComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtY2hlY2tib3hlcy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1jaGVja2JveGVzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBZ0IsTUFBTSxZQUFZLENBQUM7QUFFakUscURBQXFEO0FBQ3JELHVEQUF1RDtBQStDdkQsTUFBTSxPQUFPLDJCQUEyQjtJQWN0QyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBWHBDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRXJCLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBRXZCLGlCQUFZLEdBQW1CLEVBQUUsQ0FBQztJQU85QixDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssbUJBQW1CO1lBQ2hFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLGlCQUFpQixDQUFDO1FBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxhQUFhLENBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FDekUsQ0FBQztRQUNGLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxLQUFLLE1BQU0sWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzVDLFlBQVksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3JFO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDdEYsQ0FBQztJQUVELElBQUksV0FBVztRQUNiLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNyRSxPQUFPLFlBQVksR0FBRyxDQUFDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQ3JFLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDM0Q7SUFDSCxDQUFDO0lBRUQsZUFBZSxDQUFDLEtBQVU7UUFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7OztZQW5HRixTQUFTLFNBQUM7Z0JBQ1QsOENBQThDO2dCQUM5QyxRQUFRLEVBQUUsNEJBQTRCO2dCQUN0QyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQWlDRDt5QkFDQTs7Ozs7O0dBTVI7YUFDRjs7O1lBakRRLHFCQUFxQjs7O3lCQTREM0IsS0FBSzswQkFDTCxLQUFLO3dCQUNMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBidWlsZFRpdGxlTWFwIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5pbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSwgVGl0bGVNYXBJdGVtIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5cbi8vIFRPRE86IENoYW5nZSB0aGlzIHRvIHVzZSBhIFNlbGVjdGlvbiBMaXN0IGluc3RlYWQ/XG4vLyBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vY29tcG9uZW50cy9saXN0L292ZXJ2aWV3XG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtY2hlY2tib3hlcy13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+XG4gICAgICA8bWF0LWNoZWNrYm94IHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgIFtjaGVja2VkXT1cImFsbENoZWNrZWRcIlxuICAgICAgICBbY29sb3JdPVwib3B0aW9ucz8uY29sb3IgfHwgJ3ByaW1hcnknXCJcbiAgICAgICAgW2Rpc2FibGVkXT1cImNvbnRyb2xEaXNhYmxlZCB8fCBvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgIFtpbmRldGVybWluYXRlXT1cInNvbWVDaGVja2VkXCJcbiAgICAgICAgW25hbWVdPVwib3B0aW9ucz8ubmFtZVwiXG4gICAgICAgIChibHVyKT1cIm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWVcIlxuICAgICAgICAoY2hhbmdlKT1cInVwZGF0ZUFsbFZhbHVlcygkZXZlbnQpXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiIFtpbm5lckhUTUxdPVwib3B0aW9ucz8ubmFtZVwiPjwvc3Bhbj5cbiAgICAgIDwvbWF0LWNoZWNrYm94PlxuICAgICAgPGxhYmVsICpuZ0lmPVwib3B0aW9ucz8udGl0bGVcIlxuICAgICAgICBjbGFzcz1cInRpdGxlXCJcbiAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmxhYmVsSHRtbENsYXNzIHx8ICcnXCJcbiAgICAgICAgW3N0eWxlLmRpc3BsYXldPVwib3B0aW9ucz8ubm90aXRsZSA/ICdub25lJyA6ICcnXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy50aXRsZVwiPjwvbGFiZWw+XG4gICAgICA8dWwgY2xhc3M9XCJjaGVja2JveC1saXN0XCIgW2NsYXNzLmhvcml6b250YWwtbGlzdF09XCJob3Jpem9udGFsTGlzdFwiPlxuICAgICAgICA8bGkgKm5nRm9yPVwibGV0IGNoZWNrYm94SXRlbSBvZiBjaGVja2JveExpc3RcIlxuICAgICAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIj5cbiAgICAgICAgICA8bWF0LWNoZWNrYm94IHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICBbKG5nTW9kZWwpXT1cImNoZWNrYm94SXRlbS5jaGVja2VkXCJcbiAgICAgICAgICAgIFtjb2xvcl09XCJvcHRpb25zPy5jb2xvciB8fCAncHJpbWFyeSdcIlxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cImNvbnRyb2xEaXNhYmxlZCB8fCBvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgICAgICBbbmFtZV09XCJjaGVja2JveEl0ZW0/Lm5hbWVcIlxuICAgICAgICAgICAgKGJsdXIpPVwib3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZVwiXG4gICAgICAgICAgICAoY2hhbmdlKT1cInVwZGF0ZVZhbHVlKClcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2hlY2tib3gtbmFtZVwiIFtpbm5lckhUTUxdPVwiY2hlY2tib3hJdGVtPy5uYW1lXCI+PC9zcGFuPlxuICAgICAgICAgIDwvbWF0LWNoZWNrYm94PlxuICAgICAgICA8L2xpPlxuICAgICAgPC91bD5cbiAgICAgIDxtYXQtZXJyb3IgKm5nSWY9XCJvcHRpb25zPy5zaG93RXJyb3JzICYmIG9wdGlvbnM/LmVycm9yTWVzc2FnZVwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZXJyb3JNZXNzYWdlXCI+PC9tYXQtZXJyb3I+XG4gICAgPC9kaXY+YCxcbiAgc3R5bGVzOiBbYFxuICAgIC50aXRsZSB7IGZvbnQtd2VpZ2h0OiBib2xkOyB9XG4gICAgLmNoZWNrYm94LWxpc3QgeyBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7IH1cbiAgICAuaG9yaXpvbnRhbC1saXN0ID4gbGkgeyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IG1hcmdpbi1yaWdodDogMTBweDsgem9vbTogMTsgfVxuICAgIC5jaGVja2JveC1uYW1lIHsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgfVxuICAgIG1hdC1lcnJvciB7IGZvbnQtc2l6ZTogNzUlOyB9XG4gIGBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbENoZWNrYm94ZXNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBmb3JtQ29udHJvbDogQWJzdHJhY3RDb250cm9sO1xuICBjb250cm9sTmFtZTogc3RyaW5nO1xuICBjb250cm9sVmFsdWU6IGFueTtcbiAgY29udHJvbERpc2FibGVkID0gZmFsc2U7XG4gIGJvdW5kQ29udHJvbCA9IGZhbHNlO1xuICBvcHRpb25zOiBhbnk7XG4gIGhvcml6b250YWxMaXN0ID0gZmFsc2U7XG4gIGZvcm1BcnJheTogQWJzdHJhY3RDb250cm9sO1xuICBjaGVja2JveExpc3Q6IFRpdGxlTWFwSXRlbVtdID0gW107XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmhvcml6b250YWxMaXN0ID0gdGhpcy5sYXlvdXROb2RlLnR5cGUgPT09ICdjaGVja2JveGVzLWlubGluZScgfHxcbiAgICAgIHRoaXMubGF5b3V0Tm9kZS50eXBlID09PSAnY2hlY2tib3hidXR0b25zJztcbiAgICB0aGlzLmpzZi5pbml0aWFsaXplQ29udHJvbCh0aGlzKTtcbiAgICB0aGlzLmNoZWNrYm94TGlzdCA9IGJ1aWxkVGl0bGVNYXAoXG4gICAgICB0aGlzLm9wdGlvbnMudGl0bGVNYXAgfHwgdGhpcy5vcHRpb25zLmVudW1OYW1lcywgdGhpcy5vcHRpb25zLmVudW0sIHRydWVcbiAgICApO1xuICAgIGlmICh0aGlzLmJvdW5kQ29udHJvbCkge1xuICAgICAgY29uc3QgZm9ybUFycmF5ID0gdGhpcy5qc2YuZ2V0Rm9ybUNvbnRyb2wodGhpcyk7XG4gICAgICBmb3IgKGNvbnN0IGNoZWNrYm94SXRlbSBvZiB0aGlzLmNoZWNrYm94TGlzdCkge1xuICAgICAgICBjaGVja2JveEl0ZW0uY2hlY2tlZCA9IGZvcm1BcnJheS52YWx1ZS5pbmNsdWRlcyhjaGVja2JveEl0ZW0udmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBhbGxDaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrYm94TGlzdC5maWx0ZXIodCA9PiB0LmNoZWNrZWQpLmxlbmd0aCA9PT0gdGhpcy5jaGVja2JveExpc3QubGVuZ3RoO1xuICB9XG5cbiAgZ2V0IHNvbWVDaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNoZWNrZWRJdGVtcyA9IHRoaXMuY2hlY2tib3hMaXN0LmZpbHRlcih0ID0+IHQuY2hlY2tlZCkubGVuZ3RoO1xuICAgIHJldHVybiBjaGVja2VkSXRlbXMgPiAwICYmIGNoZWNrZWRJdGVtcyA8IHRoaXMuY2hlY2tib3hMaXN0Lmxlbmd0aDtcbiAgfVxuXG4gIHVwZGF0ZVZhbHVlKCkge1xuICAgIHRoaXMub3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5ib3VuZENvbnRyb2wpIHtcbiAgICAgIHRoaXMuanNmLnVwZGF0ZUFycmF5Q2hlY2tib3hMaXN0KHRoaXMsIHRoaXMuY2hlY2tib3hMaXN0KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVBbGxWYWx1ZXMoZXZlbnQ6IGFueSkge1xuICAgIHRoaXMub3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZTtcbiAgICB0aGlzLmNoZWNrYm94TGlzdC5mb3JFYWNoKHQgPT4gdC5jaGVja2VkID0gZXZlbnQuY2hlY2tlZCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZSgpO1xuICB9XG59XG4iXX0=