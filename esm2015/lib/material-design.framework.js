import { Injectable } from '@angular/core';
import { Framework } from '@ajsf/core';
import { FlexLayoutRootComponent, FlexLayoutSectionComponent, MaterialAddReferenceComponent, MaterialButtonComponent, MaterialButtonGroupComponent, MaterialCheckboxComponent, MaterialCheckboxesComponent, MaterialChipListComponent, MaterialDatepickerComponent, MaterialDesignFrameworkComponent, MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent, MaterialOneOfComponent, MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent, MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent } from './widgets/public_api';
// Material Design Framework
// https://github.com/angular/material2
export class MaterialDesignFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this.widgets = {
            'root': FlexLayoutRootComponent,
            'section': FlexLayoutSectionComponent,
            '$ref': MaterialAddReferenceComponent,
            'button': MaterialButtonComponent,
            'button-group': MaterialButtonGroupComponent,
            'checkbox': MaterialCheckboxComponent,
            'checkboxes': MaterialCheckboxesComponent,
            'chip-list': MaterialChipListComponent,
            'date': MaterialDatepickerComponent,
            'file': MaterialFileComponent,
            'number': MaterialNumberComponent,
            'one-of': MaterialOneOfComponent,
            'radios': MaterialRadiosComponent,
            'select': MaterialSelectComponent,
            'slider': MaterialSliderComponent,
            'stepper': MaterialStepperComponent,
            'tabs': MaterialTabsComponent,
            'text': MaterialInputComponent,
            'textarea': MaterialTextareaComponent,
            'alt-date': 'date',
            'any-of': 'one-of',
            'card': 'section',
            'color': 'text',
            'expansion-panel': 'section',
            'hidden': 'none',
            'image': 'none',
            'integer': 'number',
            'radiobuttons': 'button-group',
            'range': 'slider',
            'submit': 'button',
            'tagsinput': 'chip-list',
            'wizard': 'stepper',
        };
    }
}
MaterialDesignFramework.decorators = [
    { type: Injectable }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtbWF0ZXJpYWwvc3JjL2xpYi9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLDBCQUEwQixFQUMxQiw2QkFBNkIsRUFDN0IsdUJBQXVCLEVBQ3ZCLDRCQUE0QixFQUM1Qix5QkFBeUIsRUFDekIsMkJBQTJCLEVBQzNCLHlCQUF5QixFQUN6QiwyQkFBMkIsRUFDM0IsZ0NBQWdDLEVBQ2hDLHFCQUFxQixFQUNyQixzQkFBc0IsRUFDdEIsdUJBQXVCLEVBQ3ZCLHNCQUFzQixFQUN0Qix1QkFBdUIsRUFDdkIsdUJBQXVCLEVBQ3ZCLHVCQUF1QixFQUN2Qix3QkFBd0IsRUFDeEIscUJBQXFCLEVBQ3JCLHlCQUF5QixFQUMxQixNQUFNLHNCQUFzQixDQUFDO0FBRzlCLDRCQUE0QjtBQUM1Qix1Q0FBdUM7QUFHdkMsTUFBTSxPQUFPLHVCQUF3QixTQUFRLFNBQVM7SUFEdEQ7O1FBRUUsU0FBSSxHQUFHLGlCQUFpQixDQUFDO1FBRXpCLGNBQVMsR0FBRyxnQ0FBZ0MsQ0FBQztRQUU3QyxnQkFBVyxHQUFHO1lBQ1osbURBQW1EO1lBQ25ELDBEQUEwRDtTQUMzRCxDQUFDO1FBRUYsWUFBTyxHQUFHO1lBQ1IsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixTQUFTLEVBQUUsMEJBQTBCO1lBQ3JDLE1BQU0sRUFBRSw2QkFBNkI7WUFDckMsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxjQUFjLEVBQUUsNEJBQTRCO1lBQzVDLFVBQVUsRUFBRSx5QkFBeUI7WUFDckMsWUFBWSxFQUFFLDJCQUEyQjtZQUN6QyxXQUFXLEVBQUUseUJBQXlCO1lBQ3RDLE1BQU0sRUFBRSwyQkFBMkI7WUFDbkMsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFFBQVEsRUFBRSxzQkFBc0I7WUFDaEMsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsU0FBUyxFQUFFLHdCQUF3QjtZQUNuQyxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLE1BQU0sRUFBRSxzQkFBc0I7WUFDOUIsVUFBVSxFQUFFLHlCQUF5QjtZQUNyQyxVQUFVLEVBQUUsTUFBTTtZQUNsQixRQUFRLEVBQUUsUUFBUTtZQUNsQixNQUFNLEVBQUUsU0FBUztZQUNqQixPQUFPLEVBQUUsTUFBTTtZQUNmLGlCQUFpQixFQUFFLFNBQVM7WUFDNUIsUUFBUSxFQUFFLE1BQU07WUFDaEIsT0FBTyxFQUFFLE1BQU07WUFDZixTQUFTLEVBQUUsUUFBUTtZQUNuQixjQUFjLEVBQUUsY0FBYztZQUM5QixPQUFPLEVBQUUsUUFBUTtZQUNqQixRQUFRLEVBQUUsUUFBUTtZQUNsQixXQUFXLEVBQUUsV0FBVztZQUN4QixRQUFRLEVBQUUsU0FBUztTQUNwQixDQUFDO0lBQ0osQ0FBQzs7O1lBN0NBLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGcmFtZXdvcmt9IGZyb20gJ0BhanNmL2NvcmUnO1xuaW1wb3J0IHtcbiAgRmxleExheW91dFJvb3RDb21wb25lbnQsXG4gIEZsZXhMYXlvdXRTZWN0aW9uQ29tcG9uZW50LFxuICBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCxcbiAgTWF0ZXJpYWxCdXR0b25Db21wb25lbnQsXG4gIE1hdGVyaWFsQnV0dG9uR3JvdXBDb21wb25lbnQsXG4gIE1hdGVyaWFsQ2hlY2tib3hDb21wb25lbnQsXG4gIE1hdGVyaWFsQ2hlY2tib3hlc0NvbXBvbmVudCxcbiAgTWF0ZXJpYWxDaGlwTGlzdENvbXBvbmVudCxcbiAgTWF0ZXJpYWxEYXRlcGlja2VyQ29tcG9uZW50LFxuICBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudCxcbiAgTWF0ZXJpYWxGaWxlQ29tcG9uZW50LFxuICBNYXRlcmlhbElucHV0Q29tcG9uZW50LFxuICBNYXRlcmlhbE51bWJlckNvbXBvbmVudCxcbiAgTWF0ZXJpYWxPbmVPZkNvbXBvbmVudCxcbiAgTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQsXG4gIE1hdGVyaWFsU2VsZWN0Q29tcG9uZW50LFxuICBNYXRlcmlhbFNsaWRlckNvbXBvbmVudCxcbiAgTWF0ZXJpYWxTdGVwcGVyQ29tcG9uZW50LFxuICBNYXRlcmlhbFRhYnNDb21wb25lbnQsXG4gIE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnRcbn0gZnJvbSAnLi93aWRnZXRzL3B1YmxpY19hcGknO1xuXG5cbi8vIE1hdGVyaWFsIERlc2lnbiBGcmFtZXdvcmtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMlxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmsgZXh0ZW5kcyBGcmFtZXdvcmsge1xuICBuYW1lID0gJ21hdGVyaWFsLWRlc2lnbic7XG5cbiAgZnJhbWV3b3JrID0gTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtDb21wb25lbnQ7XG5cbiAgc3R5bGVzaGVldHMgPSBbXG4gICAgJy8vZm9udHMuZ29vZ2xlYXBpcy5jb20vaWNvbj9mYW1pbHk9TWF0ZXJpYWwrSWNvbnMnLFxuICAgICcvL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2Nzcz9mYW1pbHk9Um9ib3RvOjMwMCw0MDAsNTAwLDcwMCcsXG4gIF07XG5cbiAgd2lkZ2V0cyA9IHtcbiAgICAncm9vdCc6IEZsZXhMYXlvdXRSb290Q29tcG9uZW50LFxuICAgICdzZWN0aW9uJzogRmxleExheW91dFNlY3Rpb25Db21wb25lbnQsXG4gICAgJyRyZWYnOiBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCxcbiAgICAnYnV0dG9uJzogTWF0ZXJpYWxCdXR0b25Db21wb25lbnQsXG4gICAgJ2J1dHRvbi1ncm91cCc6IE1hdGVyaWFsQnV0dG9uR3JvdXBDb21wb25lbnQsXG4gICAgJ2NoZWNrYm94JzogTWF0ZXJpYWxDaGVja2JveENvbXBvbmVudCxcbiAgICAnY2hlY2tib3hlcyc6IE1hdGVyaWFsQ2hlY2tib3hlc0NvbXBvbmVudCxcbiAgICAnY2hpcC1saXN0JzogTWF0ZXJpYWxDaGlwTGlzdENvbXBvbmVudCxcbiAgICAnZGF0ZSc6IE1hdGVyaWFsRGF0ZXBpY2tlckNvbXBvbmVudCxcbiAgICAnZmlsZSc6IE1hdGVyaWFsRmlsZUNvbXBvbmVudCxcbiAgICAnbnVtYmVyJzogTWF0ZXJpYWxOdW1iZXJDb21wb25lbnQsXG4gICAgJ29uZS1vZic6IE1hdGVyaWFsT25lT2ZDb21wb25lbnQsXG4gICAgJ3JhZGlvcyc6IE1hdGVyaWFsUmFkaW9zQ29tcG9uZW50LFxuICAgICdzZWxlY3QnOiBNYXRlcmlhbFNlbGVjdENvbXBvbmVudCxcbiAgICAnc2xpZGVyJzogTWF0ZXJpYWxTbGlkZXJDb21wb25lbnQsXG4gICAgJ3N0ZXBwZXInOiBNYXRlcmlhbFN0ZXBwZXJDb21wb25lbnQsXG4gICAgJ3RhYnMnOiBNYXRlcmlhbFRhYnNDb21wb25lbnQsXG4gICAgJ3RleHQnOiBNYXRlcmlhbElucHV0Q29tcG9uZW50LFxuICAgICd0ZXh0YXJlYSc6IE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnQsXG4gICAgJ2FsdC1kYXRlJzogJ2RhdGUnLFxuICAgICdhbnktb2YnOiAnb25lLW9mJyxcbiAgICAnY2FyZCc6ICdzZWN0aW9uJyxcbiAgICAnY29sb3InOiAndGV4dCcsXG4gICAgJ2V4cGFuc2lvbi1wYW5lbCc6ICdzZWN0aW9uJyxcbiAgICAnaGlkZGVuJzogJ25vbmUnLFxuICAgICdpbWFnZSc6ICdub25lJyxcbiAgICAnaW50ZWdlcic6ICdudW1iZXInLFxuICAgICdyYWRpb2J1dHRvbnMnOiAnYnV0dG9uLWdyb3VwJyxcbiAgICAncmFuZ2UnOiAnc2xpZGVyJyxcbiAgICAnc3VibWl0JzogJ2J1dHRvbicsXG4gICAgJ3RhZ3NpbnB1dCc6ICdjaGlwLWxpc3QnLFxuICAgICd3aXphcmQnOiAnc3RlcHBlcicsXG4gIH07XG59XG4iXX0=