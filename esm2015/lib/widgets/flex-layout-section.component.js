import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
export class FlexLayoutSectionComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.expanded = true;
        this.containerType = 'div';
    }
    get sectionTitle() {
        return this.options.notitle ? null : this.jsf.setItemTitle(this);
    }
    ngOnInit() {
        this.jsf.initializeControl(this);
        this.options = this.layoutNode.options || {};
        this.expanded = typeof this.options.expanded === 'boolean' ?
            this.options.expanded : !this.options.expandable;
        switch (this.layoutNode.type) {
            case 'section':
            case 'array':
            case 'fieldset':
            case 'advancedfieldset':
            case 'authfieldset':
            case 'optionfieldset':
            case 'selectfieldset':
                this.containerType = 'fieldset';
                break;
            case 'card':
                this.containerType = 'card';
                break;
            case 'expansion-panel':
                this.containerType = 'expansion-panel';
                break;
            default: // 'div', 'flex', 'tab', 'conditional', 'actions'
                this.containerType = 'div';
        }
    }
    toggleExpanded() {
        if (this.options.expandable) {
            this.expanded = !this.expanded;
        }
    }
    // Set attributes for flexbox container
    // (child attributes are set in flex-layout-root.component)
    getFlexAttribute(attribute) {
        const flexActive = this.layoutNode.type === 'flex' ||
            !!this.options.displayFlex ||
            this.options.display === 'flex';
        // if (attribute !== 'flex' && !flexActive) { return null; }
        switch (attribute) {
            case 'is-flex':
                return flexActive;
            case 'display':
                return flexActive ? 'flex' : 'initial';
            case 'flex-direction':
            case 'flex-wrap':
                const index = ['flex-direction', 'flex-wrap'].indexOf(attribute);
                return (this.options['flex-flow'] || '').split(/\s+/)[index] ||
                    this.options[attribute] || ['column', 'nowrap'][index];
            case 'justify-content':
            case 'align-items':
            case 'align-content':
                return this.options[attribute];
            case 'layout':
                return (this.options.fxLayout || 'row') +
                    this.options.fxLayoutWrap ? ' ' + this.options.fxLayoutWrap : '';
        }
    }
}
FlexLayoutSectionComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'flex-layout-section-widget',
                template: `
    <div *ngIf="containerType === 'div'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <label *ngIf="sectionTitle"
        [class]="'legend ' + (options?.labelHtmlClass || '')"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></label>
      <flex-layout-root-widget *ngIf="expanded"
        [layout]="layoutNode.items"
        [dataIndex]="dataIndex"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.align-content]="getFlexAttribute('align-content')"
        [fxLayout]="getFlexAttribute('layout')"
        [fxLayoutGap]="options?.fxLayoutGap"
        [fxLayoutAlign]="options?.fxLayoutAlign"
        [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>

    <fieldset *ngIf="containerType === 'fieldset'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded"
      [disabled]="options?.readonly">
      <legend *ngIf="sectionTitle"
        [class]="'legend ' + (options?.labelHtmlClass || '')"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></legend>
      <flex-layout-root-widget *ngIf="expanded"
        [layout]="layoutNode.items"
        [dataIndex]="dataIndex"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.align-content]="getFlexAttribute('align-content')"
        [fxLayout]="getFlexAttribute('layout')"
        [fxLayoutGap]="options?.fxLayoutGap"
        [fxLayoutAlign]="options?.fxLayoutAlign"
        [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </fieldset>

    <mat-card *ngIf="containerType === 'card'"
      [ngClass]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <mat-card-header *ngIf="sectionTitle">
        <legend
          [class]="'legend ' + (options?.labelHtmlClass || '')"
          [innerHTML]="sectionTitle"
          (click)="toggleExpanded()"></legend>
      </mat-card-header>
      <mat-card-content *ngIf="expanded">
        <fieldset [disabled]="options?.readonly">
          <flex-layout-root-widget *ngIf="expanded"
            [layout]="layoutNode.items"
            [dataIndex]="dataIndex"
            [layoutIndex]="layoutIndex"
            [isFlexItem]="getFlexAttribute('is-flex')"
            [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
            [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
            [style.display]="getFlexAttribute('display')"
            [style.flex-direction]="getFlexAttribute('flex-direction')"
            [style.flex-wrap]="getFlexAttribute('flex-wrap')"
            [style.justify-content]="getFlexAttribute('justify-content')"
            [style.align-items]="getFlexAttribute('align-items')"
            [style.align-content]="getFlexAttribute('align-content')"
            [fxLayout]="getFlexAttribute('layout')"
            [fxLayoutGap]="options?.fxLayoutGap"
            [fxLayoutAlign]="options?.fxLayoutAlign"
            [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
          </fieldset>
      </mat-card-content>
      <mat-card-footer>
        <mat-error *ngIf="options?.showErrors && options?.errorMessage"
          [innerHTML]="options?.errorMessage"></mat-error>
      </mat-card-footer>
    </mat-card>

    <mat-expansion-panel *ngIf="containerType === 'expansion-panel'"
      [expanded]="expanded"
      [hideToggle]="!options?.expandable">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <legend *ngIf="sectionTitle"
            [class]="options?.labelHtmlClass"
            [innerHTML]="sectionTitle"
            (click)="toggleExpanded()"></legend>
        </mat-panel-title>
      </mat-expansion-panel-header>
      <fieldset [disabled]="options?.readonly">
        <flex-layout-root-widget *ngIf="expanded"
          [layout]="layoutNode.items"
          [dataIndex]="dataIndex"
          [layoutIndex]="layoutIndex"
          [isFlexItem]="getFlexAttribute('is-flex')"
          [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
          [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
          [style.display]="getFlexAttribute('display')"
          [style.flex-direction]="getFlexAttribute('flex-direction')"
          [style.flex-wrap]="getFlexAttribute('flex-wrap')"
          [style.justify-content]="getFlexAttribute('justify-content')"
          [style.align-items]="getFlexAttribute('align-items')"
          [style.align-content]="getFlexAttribute('align-content')"
          [fxLayout]="getFlexAttribute('layout')"
          [fxLayoutGap]="options?.fxLayoutGap"
          [fxLayoutAlign]="options?.fxLayoutAlign"
          [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      </fieldset>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </mat-expansion-panel>`,
                styles: [`
    fieldset { border: 0; margin: 0; padding: 0; }
    .legend { font-weight: bold; }
    .expandable > .legend:before { content: '▶'; padding-right: .3em; }
    .expanded > .legend:before { content: '▼'; padding-right: .2em; }
  `]
            },] }
];
FlexLayoutSectionComponent.ctorParameters = () => [
    { type: JsonSchemaFormService }
];
FlexLayoutSectionComponent.propDecorators = {
    layoutNode: [{ type: Input }],
    layoutIndex: [{ type: Input }],
    dataIndex: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXRzL2ZsZXgtbGF5b3V0LXNlY3Rpb24uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQThJbkQsTUFBTSxPQUFPLDBCQUEwQjtJQWFyQyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBVnBDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRXJCLGFBQVEsR0FBRyxJQUFJLENBQUM7UUFDaEIsa0JBQWEsR0FBRyxLQUFLLENBQUM7SUFPbEIsQ0FBQztJQUVMLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJ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SyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQGFqc2YvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnZmxleC1sYXlvdXQtc2VjdGlvbi13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgKm5nSWY9XCJjb250YWluZXJUeXBlID09PSAnZGl2J1wiXG4gICAgICBbY2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCJcbiAgICAgIFtjbGFzcy5leHBhbmRhYmxlXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgIWV4cGFuZGVkXCJcbiAgICAgIFtjbGFzcy5leHBhbmRlZF09XCJvcHRpb25zPy5leHBhbmRhYmxlICYmIGV4cGFuZGVkXCI+XG4gICAgICA8bGFiZWwgKm5nSWY9XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICBbY2xhc3NdPVwiJ2xlZ2VuZCAnICsgKG9wdGlvbnM/LmxhYmVsSHRtbENsYXNzIHx8ICcnKVwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgKGNsaWNrKT1cInRvZ2dsZUV4cGFuZGVkKClcIj48L2xhYmVsPlxuICAgICAgPGZsZXgtbGF5b3V0LXJvb3Qtd2lkZ2V0ICpuZ0lmPVwiZXhwYW5kZWRcIlxuICAgICAgICBbbGF5b3V0XT1cImxheW91dE5vZGUuaXRlbXNcIlxuICAgICAgICBbZGF0YUluZGV4XT1cImRhdGFJbmRleFwiXG4gICAgICAgIFtsYXlvdXRJbmRleF09XCJsYXlvdXRJbmRleFwiXG4gICAgICAgIFtpc0ZsZXhJdGVtXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2lzLWZsZXgnKVwiXG4gICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtY29sdW1uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdjb2x1bW4nXCJcbiAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1yb3ddPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ3JvdydcIlxuICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJnZXRGbGV4QXR0cmlidXRlKCdkaXNwbGF5JylcIlxuICAgICAgICBbc3R5bGUuZmxleC1kaXJlY3Rpb25dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKVwiXG4gICAgICAgIFtzdHlsZS5mbGV4LXdyYXBdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC13cmFwJylcIlxuICAgICAgICBbc3R5bGUuanVzdGlmeS1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2p1c3RpZnktY29udGVudCcpXCJcbiAgICAgICAgW3N0eWxlLmFsaWduLWl0ZW1zXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWl0ZW1zJylcIlxuICAgICAgICBbc3R5bGUuYWxpZ24tY29udGVudF09XCJnZXRGbGV4QXR0cmlidXRlKCdhbGlnbi1jb250ZW50JylcIlxuICAgICAgICBbZnhMYXlvdXRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnbGF5b3V0JylcIlxuICAgICAgICBbZnhMYXlvdXRHYXBdPVwib3B0aW9ucz8uZnhMYXlvdXRHYXBcIlxuICAgICAgICBbZnhMYXlvdXRBbGlnbl09XCJvcHRpb25zPy5meExheW91dEFsaWduXCJcbiAgICAgICAgW2F0dHIuZnhGbGV4RmlsbF09XCJvcHRpb25zPy5meExheW91dEFsaWduXCI+PC9mbGV4LWxheW91dC1yb290LXdpZGdldD5cbiAgICAgIDxtYXQtZXJyb3IgKm5nSWY9XCJvcHRpb25zPy5zaG93RXJyb3JzICYmIG9wdGlvbnM/LmVycm9yTWVzc2FnZVwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZXJyb3JNZXNzYWdlXCI+PC9tYXQtZXJyb3I+XG4gICAgPC9kaXY+XG5cbiAgICA8ZmllbGRzZXQgKm5nSWY9XCJjb250YWluZXJUeXBlID09PSAnZmllbGRzZXQnXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIlxuICAgICAgW2NsYXNzLmV4cGFuZGFibGVdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiAhZXhwYW5kZWRcIlxuICAgICAgW2NsYXNzLmV4cGFuZGVkXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgZXhwYW5kZWRcIlxuICAgICAgW2Rpc2FibGVkXT1cIm9wdGlvbnM/LnJlYWRvbmx5XCI+XG4gICAgICA8bGVnZW5kICpuZ0lmPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgW2NsYXNzXT1cIidsZWdlbmQgJyArIChvcHRpb25zPy5sYWJlbEh0bWxDbGFzcyB8fCAnJylcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cInNlY3Rpb25UaXRsZVwiXG4gICAgICAgIChjbGljayk9XCJ0b2dnbGVFeHBhbmRlZCgpXCI+PC9sZWdlbmQ+XG4gICAgICA8ZmxleC1sYXlvdXQtcm9vdC13aWRnZXQgKm5nSWY9XCJleHBhbmRlZFwiXG4gICAgICAgIFtsYXlvdXRdPVwibGF5b3V0Tm9kZS5pdGVtc1wiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwiZGF0YUluZGV4XCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCJcbiAgICAgICAgW2lzRmxleEl0ZW1dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnaXMtZmxleCcpXCJcbiAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1jb2x1bW5dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ2NvbHVtbidcIlxuICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LXJvd109XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAncm93J1wiXG4gICAgICAgIFtzdHlsZS5kaXNwbGF5XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2Rpc3BsYXknKVwiXG4gICAgICAgIFtzdHlsZS5mbGV4LWRpcmVjdGlvbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpXCJcbiAgICAgICAgW3N0eWxlLmZsZXgtd3JhcF09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LXdyYXAnKVwiXG4gICAgICAgIFtzdHlsZS5qdXN0aWZ5LWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnanVzdGlmeS1jb250ZW50JylcIlxuICAgICAgICBbc3R5bGUuYWxpZ24taXRlbXNdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24taXRlbXMnKVwiXG4gICAgICAgIFtzdHlsZS5hbGlnbi1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWNvbnRlbnQnKVwiXG4gICAgICAgIFtmeExheW91dF09XCJnZXRGbGV4QXR0cmlidXRlKCdsYXlvdXQnKVwiXG4gICAgICAgIFtmeExheW91dEdhcF09XCJvcHRpb25zPy5meExheW91dEdhcFwiXG4gICAgICAgIFtmeExheW91dEFsaWduXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIlxuICAgICAgICBbYXR0ci5meEZsZXhGaWxsXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIj48L2ZsZXgtbGF5b3V0LXJvb3Qtd2lkZ2V0PlxuICAgICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5lcnJvck1lc3NhZ2VcIj48L21hdC1lcnJvcj5cbiAgICA8L2ZpZWxkc2V0PlxuXG4gICAgPG1hdC1jYXJkICpuZ0lmPVwiY29udGFpbmVyVHlwZSA9PT0gJ2NhcmQnXCJcbiAgICAgIFtuZ0NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICBbY2xhc3MuZXhwYW5kYWJsZV09XCJvcHRpb25zPy5leHBhbmRhYmxlICYmICFleHBhbmRlZFwiXG4gICAgICBbY2xhc3MuZXhwYW5kZWRdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiBleHBhbmRlZFwiPlxuICAgICAgPG1hdC1jYXJkLWhlYWRlciAqbmdJZj1cInNlY3Rpb25UaXRsZVwiPlxuICAgICAgICA8bGVnZW5kXG4gICAgICAgICAgW2NsYXNzXT1cIidsZWdlbmQgJyArIChvcHRpb25zPy5sYWJlbEh0bWxDbGFzcyB8fCAnJylcIlxuICAgICAgICAgIFtpbm5lckhUTUxdPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgICAoY2xpY2spPVwidG9nZ2xlRXhwYW5kZWQoKVwiPjwvbGVnZW5kPlxuICAgICAgPC9tYXQtY2FyZC1oZWFkZXI+XG4gICAgICA8bWF0LWNhcmQtY29udGVudCAqbmdJZj1cImV4cGFuZGVkXCI+XG4gICAgICAgIDxmaWVsZHNldCBbZGlzYWJsZWRdPVwib3B0aW9ucz8ucmVhZG9ubHlcIj5cbiAgICAgICAgICA8ZmxleC1sYXlvdXQtcm9vdC13aWRnZXQgKm5nSWY9XCJleHBhbmRlZFwiXG4gICAgICAgICAgICBbbGF5b3V0XT1cImxheW91dE5vZGUuaXRlbXNcIlxuICAgICAgICAgICAgW2RhdGFJbmRleF09XCJkYXRhSW5kZXhcIlxuICAgICAgICAgICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCJcbiAgICAgICAgICAgIFtpc0ZsZXhJdGVtXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2lzLWZsZXgnKVwiXG4gICAgICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LWNvbHVtbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAnY29sdW1uJ1wiXG4gICAgICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LXJvd109XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAncm93J1wiXG4gICAgICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJnZXRGbGV4QXR0cmlidXRlKCdkaXNwbGF5JylcIlxuICAgICAgICAgICAgW3N0eWxlLmZsZXgtZGlyZWN0aW9uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJylcIlxuICAgICAgICAgICAgW3N0eWxlLmZsZXgtd3JhcF09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LXdyYXAnKVwiXG4gICAgICAgICAgICBbc3R5bGUuanVzdGlmeS1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2p1c3RpZnktY29udGVudCcpXCJcbiAgICAgICAgICAgIFtzdHlsZS5hbGlnbi1pdGVtc109XCJnZXRGbGV4QXR0cmlidXRlKCdhbGlnbi1pdGVtcycpXCJcbiAgICAgICAgICAgIFtzdHlsZS5hbGlnbi1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWNvbnRlbnQnKVwiXG4gICAgICAgICAgICBbZnhMYXlvdXRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnbGF5b3V0JylcIlxuICAgICAgICAgICAgW2Z4TGF5b3V0R2FwXT1cIm9wdGlvbnM/LmZ4TGF5b3V0R2FwXCJcbiAgICAgICAgICAgIFtmeExheW91dEFsaWduXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIlxuICAgICAgICAgICAgW2F0dHIuZnhGbGV4RmlsbF09XCJvcHRpb25zPy5meExheW91dEFsaWduXCI+PC9mbGV4LWxheW91dC1yb290LXdpZGdldD5cbiAgICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgPC9tYXQtY2FyZC1jb250ZW50PlxuICAgICAgPG1hdC1jYXJkLWZvb3Rlcj5cbiAgICAgICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmVycm9yTWVzc2FnZVwiPjwvbWF0LWVycm9yPlxuICAgICAgPC9tYXQtY2FyZC1mb290ZXI+XG4gICAgPC9tYXQtY2FyZD5cblxuICAgIDxtYXQtZXhwYW5zaW9uLXBhbmVsICpuZ0lmPVwiY29udGFpbmVyVHlwZSA9PT0gJ2V4cGFuc2lvbi1wYW5lbCdcIlxuICAgICAgW2V4cGFuZGVkXT1cImV4cGFuZGVkXCJcbiAgICAgIFtoaWRlVG9nZ2xlXT1cIiFvcHRpb25zPy5leHBhbmRhYmxlXCI+XG4gICAgICA8bWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXI+XG4gICAgICAgIDxtYXQtcGFuZWwtdGl0bGU+XG4gICAgICAgICAgPGxlZ2VuZCAqbmdJZj1cInNlY3Rpb25UaXRsZVwiXG4gICAgICAgICAgICBbY2xhc3NdPVwib3B0aW9ucz8ubGFiZWxIdG1sQ2xhc3NcIlxuICAgICAgICAgICAgW2lubmVySFRNTF09XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICAgICAgKGNsaWNrKT1cInRvZ2dsZUV4cGFuZGVkKClcIj48L2xlZ2VuZD5cbiAgICAgICAgPC9tYXQtcGFuZWwtdGl0bGU+XG4gICAgICA8L21hdC1leHBhbnNpb24tcGFuZWwtaGVhZGVyPlxuICAgICAgPGZpZWxkc2V0IFtkaXNhYmxlZF09XCJvcHRpb25zPy5yZWFkb25seVwiPlxuICAgICAgICA8ZmxleC1sYXlvdXQtcm9vdC13aWRnZXQgKm5nSWY9XCJleHBhbmRlZFwiXG4gICAgICAgICAgW2xheW91dF09XCJsYXlvdXROb2RlLml0ZW1zXCJcbiAgICAgICAgICBbZGF0YUluZGV4XT1cImRhdGFJbmRleFwiXG4gICAgICAgICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCJcbiAgICAgICAgICBbaXNGbGV4SXRlbV09XCJnZXRGbGV4QXR0cmlidXRlKCdpcy1mbGV4JylcIlxuICAgICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtY29sdW1uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdjb2x1bW4nXCJcbiAgICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LXJvd109XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAncm93J1wiXG4gICAgICAgICAgW3N0eWxlLmRpc3BsYXldPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZGlzcGxheScpXCJcbiAgICAgICAgICBbc3R5bGUuZmxleC1kaXJlY3Rpb25dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKVwiXG4gICAgICAgICAgW3N0eWxlLmZsZXgtd3JhcF09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LXdyYXAnKVwiXG4gICAgICAgICAgW3N0eWxlLmp1c3RpZnktY29udGVudF09XCJnZXRGbGV4QXR0cmlidXRlKCdqdXN0aWZ5LWNvbnRlbnQnKVwiXG4gICAgICAgICAgW3N0eWxlLmFsaWduLWl0ZW1zXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWl0ZW1zJylcIlxuICAgICAgICAgIFtzdHlsZS5hbGlnbi1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWNvbnRlbnQnKVwiXG4gICAgICAgICAgW2Z4TGF5b3V0XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2xheW91dCcpXCJcbiAgICAgICAgICBbZnhMYXlvdXRHYXBdPVwib3B0aW9ucz8uZnhMYXlvdXRHYXBcIlxuICAgICAgICAgIFtmeExheW91dEFsaWduXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIlxuICAgICAgICAgIFthdHRyLmZ4RmxleEZpbGxdPVwib3B0aW9ucz8uZnhMYXlvdXRBbGlnblwiPjwvZmxleC1sYXlvdXQtcm9vdC13aWRnZXQ+XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5lcnJvck1lc3NhZ2VcIj48L21hdC1lcnJvcj5cbiAgICA8L21hdC1leHBhbnNpb24tcGFuZWw+YCxcbiAgc3R5bGVzOiBbYFxuICAgIGZpZWxkc2V0IHsgYm9yZGVyOiAwOyBtYXJnaW46IDA7IHBhZGRpbmc6IDA7IH1cbiAgICAubGVnZW5kIHsgZm9udC13ZWlnaHQ6IGJvbGQ7IH1cbiAgICAuZXhwYW5kYWJsZSA+IC5sZWdlbmQ6YmVmb3JlIHsgY29udGVudDogJ+KWtic7IHBhZGRpbmctcmlnaHQ6IC4zZW07IH1cbiAgICAuZXhwYW5kZWQgPiAubGVnZW5kOmJlZm9yZSB7IGNvbnRlbnQ6ICfilrwnOyBwYWRkaW5nLXJpZ2h0OiAuMmVtOyB9XG4gIGBdLFxufSlcbmV4cG9ydCBjbGFzcyBGbGV4TGF5b3V0U2VjdGlvbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIGZvcm1Db250cm9sOiBBYnN0cmFjdENvbnRyb2w7XG4gIGNvbnRyb2xOYW1lOiBzdHJpbmc7XG4gIGNvbnRyb2xWYWx1ZTogYW55O1xuICBjb250cm9sRGlzYWJsZWQgPSBmYWxzZTtcbiAgYm91bmRDb250cm9sID0gZmFsc2U7XG4gIG9wdGlvbnM6IGFueTtcbiAgZXhwYW5kZWQgPSB0cnVlO1xuICBjb250YWluZXJUeXBlID0gJ2Rpdic7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBnZXQgc2VjdGlvblRpdGxlKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubm90aXRsZSA/IG51bGwgOiB0aGlzLmpzZi5zZXRJdGVtVGl0bGUodGhpcyk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLmpzZi5pbml0aWFsaXplQ29udHJvbCh0aGlzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmV4cGFuZGVkID0gdHlwZW9mIHRoaXMub3B0aW9ucy5leHBhbmRlZCA9PT0gJ2Jvb2xlYW4nID9cbiAgICAgIHRoaXMub3B0aW9ucy5leHBhbmRlZCA6ICF0aGlzLm9wdGlvbnMuZXhwYW5kYWJsZTtcbiAgICBzd2l0Y2ggKHRoaXMubGF5b3V0Tm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdzZWN0aW9uJzogY2FzZSAnYXJyYXknOiBjYXNlICdmaWVsZHNldCc6IGNhc2UgJ2FkdmFuY2VkZmllbGRzZXQnOlxuICAgICAgY2FzZSAnYXV0aGZpZWxkc2V0JzogY2FzZSAnb3B0aW9uZmllbGRzZXQnOiBjYXNlICdzZWxlY3RmaWVsZHNldCc6XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHlwZSA9ICdmaWVsZHNldCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2FyZCc6XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHlwZSA9ICdjYXJkJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdleHBhbnNpb24tcGFuZWwnOlxuICAgICAgICB0aGlzLmNvbnRhaW5lclR5cGUgPSAnZXhwYW5zaW9uLXBhbmVsJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAvLyAnZGl2JywgJ2ZsZXgnLCAndGFiJywgJ2NvbmRpdGlvbmFsJywgJ2FjdGlvbnMnXG4gICAgICAgIHRoaXMuY29udGFpbmVyVHlwZSA9ICdkaXYnO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZUV4cGFuZGVkKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZXhwYW5kYWJsZSkgeyB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7IH1cbiAgfVxuXG4gIC8vIFNldCBhdHRyaWJ1dGVzIGZvciBmbGV4Ym94IGNvbnRhaW5lclxuICAvLyAoY2hpbGQgYXR0cmlidXRlcyBhcmUgc2V0IGluIGZsZXgtbGF5b3V0LXJvb3QuY29tcG9uZW50KVxuICBnZXRGbGV4QXR0cmlidXRlKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZmxleEFjdGl2ZTogYm9vbGVhbiA9XG4gICAgICB0aGlzLmxheW91dE5vZGUudHlwZSA9PT0gJ2ZsZXgnIHx8XG4gICAgICAhIXRoaXMub3B0aW9ucy5kaXNwbGF5RmxleCB8fFxuICAgICAgdGhpcy5vcHRpb25zLmRpc3BsYXkgPT09ICdmbGV4JztcbiAgICAvLyBpZiAoYXR0cmlidXRlICE9PSAnZmxleCcgJiYgIWZsZXhBY3RpdmUpIHsgcmV0dXJuIG51bGw7IH1cbiAgICBzd2l0Y2ggKGF0dHJpYnV0ZSkge1xuICAgICAgY2FzZSAnaXMtZmxleCc6XG4gICAgICAgIHJldHVybiBmbGV4QWN0aXZlO1xuICAgICAgY2FzZSAnZGlzcGxheSc6XG4gICAgICAgIHJldHVybiBmbGV4QWN0aXZlID8gJ2ZsZXgnIDogJ2luaXRpYWwnO1xuICAgICAgY2FzZSAnZmxleC1kaXJlY3Rpb24nOiBjYXNlICdmbGV4LXdyYXAnOlxuICAgICAgICBjb25zdCBpbmRleCA9IFsnZmxleC1kaXJlY3Rpb24nLCAnZmxleC13cmFwJ10uaW5kZXhPZihhdHRyaWJ1dGUpO1xuICAgICAgICByZXR1cm4gKHRoaXMub3B0aW9uc1snZmxleC1mbG93J10gfHwgJycpLnNwbGl0KC9cXHMrLylbaW5kZXhdIHx8XG4gICAgICAgICAgdGhpcy5vcHRpb25zW2F0dHJpYnV0ZV0gfHwgWydjb2x1bW4nLCAnbm93cmFwJ11baW5kZXhdO1xuICAgICAgY2FzZSAnanVzdGlmeS1jb250ZW50JzogY2FzZSAnYWxpZ24taXRlbXMnOiBjYXNlICdhbGlnbi1jb250ZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1thdHRyaWJ1dGVdO1xuICAgICAgY2FzZSAnbGF5b3V0JzpcbiAgICAgICAgcmV0dXJuICh0aGlzLm9wdGlvbnMuZnhMYXlvdXQgfHwgJ3JvdycpICtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuZnhMYXlvdXRXcmFwID8gJyAnICsgdGhpcy5vcHRpb25zLmZ4TGF5b3V0V3JhcCA6ICcnO1xuXG4gICAgfVxuICB9XG59XG4iXX0=