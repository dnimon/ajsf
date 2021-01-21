import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { isDefined, JsonSchemaFormService } from '@ajsf/core';
import cloneDeep from 'lodash/cloneDeep';
export class MaterialDesignFrameworkComponent {
    constructor(changeDetector, jsf) {
        this.changeDetector = changeDetector;
        this.jsf = jsf;
        this.frameworkInitialized = false;
        this.formControl = null;
        this.parentArray = null;
        this.isOrderable = false;
        this.dynamicTitle = null;
    }
    get showRemoveButton() {
        if (!this.layoutNode || !this.widgetOptions.removable ||
            this.widgetOptions.readonly || this.layoutNode.type === '$ref') {
            return false;
        }
        if (this.layoutNode.recursiveReference) {
            return true;
        }
        if (!this.layoutNode.arrayItem || !this.parentArray) {
            return false;
        }
        // If array length <= minItems, don't allow removing any items
        return this.parentArray.items.length - 1 <= this.parentArray.options.minItems ? false :
            // For removable list items, allow removing any item
            this.layoutNode.arrayItemType === 'list' ? true :
                // For removable tuple items, only allow removing last item in list
                this.layoutIndex[this.layoutIndex.length - 1] === this.parentArray.items.length - 2;
    }
    ngOnInit() {
        this.initializeFramework();
    }
    ngOnChanges() {
        if (!this.frameworkInitialized) {
            this.initializeFramework();
        }
        if (this.dynamicTitle) {
            this.updateTitle();
        }
    }
    initializeFramework() {
        if (this.layoutNode) {
            this.options = cloneDeep(this.layoutNode.options || {});
            this.widgetLayoutNode = Object.assign(Object.assign({}, this.layoutNode), { options: cloneDeep(this.layoutNode.options || {}) });
            this.widgetOptions = this.widgetLayoutNode.options;
            this.formControl = this.jsf.getFormControl(this);
            if (isDefined(this.widgetOptions.minimum) &&
                isDefined(this.widgetOptions.maximum) &&
                this.widgetOptions.multipleOf >= 1) {
                this.layoutNode.type = 'range';
            }
            if (!['$ref', 'advancedfieldset', 'authfieldset', 'button', 'card',
                'checkbox', 'expansion-panel', 'help', 'message', 'msg', 'section',
                'submit', 'tabarray', 'tabs'].includes(this.layoutNode.type) &&
                /{{.+?}}/.test(this.widgetOptions.title || '')) {
                this.dynamicTitle = this.widgetOptions.title;
                this.updateTitle();
            }
            if (this.layoutNode.arrayItem && this.layoutNode.type !== '$ref') {
                this.parentArray = this.jsf.getParentNode(this);
                if (this.parentArray) {
                    this.isOrderable =
                        this.parentArray.type.slice(0, 3) !== 'tab' &&
                            this.layoutNode.arrayItemType === 'list' &&
                            !this.widgetOptions.readonly &&
                            this.parentArray.options.orderable;
                }
            }
            this.frameworkInitialized = true;
        }
        else {
            this.options = {};
        }
    }
    updateTitle() {
        this.widgetLayoutNode.options.title = this.jsf.parseText(this.dynamicTitle, this.jsf.getFormControlValue(this), this.jsf.getFormControlGroup(this).value, this.dataIndex[this.dataIndex.length - 1]);
    }
    removeItem() {
        this.jsf.removeItem(this);
    }
}
MaterialDesignFrameworkComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'material-design-framework',
                template: "<div\n  [class.array-item]=\"widgetLayoutNode?.arrayItem && widgetLayoutNode?.type !== '$ref'\"\n  [orderable]=\"isOrderable\"\n  [dataIndex]=\"dataIndex\"\n  [layoutIndex]=\"layoutIndex\"\n  [layoutNode]=\"widgetLayoutNode\">\n  <svg *ngIf=\"showRemoveButton\"\n       xmlns=\"http://www.w3.org/2000/svg\"\n       height=\"18\" width=\"18\" viewBox=\"0 0 24 24\"\n       class=\"close-button\"\n       (click)=\"removeItem()\">\n    <path\n      d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z\"/>\n  </svg>\n  <select-widget-widget\n    [dataIndex]=\"dataIndex\"\n    [layoutIndex]=\"layoutIndex\"\n    [parent]=\"parent\"\n    [layoutNode]=\"widgetLayoutNode\"></select-widget-widget>\n</div>\n<div class=\"spacer\" *ngIf=\"widgetLayoutNode?.arrayItem && widgetLayoutNode?.type !== '$ref'\"></div>\n",
                styles: [".array-item{border-radius:2px;box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);padding:6px;position:relative;transition:all .28s cubic-bezier(.4,0,.2,1)}.close-button{cursor:pointer;fill:rgba(0,0,0,.4);position:absolute;right:6px;top:6px;visibility:hidden;z-index:500}.close-button:hover{fill:rgba(0,0,0,.8)}.array-item:hover>.close-button{visibility:visible}.spacer{margin:6px 0}[draggable=true]:hover{box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);cursor:move;z-index:10}[draggable=true].drag-target-top{box-shadow:0 -2px 0 #000;position:relative;z-index:20}[draggable=true].drag-target-bottom{box-shadow:0 2px 0 #000;position:relative;z-index:20}"]
            },] }
];
MaterialDesignFrameworkComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: JsonSchemaFormService }
];
MaterialDesignFrameworkComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }],
    parent: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9tYXRlcmlhbC1kZXNpZ24tZnJhbWV3b3JrLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBb0IsTUFBTSxlQUFlLENBQUM7QUFDckYsT0FBTyxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUM1RCxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQVF6QyxNQUFNLE9BQU8sZ0NBQWdDO0lBZTNDLFlBQ1UsY0FBaUMsRUFDakMsR0FBMEI7UUFEMUIsbUJBQWMsR0FBZCxjQUFjLENBQW1CO1FBQ2pDLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBaEJwQyx5QkFBb0IsR0FBRyxLQUFLLENBQUM7UUFLN0IsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFDcEIsaUJBQVksR0FBVyxJQUFJLENBQUM7SUFVNUIsQ0FBQztJQUVELElBQUksZ0JBQWdCO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTO1lBQ25ELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFDOUQ7WUFDQSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLENBQUMsSUFB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b21wb25lbnQsIElucHV0LCBPbkNoYW5nZXMsIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2lzRGVmaW5lZCwgSnNvblNjaGVtYUZvcm1TZXJ2aWNlfSBmcm9tICdAYWpzZi9jb3JlJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yaycsXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXRlcmlhbC1kZXNpZ24tZnJhbWV3b3JrLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5jb21wb25lbnQuc2NzcyddLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcbiAgZnJhbWV3b3JrSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgaW5wdXRUeXBlOiBzdHJpbmc7XG4gIG9wdGlvbnM6IGFueTsgLy8gT3B0aW9ucyB1c2VkIGluIHRoaXMgZnJhbWV3b3JrXG4gIHdpZGdldExheW91dE5vZGU6IGFueTsgLy8gbGF5b3V0Tm9kZSBwYXNzZWQgdG8gY2hpbGQgd2lkZ2V0XG4gIHdpZGdldE9wdGlvbnM6IGFueTsgLy8gT3B0aW9ucyBwYXNzZWQgdG8gY2hpbGQgd2lkZ2V0XG4gIGZvcm1Db250cm9sOiBhbnkgPSBudWxsO1xuICBwYXJlbnRBcnJheTogYW55ID0gbnVsbDtcbiAgaXNPcmRlcmFibGUgPSBmYWxzZTtcbiAgZHluYW1pY1RpdGxlOiBzdHJpbmcgPSBudWxsO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgcGFyZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7XG4gIH1cblxuICBnZXQgc2hvd1JlbW92ZUJ1dHRvbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMubGF5b3V0Tm9kZSB8fCAhdGhpcy53aWRnZXRPcHRpb25zLnJlbW92YWJsZSB8fFxuICAgICAgdGhpcy53aWRnZXRPcHRpb25zLnJlYWRvbmx5IHx8IHRoaXMubGF5b3V0Tm9kZS50eXBlID09PSAnJHJlZidcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMubGF5b3V0Tm9kZS5yZWN1cnNpdmVSZWZlcmVuY2UpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubGF5b3V0Tm9kZS5hcnJheUl0ZW0gfHwgIXRoaXMucGFyZW50QXJyYXkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgYXJyYXkgbGVuZ3RoIDw9IG1pbkl0ZW1zLCBkb24ndCBhbGxvdyByZW1vdmluZyBhbnkgaXRlbXNcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRBcnJheS5pdGVtcy5sZW5ndGggLSAxIDw9IHRoaXMucGFyZW50QXJyYXkub3B0aW9ucy5taW5JdGVtcyA/IGZhbHNlIDpcbiAgICAgIC8vIEZvciByZW1vdmFibGUgbGlzdCBpdGVtcywgYWxsb3cgcmVtb3ZpbmcgYW55IGl0ZW1cbiAgICAgIHRoaXMubGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlID09PSAnbGlzdCcgPyB0cnVlIDpcbiAgICAgICAgLy8gRm9yIHJlbW92YWJsZSB0dXBsZSBpdGVtcywgb25seSBhbGxvdyByZW1vdmluZyBsYXN0IGl0ZW0gaW4gbGlzdFxuICAgICAgICB0aGlzLmxheW91dEluZGV4W3RoaXMubGF5b3V0SW5kZXgubGVuZ3RoIC0gMV0gPT09IHRoaXMucGFyZW50QXJyYXkuaXRlbXMubGVuZ3RoIC0gMjtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUZyYW1ld29yaygpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgaWYgKCF0aGlzLmZyYW1ld29ya0luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVGcmFtZXdvcmsoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZHluYW1pY1RpdGxlKSB7XG4gICAgICB0aGlzLnVwZGF0ZVRpdGxlKCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbGl6ZUZyYW1ld29yaygpIHtcbiAgICBpZiAodGhpcy5sYXlvdXROb2RlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBjbG9uZURlZXAodGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge30pO1xuICAgICAgdGhpcy53aWRnZXRMYXlvdXROb2RlID0ge1xuICAgICAgICAuLi50aGlzLmxheW91dE5vZGUsXG4gICAgICAgIG9wdGlvbnM6IGNsb25lRGVlcCh0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fSlcbiAgICAgIH07XG4gICAgICB0aGlzLndpZGdldE9wdGlvbnMgPSB0aGlzLndpZGdldExheW91dE5vZGUub3B0aW9ucztcbiAgICAgIHRoaXMuZm9ybUNvbnRyb2wgPSB0aGlzLmpzZi5nZXRGb3JtQ29udHJvbCh0aGlzKTtcblxuICAgICAgaWYgKFxuICAgICAgICBpc0RlZmluZWQodGhpcy53aWRnZXRPcHRpb25zLm1pbmltdW0pICYmXG4gICAgICAgIGlzRGVmaW5lZCh0aGlzLndpZGdldE9wdGlvbnMubWF4aW11bSkgJiZcbiAgICAgICAgdGhpcy53aWRnZXRPcHRpb25zLm11bHRpcGxlT2YgPj0gMVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMubGF5b3V0Tm9kZS50eXBlID0gJ3JhbmdlJztcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICAhWyckcmVmJywgJ2FkdmFuY2VkZmllbGRzZXQnLCAnYXV0aGZpZWxkc2V0JywgJ2J1dHRvbicsICdjYXJkJyxcbiAgICAgICAgICAnY2hlY2tib3gnLCAnZXhwYW5zaW9uLXBhbmVsJywgJ2hlbHAnLCAnbWVzc2FnZScsICdtc2cnLCAnc2VjdGlvbicsXG4gICAgICAgICAgJ3N1Ym1pdCcsICd0YWJhcnJheScsICd0YWJzJ10uaW5jbHVkZXModGhpcy5sYXlvdXROb2RlLnR5cGUpICYmXG4gICAgICAgIC97ey4rP319Ly50ZXN0KHRoaXMud2lkZ2V0T3B0aW9ucy50aXRsZSB8fCAnJylcbiAgICAgICkge1xuICAgICAgICB0aGlzLmR5bmFtaWNUaXRsZSA9IHRoaXMud2lkZ2V0T3B0aW9ucy50aXRsZTtcbiAgICAgICAgdGhpcy51cGRhdGVUaXRsZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5sYXlvdXROb2RlLmFycmF5SXRlbSAmJiB0aGlzLmxheW91dE5vZGUudHlwZSAhPT0gJyRyZWYnKSB7XG4gICAgICAgIHRoaXMucGFyZW50QXJyYXkgPSB0aGlzLmpzZi5nZXRQYXJlbnROb2RlKHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5wYXJlbnRBcnJheSkge1xuICAgICAgICAgIHRoaXMuaXNPcmRlcmFibGUgPVxuICAgICAgICAgICAgdGhpcy5wYXJlbnRBcnJheS50eXBlLnNsaWNlKDAsIDMpICE9PSAndGFiJyAmJlxuICAgICAgICAgICAgdGhpcy5sYXlvdXROb2RlLmFycmF5SXRlbVR5cGUgPT09ICdsaXN0JyAmJlxuICAgICAgICAgICAgIXRoaXMud2lkZ2V0T3B0aW9ucy5yZWFkb25seSAmJlxuICAgICAgICAgICAgdGhpcy5wYXJlbnRBcnJheS5vcHRpb25zLm9yZGVyYWJsZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmZyYW1ld29ya0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVGl0bGUoKSB7XG4gICAgdGhpcy53aWRnZXRMYXlvdXROb2RlLm9wdGlvbnMudGl0bGUgPSB0aGlzLmpzZi5wYXJzZVRleHQoXG4gICAgICB0aGlzLmR5bmFtaWNUaXRsZSxcbiAgICAgIHRoaXMuanNmLmdldEZvcm1Db250cm9sVmFsdWUodGhpcyksXG4gICAgICB0aGlzLmpzZi5nZXRGb3JtQ29udHJvbEdyb3VwKHRoaXMpLnZhbHVlLFxuICAgICAgdGhpcy5kYXRhSW5kZXhbdGhpcy5kYXRhSW5kZXgubGVuZ3RoIC0gMV1cbiAgICApO1xuICB9XG5cbiAgcmVtb3ZlSXRlbSgpIHtcbiAgICB0aGlzLmpzZi5yZW1vdmVJdGVtKHRoaXMpO1xuICB9XG59XG4iXX0=