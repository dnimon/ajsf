import { Framework } from './framework';
import { hasOwn } from '../shared/utility.functions';
import { Inject, Injectable } from '@angular/core';
import { WidgetLibraryService } from '../widget-library/widget-library.service';
import * as i0 from "@angular/core";
import * as i1 from "./framework";
import * as i2 from "../widget-library/widget-library.service";
// Possible future frameworks:
// - Foundation 6:
//   http://justindavis.co/2017/06/15/using-foundation-6-in-angular-4/
//   https://github.com/zurb/foundation-sites
// - Semantic UI:
//   https://github.com/edcarroll/ng2-semantic-ui
//   https://github.com/vladotesanovic/ngSemantic
export class FrameworkLibraryService {
    constructor(frameworks, widgetLibrary) {
        this.frameworks = frameworks;
        this.widgetLibrary = widgetLibrary;
        this.activeFramework = null;
        this.loadExternalAssets = false;
        this.frameworkLibrary = {};
        this.frameworks.forEach(framework => this.frameworkLibrary[framework.name] = framework);
        this.defaultFramework = this.frameworks[0].name;
        this.setFramework(this.defaultFramework);
    }
    setLoadExternalAssets(loadExternalAssets = true) {
        this.loadExternalAssets = !!loadExternalAssets;
    }
    setFramework(framework = this.defaultFramework, loadExternalAssets = this.loadExternalAssets) {
        this.activeFramework =
            typeof framework === 'string' && this.hasFramework(framework) ?
                this.frameworkLibrary[framework] :
                typeof framework === 'object' && hasOwn(framework, 'framework') ?
                    framework :
                    this.frameworkLibrary[this.defaultFramework];
        return this.registerFrameworkWidgets(this.activeFramework);
    }
    registerFrameworkWidgets(framework) {
        return hasOwn(framework, 'widgets') ?
            this.widgetLibrary.registerFrameworkWidgets(framework.widgets) :
            this.widgetLibrary.unRegisterFrameworkWidgets();
    }
    hasFramework(type) {
        return hasOwn(this.frameworkLibrary, type);
    }
    getFramework() {
        if (!this.activeFramework) {
            this.setFramework('default', true);
        }
        return this.activeFramework.framework;
    }
    getFrameworkWidgets() {
        return this.activeFramework.widgets || {};
    }
    getFrameworkStylesheets(load = this.loadExternalAssets) {
        return (load && this.activeFramework.stylesheets) || [];
    }
    getFrameworkScripts(load = this.loadExternalAssets) {
        return (load && this.activeFramework.scripts) || [];
    }
}
FrameworkLibraryService.ɵprov = i0.ɵɵdefineInjectable({ factory: function FrameworkLibraryService_Factory() { return new FrameworkLibraryService(i0.ɵɵinject(i1.Framework), i0.ɵɵinject(i2.WidgetLibraryService)); }, token: FrameworkLibraryService, providedIn: "root" });
FrameworkLibraryService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
FrameworkLibraryService.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [Framework,] }] },
    { type: WidgetLibraryService, decorators: [{ type: Inject, args: [WidgetLibraryService,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIvaG9tZS9kbmltb24vRG9jdW1lbnRzL2dpdC9jb252ZXBheS9hanNmL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQzs7OztBQUVoRiw4QkFBOEI7QUFDOUIsa0JBQWtCO0FBQ2xCLHNFQUFzRTtBQUN0RSw2Q0FBNkM7QUFDN0MsaUJBQWlCO0FBQ2pCLGlEQUFpRDtBQUNqRCxpREFBaUQ7QUFLakQsTUFBTSxPQUFPLHVCQUF1QjtJQVFsQyxZQUM2QixVQUFpQixFQUNOLGFBQW1DO1FBRDlDLGVBQVUsR0FBVixVQUFVLENBQU87UUFDTixrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7UUFUM0Usb0JBQWUsR0FBYyxJQUFJLENBQUM7UUFHbEMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRTNCLHFCQUFnQixHQUFrQyxFQUFFLENBQUM7UUFNbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQ2xELENBQUM7UUFDRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0scUJBQXFCLENBQUMsa0JBQWtCLEdBQUcsSUFBSTtRQUNwRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDO0lBQ2pELENBQUM7SUFFTSxZQUFZLENBQ2pCLFlBQThCLElBQUksQ0FBQyxnQkFBZ0IsRUFDbkQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQjtRQUU1QyxJQUFJLENBQUMsZUFBZTtZQUNsQixPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDL0QsU0FBUyxDQUFDLENBQUM7b0JBQ1gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsd0JBQXdCLENBQUMsU0FBb0I7UUFDM0MsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFlBQVksQ0FBQyxJQUFZO1FBQzlCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sWUFBWTtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQUU7UUFDbEUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sbUJBQW1CO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxPQUFnQixJQUFJLENBQUMsa0JBQWtCO1FBQ3BFLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUQsQ0FBQztJQUVNLG1CQUFtQixDQUFDLE9BQWdCLElBQUksQ0FBQyxrQkFBa0I7UUFDaEUsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RCxDQUFDOzs7O1lBaEVGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7O3dDQVVJLE1BQU0sU0FBQyxTQUFTO1lBdEJaLG9CQUFvQix1QkF1QnhCLE1BQU0sU0FBQyxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICcuL2ZyYW1ld29yayc7XG5pbXBvcnQgeyBoYXNPd24gfSBmcm9tICcuLi9zaGFyZWQvdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBXaWRnZXRMaWJyYXJ5U2VydmljZSB9IGZyb20gJy4uL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5LnNlcnZpY2UnO1xuXG4vLyBQb3NzaWJsZSBmdXR1cmUgZnJhbWV3b3Jrczpcbi8vIC0gRm91bmRhdGlvbiA2OlxuLy8gICBodHRwOi8vanVzdGluZGF2aXMuY28vMjAxNy8wNi8xNS91c2luZy1mb3VuZGF0aW9uLTYtaW4tYW5ndWxhci00L1xuLy8gICBodHRwczovL2dpdGh1Yi5jb20venVyYi9mb3VuZGF0aW9uLXNpdGVzXG4vLyAtIFNlbWFudGljIFVJOlxuLy8gICBodHRwczovL2dpdGh1Yi5jb20vZWRjYXJyb2xsL25nMi1zZW1hbnRpYy11aVxuLy8gICBodHRwczovL2dpdGh1Yi5jb20vdmxhZG90ZXNhbm92aWMvbmdTZW1hbnRpY1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2Uge1xuICBhY3RpdmVGcmFtZXdvcms6IEZyYW1ld29yayA9IG51bGw7XG4gIHN0eWxlc2hlZXRzOiAoSFRNTFN0eWxlRWxlbWVudHxIVE1MTGlua0VsZW1lbnQpW107XG4gIHNjcmlwdHM6IEhUTUxTY3JpcHRFbGVtZW50W107XG4gIGxvYWRFeHRlcm5hbEFzc2V0cyA9IGZhbHNlO1xuICBkZWZhdWx0RnJhbWV3b3JrOiBzdHJpbmc7XG4gIGZyYW1ld29ya0xpYnJhcnk6IHsgW25hbWU6IHN0cmluZ106IEZyYW1ld29yayB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChGcmFtZXdvcmspIHByaXZhdGUgZnJhbWV3b3JrczogYW55W10sXG4gICAgQEluamVjdChXaWRnZXRMaWJyYXJ5U2VydmljZSkgcHJpdmF0ZSB3aWRnZXRMaWJyYXJ5OiBXaWRnZXRMaWJyYXJ5U2VydmljZVxuICApIHtcbiAgICB0aGlzLmZyYW1ld29ya3MuZm9yRWFjaChmcmFtZXdvcmsgPT5cbiAgICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeVtmcmFtZXdvcmsubmFtZV0gPSBmcmFtZXdvcmtcbiAgICApO1xuICAgIHRoaXMuZGVmYXVsdEZyYW1ld29yayA9IHRoaXMuZnJhbWV3b3Jrc1swXS5uYW1lO1xuICAgIHRoaXMuc2V0RnJhbWV3b3JrKHRoaXMuZGVmYXVsdEZyYW1ld29yayk7XG4gIH1cblxuICBwdWJsaWMgc2V0TG9hZEV4dGVybmFsQXNzZXRzKGxvYWRFeHRlcm5hbEFzc2V0cyA9IHRydWUpOiB2b2lkIHtcbiAgICB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyA9ICEhbG9hZEV4dGVybmFsQXNzZXRzO1xuICB9XG5cbiAgcHVibGljIHNldEZyYW1ld29yayhcbiAgICBmcmFtZXdvcms6IHN0cmluZ3xGcmFtZXdvcmsgPSB0aGlzLmRlZmF1bHRGcmFtZXdvcmssXG4gICAgbG9hZEV4dGVybmFsQXNzZXRzID0gdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHNcbiAgKTogYm9vbGVhbiB7XG4gICAgdGhpcy5hY3RpdmVGcmFtZXdvcmsgPVxuICAgICAgdHlwZW9mIGZyYW1ld29yayA9PT0gJ3N0cmluZycgJiYgdGhpcy5oYXNGcmFtZXdvcmsoZnJhbWV3b3JrKSA/XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeVtmcmFtZXdvcmtdIDpcbiAgICAgIHR5cGVvZiBmcmFtZXdvcmsgPT09ICdvYmplY3QnICYmIGhhc093bihmcmFtZXdvcmssICdmcmFtZXdvcmsnKSA/XG4gICAgICAgIGZyYW1ld29yayA6XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeVt0aGlzLmRlZmF1bHRGcmFtZXdvcmtdO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyRnJhbWV3b3JrV2lkZ2V0cyh0aGlzLmFjdGl2ZUZyYW1ld29yayk7XG4gIH1cblxuICByZWdpc3RlckZyYW1ld29ya1dpZGdldHMoZnJhbWV3b3JrOiBGcmFtZXdvcmspOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGFzT3duKGZyYW1ld29yaywgJ3dpZGdldHMnKSA/XG4gICAgICB0aGlzLndpZGdldExpYnJhcnkucmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzKGZyYW1ld29yay53aWRnZXRzKSA6XG4gICAgICB0aGlzLndpZGdldExpYnJhcnkudW5SZWdpc3RlckZyYW1ld29ya1dpZGdldHMoKTtcbiAgfVxuXG4gIHB1YmxpYyBoYXNGcmFtZXdvcmsodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhhc093bih0aGlzLmZyYW1ld29ya0xpYnJhcnksIHR5cGUpO1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29yaygpOiBhbnkge1xuICAgIGlmICghdGhpcy5hY3RpdmVGcmFtZXdvcmspIHsgdGhpcy5zZXRGcmFtZXdvcmsoJ2RlZmF1bHQnLCB0cnVlKTsgfVxuICAgIHJldHVybiB0aGlzLmFjdGl2ZUZyYW1ld29yay5mcmFtZXdvcms7XG4gIH1cblxuICBwdWJsaWMgZ2V0RnJhbWV3b3JrV2lkZ2V0cygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZUZyYW1ld29yay53aWRnZXRzIHx8IHt9O1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29ya1N0eWxlc2hlZXRzKGxvYWQ6IGJvb2xlYW4gPSB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gKGxvYWQgJiYgdGhpcy5hY3RpdmVGcmFtZXdvcmsuc3R5bGVzaGVldHMpIHx8IFtdO1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29ya1NjcmlwdHMobG9hZDogYm9vbGVhbiA9IHRoaXMubG9hZEV4dGVybmFsQXNzZXRzKTogc3RyaW5nW10ge1xuICAgIHJldHVybiAobG9hZCAmJiB0aGlzLmFjdGl2ZUZyYW1ld29yay5zY3JpcHRzKSB8fCBbXTtcbiAgfVxufVxuIl19