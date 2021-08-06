import { Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService, WidgetLibraryModule, WidgetLibraryService } from '@ajsf/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MaterialDesignFramework } from './material-design.framework';
import { MATERIAL_FRAMEWORK_COMPONENTS } from './widgets/public_api';
import { fixAngularFlex } from './angular-flex-monkey-patch';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MomentUtcDateAdapter } from './widgets/mat-utc-date-adapter';
import { DateAdapter } from '@angular/material/core';
import { MaterialFileInputModule } from 'ngx-material-file-input';
/**
 * unused @angular/material modules:
 * MatDialogModule, MatGridListModule, MatListModule, MatMenuModule,
 * MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
 * MatSidenavModule, MatSnackBarModule, MatSortModule, MatTableModule,
 * ,
 */
export const ANGULAR_MATERIAL_MODULES = [
    MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
    MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
    MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
    MatStepperModule, MatTabsModule, MatTooltipModule,
    MatToolbarModule, MatMenuModule, MatToolbarModule,
];
export class MaterialDesignFrameworkModule {
    constructor() {
        fixAngularFlex();
    }
}
MaterialDesignFrameworkModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    FlexLayoutModule,
                    ...ANGULAR_MATERIAL_MODULES,
                    WidgetLibraryModule,
                    JsonSchemaFormModule,
                    MatMomentDateModule,
                    MaterialFileInputModule,
                ],
                declarations: [
                    ...MATERIAL_FRAMEWORK_COMPONENTS,
                ],
                exports: [
                    JsonSchemaFormModule,
                    ...MATERIAL_FRAMEWORK_COMPONENTS,
                ],
                providers: [
                    JsonSchemaFormService,
                    FrameworkLibraryService,
                    WidgetLibraryService,
                    { provide: Framework, useClass: MaterialDesignFramework, multi: true },
                    { provide: DateAdapter, useClass: MomentUtcDateAdapter }
                ],
                entryComponents: [
                    ...MATERIAL_FRAMEWORK_COMPONENTS,
                ]
            },] }
];
MaterialDesignFrameworkModule.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLHFCQUFxQixFQUNyQixtQkFBbUIsRUFBRSxvQkFBb0IsRUFDMUMsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN0RSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzNELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDdkQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDekQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzNELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG1CQUFtQixFQUFtQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3hHLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFBO0FBQ25FLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVsRTs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRztJQUN0QyxxQkFBcUIsRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsYUFBYTtJQUM1RSxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCO0lBQzFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsbUJBQW1CO0lBQ3RFLGNBQWMsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLG9CQUFvQjtJQUN0RSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO0lBQ2pELGdCQUFnQixFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7Q0FDbEQsQ0FBQztBQWdDRixNQUFNLE9BQU8sNkJBQTZCO0lBQ3hDO1FBQ0UsY0FBYyxFQUFFLENBQUM7SUFDbkIsQ0FBQzs7O1lBakNGLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWTtvQkFDWixXQUFXO29CQUNYLG1CQUFtQjtvQkFDbkIsZ0JBQWdCO29CQUNoQixHQUFHLHdCQUF3QjtvQkFDM0IsbUJBQW1CO29CQUNuQixvQkFBb0I7b0JBQ3BCLG1CQUFtQjtvQkFDbkIsdUJBQXVCO2lCQUN4QjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1osR0FBRyw2QkFBNkI7aUJBQ2pDO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxvQkFBb0I7b0JBQ3BCLEdBQUcsNkJBQTZCO2lCQUNqQztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QscUJBQXFCO29CQUNyQix1QkFBdUI7b0JBQ3ZCLG9CQUFvQjtvQkFDcEIsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO29CQUNwRSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFO2lCQUN6RDtnQkFDRCxlQUFlLEVBQUU7b0JBQ2YsR0FBRyw2QkFBNkI7aUJBQ2pDO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBGcmFtZXdvcmssXG4gIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICBXaWRnZXRMaWJyYXJ5TW9kdWxlLCBXaWRnZXRMaWJyYXJ5U2VydmljZVxufSBmcm9tICdAYWpzZi9jb3JlJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0Zvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0ZsZXhMYXlvdXRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2ZsZXgtbGF5b3V0JztcbmltcG9ydCB7TWF0QXV0b2NvbXBsZXRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9hdXRvY29tcGxldGUnO1xuaW1wb3J0IHtNYXRCdXR0b25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XG5pbXBvcnQge01hdEJ1dHRvblRvZ2dsZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uLXRvZ2dsZSc7XG5pbXBvcnQge01hdENhcmRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NhcmQnO1xuaW1wb3J0IHtNYXRDaGVja2JveE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2hlY2tib3gnO1xuaW1wb3J0IHtNYXRDaGlwc01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2hpcHMnO1xuaW1wb3J0IHtNYXROYXRpdmVEYXRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGF0ZXBpY2tlcic7XG5pbXBvcnQge01hdEV4cGFuc2lvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZXhwYW5zaW9uJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7TWF0SWNvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5pbXBvcnQge01hdElucHV0TW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCc7XG5pbXBvcnQge01hdFJhZGlvTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9yYWRpbyc7XG5pbXBvcnQge01hdFNlbGVjdE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0JztcbmltcG9ydCB7TWF0U2xpZGVUb2dnbGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NsaWRlLXRvZ2dsZSc7XG5pbXBvcnQge01hdFNsaWRlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2xpZGVyJztcbmltcG9ydCB7TWF0U3RlcHBlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc3RlcHBlcic7XG5pbXBvcnQge01hdFRhYnNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3RhYnMnO1xuaW1wb3J0IHtNYXRUb29sdGlwTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90b29sdGlwJztcbmltcG9ydCB7TWF0TWVudU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbWVudSc7XG5pbXBvcnQge01hdFRvb2xiYXJNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2xiYXInO1xuaW1wb3J0IHtNYXRlcmlhbERlc2lnbkZyYW1ld29ya30gZnJvbSAnLi9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrJztcbmltcG9ydCB7TUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFN9IGZyb20gJy4vd2lkZ2V0cy9wdWJsaWNfYXBpJztcbmltcG9ydCB7Zml4QW5ndWxhckZsZXh9IGZyb20gJy4vYW5ndWxhci1mbGV4LW1vbmtleS1wYXRjaCc7XG5pbXBvcnQgeyBNYXRNb21lbnREYXRlTW9kdWxlLCBNQVRfTU9NRU5UX0RBVEVfQURBUFRFUl9PUFRJT05TIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwtbW9tZW50LWFkYXB0ZXInO1xuaW1wb3J0IHtNb21lbnRVdGNEYXRlQWRhcHRlcn0gZnJvbSAnLi93aWRnZXRzL21hdC11dGMtZGF0ZS1hZGFwdGVyJ1xuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7IE1hdGVyaWFsRmlsZUlucHV0TW9kdWxlIH0gZnJvbSAnbmd4LW1hdGVyaWFsLWZpbGUtaW5wdXQnO1xuXG4vKipcbiAqIHVudXNlZCBAYW5ndWxhci9tYXRlcmlhbCBtb2R1bGVzOlxuICogTWF0RGlhbG9nTW9kdWxlLCBNYXRHcmlkTGlzdE1vZHVsZSwgTWF0TGlzdE1vZHVsZSwgTWF0TWVudU1vZHVsZSxcbiAqIE1hdFBhZ2luYXRvck1vZHVsZSwgTWF0UHJvZ3Jlc3NCYXJNb2R1bGUsIE1hdFByb2dyZXNzU3Bpbm5lck1vZHVsZSxcbiAqIE1hdFNpZGVuYXZNb2R1bGUsIE1hdFNuYWNrQmFyTW9kdWxlLCBNYXRTb3J0TW9kdWxlLCBNYXRUYWJsZU1vZHVsZSxcbiAqICxcbiAqL1xuZXhwb3J0IGNvbnN0IEFOR1VMQVJfTUFURVJJQUxfTU9EVUxFUyA9IFtcbiAgTWF0QXV0b2NvbXBsZXRlTW9kdWxlLCBNYXRCdXR0b25Nb2R1bGUsIE1hdEJ1dHRvblRvZ2dsZU1vZHVsZSwgTWF0Q2FyZE1vZHVsZSxcbiAgTWF0Q2hlY2tib3hNb2R1bGUsIE1hdENoaXBzTW9kdWxlLCBNYXREYXRlcGlja2VyTW9kdWxlLCBNYXRFeHBhbnNpb25Nb2R1bGUsXG4gIE1hdEZvcm1GaWVsZE1vZHVsZSwgTWF0SWNvbk1vZHVsZSwgTWF0SW5wdXRNb2R1bGUsIE1hdE5hdGl2ZURhdGVNb2R1bGUsXG4gIE1hdFJhZGlvTW9kdWxlLCBNYXRTZWxlY3RNb2R1bGUsIE1hdFNsaWRlck1vZHVsZSwgTWF0U2xpZGVUb2dnbGVNb2R1bGUsXG4gIE1hdFN0ZXBwZXJNb2R1bGUsIE1hdFRhYnNNb2R1bGUsIE1hdFRvb2x0aXBNb2R1bGUsXG4gIE1hdFRvb2xiYXJNb2R1bGUsIE1hdE1lbnVNb2R1bGUsIE1hdFRvb2xiYXJNb2R1bGUsXG5dO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIEZvcm1zTW9kdWxlLFxuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgRmxleExheW91dE1vZHVsZSxcbiAgICAuLi5BTkdVTEFSX01BVEVSSUFMX01PRFVMRVMsXG4gICAgV2lkZ2V0TGlicmFyeU1vZHVsZSxcbiAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICBNYXRNb21lbnREYXRlTW9kdWxlLFxuICAgIE1hdGVyaWFsRmlsZUlucHV0TW9kdWxlLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICAuLi5NQVRFUklBTF9GUkFNRVdPUktfQ09NUE9ORU5UUyxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIEpzb25TY2hlbWFGb3JtTW9kdWxlLFxuICAgIC4uLk1BVEVSSUFMX0ZSQU1FV09SS19DT01QT05FTlRTLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICAgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UsXG4gICAgV2lkZ2V0TGlicmFyeVNlcnZpY2UsXG4gICAge3Byb3ZpZGU6IEZyYW1ld29yaywgdXNlQ2xhc3M6IE1hdGVyaWFsRGVzaWduRnJhbWV3b3JrLCBtdWx0aTogdHJ1ZX0sXG4gICAgeyBwcm92aWRlOiBEYXRlQWRhcHRlciwgdXNlQ2xhc3M6IE1vbWVudFV0Y0RhdGVBZGFwdGVyIH1cbiAgXSxcbiAgZW50cnlDb21wb25lbnRzOiBbXG4gICAgLi4uTUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFMsXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtNb2R1bGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBmaXhBbmd1bGFyRmxleCgpO1xuICB9XG59XG4iXX0=