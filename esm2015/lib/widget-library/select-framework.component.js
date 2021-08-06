import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export class SelectFrameworkComponent {
    constructor(componentFactory, jsf) {
        this.componentFactory = componentFactory;
        this.jsf = jsf;
        this.newComponent = null;
    }
    ngOnInit() {
        this.updateComponent();
    }
    ngOnChanges() {
        this.updateComponent();
    }
    updateComponent() {
        if (this.widgetContainer && !this.newComponent && this.jsf.framework) {
            this.newComponent = this.widgetContainer.createComponent(this.componentFactory.resolveComponentFactory(this.jsf.framework));
        }
        if (this.newComponent) {
            for (const input of ['layoutNode', 'layoutIndex', 'dataIndex']) {
                this.newComponent.instance[input] = this[input];
            }
            this.newComponent.instance.parent = this.parent;
        }
    }
}
SelectFrameworkComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'select-framework-widget',
                template: `<div #widgetContainer></div>`
            },] }
];
SelectFrameworkComponent.ctorParameters = () => [
    { type: ComponentFactoryResolver },
    { type: JsonSchemaFormService }
];
SelectFrameworkComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }],
    parent: [{ type: Input }],
    widgetContainer: [{ type: ViewChild, args: ['widgetContainer', {
                    read: ViewContainerRef,
                    static: true
                },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWZyYW1ld29yay5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWNvcmUvc3JjL2xpYi93aWRnZXQtbGlicmFyeS9zZWxlY3QtZnJhbWV3b3JrLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUFFLHdCQUF3QixFQUFnQixLQUFLLEVBQ3JDLFNBQVMsRUFBRSxnQkFBZ0IsRUFDL0MsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFPcEUsTUFBTSxPQUFPLHdCQUF3QjtJQVduQyxZQUNVLGdCQUEwQyxFQUMxQyxHQUEwQjtRQUQxQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTBCO1FBQzFDLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBWnBDLGlCQUFZLEdBQXNCLElBQUksQ0FBQztJQWFuQyxDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUU7WUFDcEUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FDdEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQ2xFLENBQUM7U0FDSDtRQUNELElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyQixLQUFLLE1BQU0sS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pEO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDakQ7SUFDSCxDQUFDOzs7WUF6Q0YsU0FBUyxTQUFDO2dCQUNULDhDQUE4QztnQkFDOUMsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsUUFBUSxFQUFFLDhCQUE4QjthQUN6Qzs7O1lBVlksd0JBQXdCO1lBSTVCLHFCQUFxQjs7O3lCQVMzQixLQUFLOzBCQUNMLEtBQUs7d0JBQ0wsS0FBSztxQkFDTCxLQUFLOzhCQUNMLFNBQVMsU0FBQyxpQkFBaUIsRUFBRTtvQkFDMUIsSUFBSSxFQUFFLGdCQUFnQjtvQkFDdEIsTUFBTSxFQUFFLElBQUk7aUJBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmLCBJbnB1dCxcbiAgT25DaGFuZ2VzLCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdzZWxlY3QtZnJhbWV3b3JrLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgPGRpdiAjd2lkZ2V0Q29udGFpbmVyPjwvZGl2PmAsXG59KVxuZXhwb3J0IGNsYXNzIFNlbGVjdEZyYW1ld29ya0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0IHtcbiAgbmV3Q29tcG9uZW50OiBDb21wb25lbnRSZWY8YW55PiA9IG51bGw7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBwYXJlbnQ7XG4gIEBWaWV3Q2hpbGQoJ3dpZGdldENvbnRhaW5lcicsIHtcbiAgICAgIHJlYWQ6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICBzdGF0aWM6IHRydWUgfSlcbiAgICB3aWRnZXRDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMudXBkYXRlQ29tcG9uZW50KCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcygpIHtcbiAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudCgpO1xuICB9XG5cbiAgdXBkYXRlQ29tcG9uZW50KCkge1xuICAgIGlmICh0aGlzLndpZGdldENvbnRhaW5lciAmJiAhdGhpcy5uZXdDb21wb25lbnQgJiYgdGhpcy5qc2YuZnJhbWV3b3JrKSB7XG4gICAgICB0aGlzLm5ld0NvbXBvbmVudCA9IHRoaXMud2lkZ2V0Q29udGFpbmVyLmNyZWF0ZUNvbXBvbmVudChcbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LnJlc29sdmVDb21wb25lbnRGYWN0b3J5KHRoaXMuanNmLmZyYW1ld29yaylcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0NvbXBvbmVudCkge1xuICAgICAgZm9yIChjb25zdCBpbnB1dCBvZiBbJ2xheW91dE5vZGUnLCAnbGF5b3V0SW5kZXgnLCAnZGF0YUluZGV4J10pIHtcbiAgICAgICAgdGhpcy5uZXdDb21wb25lbnQuaW5zdGFuY2VbaW5wdXRdID0gdGhpc1tpbnB1dF07XG4gICAgICB9XG4gICAgICB0aGlzLm5ld0NvbXBvbmVudC5pbnN0YW5jZS5wYXJlbnQgPSB0aGlzLnBhcmVudDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==