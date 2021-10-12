(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@ajsf/core'), require('rxjs'), require('@angular/material/form-field'), require('moment'), require('lodash/cloneDeep'), require('@angular/common'), require('@angular/forms'), require('@angular/flex-layout'), require('@angular/material/autocomplete'), require('@angular/material/button'), require('@angular/material/button-toggle'), require('@angular/material/card'), require('@angular/material/checkbox'), require('@angular/material/chips'), require('@angular/material/core'), require('@angular/material/datepicker'), require('@angular/material/expansion'), require('@angular/material/icon'), require('@angular/material/input'), require('@angular/material/radio'), require('@angular/material/select'), require('@angular/material/slide-toggle'), require('@angular/material/slider'), require('@angular/material/stepper'), require('@angular/material/tabs'), require('@angular/material/tooltip'), require('@angular/material/menu'), require('@angular/material/toolbar'), require('@angular/flex-layout/core'), require('@angular/material-moment-adapter'), require('ngx-material-file-input')) :
    typeof define === 'function' && define.amd ? define('@ajsf/material', ['exports', '@angular/core', '@ajsf/core', 'rxjs', '@angular/material/form-field', 'moment', 'lodash/cloneDeep', '@angular/common', '@angular/forms', '@angular/flex-layout', '@angular/material/autocomplete', '@angular/material/button', '@angular/material/button-toggle', '@angular/material/card', '@angular/material/checkbox', '@angular/material/chips', '@angular/material/core', '@angular/material/datepicker', '@angular/material/expansion', '@angular/material/icon', '@angular/material/input', '@angular/material/radio', '@angular/material/select', '@angular/material/slide-toggle', '@angular/material/slider', '@angular/material/stepper', '@angular/material/tabs', '@angular/material/tooltip', '@angular/material/menu', '@angular/material/toolbar', '@angular/flex-layout/core', '@angular/material-moment-adapter', 'ngx-material-file-input'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ajsf = global.ajsf || {}, global.ajsf.material = {}), global.ng.core, global['@ajsf/core'], global.rxjs, global.ng.material.formField, global.moment, global['lodash-es'], global.ng.common, global.ng.forms, global.ng.flexLayout, global.ng.material.autocomplete, global.ng.material.button, global.ng.material.buttonToggle, global.ng.material.card, global.ng.material.checkbox, global.ng.material.chips, global.ng.material.core, global.ng.material.datepicker, global.ng.material.expansion, global.ng.material.icon, global.ng.material.input, global.ng.material.radio, global.ng.material.select, global.ng.material.slideToggle, global.ng.material.slider, global.ng.material.stepper, global.ng.material.tabs, global.ng.material.tooltip, global.ng.material.menu, global.ng.material.toolbar, global.ng.flexLayout.core, global.ng.materialMomentAdapter, global.ngxMaterialFileInput));
}(this, (function (exports, core, core$1, rxjs, formField, moment, cloneDeep, common, forms, flexLayout, autocomplete, button, buttonToggle, card, checkbox, chips, core$3, datepicker, expansion, icon, input, radio, select, slideToggle, slider, stepper, tabs, tooltip, menu, toolbar, core$2, materialMomentAdapter, ngxMaterialFileInput) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var moment__namespace = /*#__PURE__*/_interopNamespace(moment);
    var cloneDeep__default = /*#__PURE__*/_interopDefaultLegacy(cloneDeep);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || from);
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    var FlexLayoutRootComponent = /** @class */ (function () {
        function FlexLayoutRootComponent(jsf) {
            this.jsf = jsf;
            this.isFlexItem = false;
        }
        FlexLayoutRootComponent.prototype.removeItem = function (item) {
            this.jsf.removeItem(item);
        };
        // Set attributes for flexbox child
        // (container attributes are set in flex-layout-section.component)
        FlexLayoutRootComponent.prototype.getFlexAttribute = function (node, attribute) {
            var index = ['flex-grow', 'flex-shrink', 'flex-basis'].indexOf(attribute);
            return ((node.options || {}).flex || '').split(/\s+/)[index] ||
                (node.options || {})[attribute] || ['1', '1', 'auto'][index];
        };
        FlexLayoutRootComponent.prototype.showWidget = function (layoutNode) {
            return this.jsf.evaluateCondition(layoutNode, this.dataIndex);
        };
        return FlexLayoutRootComponent;
    }());
    FlexLayoutRootComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'flex-layout-root-widget',
                    template: "\n    <div *ngFor=\"let layoutNode of layout; let i = index\"\n      [class.form-flex-item]=\"isFlexItem\"\n      [ngClass]=\"layoutNode?.options.layoutHtmlClass\"\n      [style.flex-grow]=\"getFlexAttribute(layoutNode, 'flex-grow')\"\n      [style.flex-shrink]=\"getFlexAttribute(layoutNode, 'flex-shrink')\"\n      [style.flex-basis]=\"getFlexAttribute(layoutNode, 'flex-basis')\"\n      [style.align-self]=\"(layoutNode?.options || {})['align-self']\"\n      [style.order]=\"layoutNode?.options?.order\"\n      [fxFlex]=\"layoutNode?.options?.fxFlex\"\n      [fxFlexOrder]=\"layoutNode?.options?.fxFlexOrder\"\n      [fxFlexOffset]=\"layoutNode?.options?.fxFlexOffset\"\n      [fxFlexAlign]=\"layoutNode?.options?.fxFlexAlign\">\n      <select-framework-widget *ngIf=\"showWidget(layoutNode)\"\n        [dataIndex]=\"layoutNode?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])\"\n        [layoutIndex]=\"(layoutIndex || []).concat(i)\"\n        [parent]=\"parent\"\n        [layoutNode]=\"layoutNode\"></select-framework-widget>\n    <div>",
                    changeDetection: core.ChangeDetectionStrategy.Default
                },] }
    ];
    FlexLayoutRootComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    FlexLayoutRootComponent.propDecorators = {
        dataIndex: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        layout: [{ type: core.Input }],
        isFlexItem: [{ type: core.Input }],
        parent: [{ type: core.Input }]
    };

    var FlexLayoutSectionComponent = /** @class */ (function () {
        function FlexLayoutSectionComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.expanded = true;
            this.containerType = 'div';
        }
        Object.defineProperty(FlexLayoutSectionComponent.prototype, "sectionTitle", {
            get: function () {
                return this.options.notitle ? null : this.jsf.setItemTitle(this);
            },
            enumerable: false,
            configurable: true
        });
        FlexLayoutSectionComponent.prototype.ngOnInit = function () {
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
        };
        FlexLayoutSectionComponent.prototype.toggleExpanded = function () {
            if (this.options.expandable) {
                this.expanded = !this.expanded;
            }
        };
        // Set attributes for flexbox container
        // (child attributes are set in flex-layout-root.component)
        FlexLayoutSectionComponent.prototype.getFlexAttribute = function (attribute) {
            var flexActive = this.layoutNode.type === 'flex' ||
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
                    var index = ['flex-direction', 'flex-wrap'].indexOf(attribute);
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
        };
        return FlexLayoutSectionComponent;
    }());
    FlexLayoutSectionComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'flex-layout-section-widget',
                    template: "\n    <div *ngIf=\"containerType === 'div'\"\n      [class]=\"options?.htmlClass || ''\"\n      [class.expandable]=\"options?.expandable && !expanded\"\n      [class.expanded]=\"options?.expandable && expanded\">\n      <label *ngIf=\"sectionTitle\"\n        [class]=\"'legend ' + (options?.labelHtmlClass || '')\"\n        [innerHTML]=\"sectionTitle\"\n        (click)=\"toggleExpanded()\"></label>\n      <flex-layout-root-widget *ngIf=\"expanded\"\n        [layout]=\"layoutNode.items\"\n        [parent]=\"parent\"\n        [dataIndex]=\"dataIndex\"\n        [layoutIndex]=\"layoutIndex\"\n        [isFlexItem]=\"getFlexAttribute('is-flex')\"\n        [class.form-flex-column]=\"getFlexAttribute('flex-direction') === 'column'\"\n        [class.form-flex-row]=\"getFlexAttribute('flex-direction') === 'row'\"\n        [style.display]=\"getFlexAttribute('display')\"\n        [style.flex-direction]=\"getFlexAttribute('flex-direction')\"\n        [style.flex-wrap]=\"getFlexAttribute('flex-wrap')\"\n        [style.justify-content]=\"getFlexAttribute('justify-content')\"\n        [style.align-items]=\"getFlexAttribute('align-items')\"\n        [style.align-content]=\"getFlexAttribute('align-content')\"\n        [fxLayout]=\"getFlexAttribute('layout')\"\n        [fxLayoutGap]=\"options?.fxLayoutGap\"\n        [fxLayoutAlign]=\"options?.fxLayoutAlign\"\n        [attr.fxFlexFill]=\"options?.fxLayoutAlign\"></flex-layout-root-widget>\n      <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n        [innerHTML]=\"options?.errorMessage\"></mat-error>\n    </div>\n\n    <fieldset *ngIf=\"containerType === 'fieldset'\"\n      [class]=\"options?.htmlClass || ''\"\n      [class.expandable]=\"options?.expandable && !expanded\"\n      [class.expanded]=\"options?.expandable && expanded\"\n      [disabled]=\"options?.readonly\">\n      <legend *ngIf=\"sectionTitle\"\n        [class]=\"'legend ' + (options?.labelHtmlClass || '')\"\n        [innerHTML]=\"sectionTitle\"\n        (click)=\"toggleExpanded()\"></legend>\n      <flex-layout-root-widget *ngIf=\"expanded\"\n        [layout]=\"layoutNode.items\"\n        [parent]=\"parent\"\n        [dataIndex]=\"dataIndex\"\n        [layoutIndex]=\"layoutIndex\"\n        [isFlexItem]=\"getFlexAttribute('is-flex')\"\n        [class.form-flex-column]=\"getFlexAttribute('flex-direction') === 'column'\"\n        [class.form-flex-row]=\"getFlexAttribute('flex-direction') === 'row'\"\n        [style.display]=\"getFlexAttribute('display')\"\n        [style.flex-direction]=\"getFlexAttribute('flex-direction')\"\n        [style.flex-wrap]=\"getFlexAttribute('flex-wrap')\"\n        [style.justify-content]=\"getFlexAttribute('justify-content')\"\n        [style.align-items]=\"getFlexAttribute('align-items')\"\n        [style.align-content]=\"getFlexAttribute('align-content')\"\n        [fxLayout]=\"getFlexAttribute('layout')\"\n        [fxLayoutGap]=\"options?.fxLayoutGap\"\n        [fxLayoutAlign]=\"options?.fxLayoutAlign\"\n        [attr.fxFlexFill]=\"options?.fxLayoutAlign\"></flex-layout-root-widget>\n      <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n        [innerHTML]=\"options?.errorMessage\"></mat-error>\n    </fieldset>\n\n    <mat-card *ngIf=\"containerType === 'card'\"\n      [ngClass]=\"options?.htmlClass || ''\"\n      [class.expandable]=\"options?.expandable && !expanded\"\n      [class.expanded]=\"options?.expandable && expanded\">\n      <mat-card-header *ngIf=\"sectionTitle\">\n        <legend\n          [class]=\"'legend ' + (options?.labelHtmlClass || '')\"\n          [innerHTML]=\"sectionTitle\"\n          (click)=\"toggleExpanded()\"></legend>\n      </mat-card-header>\n      <mat-card-content *ngIf=\"expanded\">\n        <fieldset [disabled]=\"options?.readonly\">\n          <flex-layout-root-widget *ngIf=\"expanded\"\n            [layout]=\"layoutNode.items\"\n            [parent]=\"parent\"\n            [dataIndex]=\"dataIndex\"\n            [layoutIndex]=\"layoutIndex\"\n            [isFlexItem]=\"getFlexAttribute('is-flex')\"\n            [class.form-flex-column]=\"getFlexAttribute('flex-direction') === 'column'\"\n            [class.form-flex-row]=\"getFlexAttribute('flex-direction') === 'row'\"\n            [style.display]=\"getFlexAttribute('display')\"\n            [style.flex-direction]=\"getFlexAttribute('flex-direction')\"\n            [style.flex-wrap]=\"getFlexAttribute('flex-wrap')\"\n            [style.justify-content]=\"getFlexAttribute('justify-content')\"\n            [style.align-items]=\"getFlexAttribute('align-items')\"\n            [style.align-content]=\"getFlexAttribute('align-content')\"\n            [fxLayout]=\"getFlexAttribute('layout')\"\n            [fxLayoutGap]=\"options?.fxLayoutGap\"\n            [fxLayoutAlign]=\"options?.fxLayoutAlign\"\n            [attr.fxFlexFill]=\"options?.fxLayoutAlign\"></flex-layout-root-widget>\n          </fieldset>\n      </mat-card-content>\n      <mat-card-footer>\n        <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n          [innerHTML]=\"options?.errorMessage\"></mat-error>\n      </mat-card-footer>\n    </mat-card>\n\n    <mat-expansion-panel *ngIf=\"containerType === 'expansion-panel'\"\n      [expanded]=\"expanded\"\n      [hideToggle]=\"!options?.expandable\">\n      <mat-expansion-panel-header>\n        <mat-panel-title>\n          <legend *ngIf=\"sectionTitle\"\n            [class]=\"options?.labelHtmlClass\"\n            [innerHTML]=\"sectionTitle\"\n            (click)=\"toggleExpanded()\"></legend>\n        </mat-panel-title>\n      </mat-expansion-panel-header>\n      <fieldset [disabled]=\"options?.readonly\">\n        <flex-layout-root-widget *ngIf=\"expanded\"\n          [layout]=\"layoutNode.items\"\n          [dataIndex]=\"dataIndex\"\n          [layoutIndex]=\"layoutIndex\"\n          [parent]=\"parent\"\n          [isFlexItem]=\"getFlexAttribute('is-flex')\"\n          [class.form-flex-column]=\"getFlexAttribute('flex-direction') === 'column'\"\n          [class.form-flex-row]=\"getFlexAttribute('flex-direction') === 'row'\"\n          [style.display]=\"getFlexAttribute('display')\"\n          [style.flex-direction]=\"getFlexAttribute('flex-direction')\"\n          [style.flex-wrap]=\"getFlexAttribute('flex-wrap')\"\n          [style.justify-content]=\"getFlexAttribute('justify-content')\"\n          [style.align-items]=\"getFlexAttribute('align-items')\"\n          [style.align-content]=\"getFlexAttribute('align-content')\"\n          [fxLayout]=\"getFlexAttribute('layout')\"\n          [fxLayoutGap]=\"options?.fxLayoutGap\"\n          [fxLayoutAlign]=\"options?.fxLayoutAlign\"\n          [attr.fxFlexFill]=\"options?.fxLayoutAlign\"></flex-layout-root-widget>\n      </fieldset>\n      <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n        [innerHTML]=\"options?.errorMessage\"></mat-error>\n    </mat-expansion-panel>",
                    styles: ["\n    fieldset { border: 0; margin: 0; padding: 0; }\n    .legend { font-weight: bold; }\n    .expandable > .legend:before { content: '\u25B6'; padding-right: .3em; }\n    .expanded > .legend:before { content: '\u25BC'; padding-right: .2em; }\n  "]
                },] }
    ];
    FlexLayoutSectionComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    FlexLayoutSectionComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }],
        parent: [{ type: core.Input }]
    };

    var MaterialAddReferenceComponent = /** @class */ (function () {
        function MaterialAddReferenceComponent(jsf) {
            this.jsf = jsf;
        }
        MaterialAddReferenceComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
        };
        Object.defineProperty(MaterialAddReferenceComponent.prototype, "showAddButton", {
            get: function () {
                return !this.layoutNode.arrayItem ||
                    this.layoutIndex[this.layoutIndex.length - 1] < this.options.maxItems;
            },
            enumerable: false,
            configurable: true
        });
        MaterialAddReferenceComponent.prototype.addItem = function (event) {
            event.preventDefault();
            this.jsf.addItem(this);
        };
        Object.defineProperty(MaterialAddReferenceComponent.prototype, "buttonText", {
            get: function () {
                var parent = {
                    dataIndex: this.dataIndex.slice(0, -1),
                    layoutIndex: this.layoutIndex.slice(0, -1),
                    layoutNode: this.jsf.getParentNode(this),
                };
                return parent.layoutNode.add ||
                    this.jsf.setArrayItemTitle(parent, this.layoutNode, this.itemCount);
            },
            enumerable: false,
            configurable: true
        });
        return MaterialAddReferenceComponent;
    }());
    MaterialAddReferenceComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-add-reference-widget',
                    template: "\n    <section [class]=\"options?.htmlClass || ''\" align=\"end\">\n      <button mat-raised-button *ngIf=\"showAddButton\"\n        [color]=\"options?.color || 'accent'\"\n        [disabled]=\"options?.readonly\"\n        (click)=\"addItem($event)\">\n        <span *ngIf=\"options?.icon\" [class]=\"options?.icon\"></span>\n        <span *ngIf=\"options?.title\" [innerHTML]=\"buttonText\"></span>\n      </button>\n    </section>",
                    changeDetection: core.ChangeDetectionStrategy.Default
                },] }
    ];
    MaterialAddReferenceComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialAddReferenceComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialButtonComponent = /** @class */ (function () {
        function MaterialButtonComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.subscriptions = new rxjs.Subscription();
        }
        MaterialButtonComponent.prototype.ngOnDestroy = function () {
            this.subscriptions.unsubscribe();
        };
        MaterialButtonComponent.prototype.ngOnInit = function () {
            var _this = this;
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
            if (core$1.hasOwn(this.options, 'disabled')) {
                this.controlDisabled = this.options.disabled;
            }
            else if (this.jsf.formOptions.disableInvalidSubmit) {
                this.controlDisabled = !this.jsf.isValid;
                this.subscriptions.add(this.jsf.isValidChanges.subscribe(function (isValid) { return _this.controlDisabled = !isValid; }));
            }
        };
        MaterialButtonComponent.prototype.updateValue = function (event) {
            if (typeof this.options.onClick === 'function') {
                this.options.onClick(event);
            }
            else {
                this.jsf.updateValue(this, event.target.value);
            }
        };
        return MaterialButtonComponent;
    }());
    MaterialButtonComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-button-widget',
                    template: "\n    <div class=\"button-row\" [class]=\"options?.htmlClass || ''\">\n      <button mat-raised-button\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [color]=\"options?.color || 'primary'\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [type]=\"layoutNode?.type\"\n        [value]=\"controlValue\"\n        (click)=\"updateValue($event)\">\n        <mat-icon *ngIf=\"options?.icon\" class=\"mat-24\">{{options?.icon}}</mat-icon>\n        <span *ngIf=\"options?.title\" [innerHTML]=\"options?.title\"></span>\n      </button>\n    </div>",
                    styles: [" button { margin-top: 10px; } "]
                },] }
    ];
    MaterialButtonComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialButtonComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialButtonGroupComponent = /** @class */ (function () {
        function MaterialButtonGroupComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.radiosList = [];
            this.vertical = false;
        }
        MaterialButtonGroupComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.radiosList = core$1.buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
            this.jsf.initializeControl(this);
        };
        MaterialButtonGroupComponent.prototype.updateValue = function (value) {
            this.options.showErrors = true;
            this.jsf.updateValue(this, value);
        };
        return MaterialButtonGroupComponent;
    }());
    MaterialButtonGroupComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-button-group-widget',
                    template: "\n    <div>\n      <div *ngIf=\"options?.title\">\n        <label\n          [attr.for]=\"'control' + layoutNode?._id\"\n          [class]=\"options?.labelHtmlClass || ''\"\n          [style.display]=\"options?.notitle ? 'none' : ''\"\n          [innerHTML]=\"options?.title\"></label>\n      </div>\n      <mat-button-toggle-group\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [attr.required]=\"options?.required\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [name]=\"controlName\"\n        [value]=\"controlValue\"\n        [vertical]=\"!!options.vertical\">\n        <mat-button-toggle *ngFor=\"let radioItem of radiosList\"\n          [id]=\"'control' + layoutNode?._id + '/' + radioItem?.name\"\n          [value]=\"radioItem?.value\"\n          (click)=\"updateValue(radioItem?.value)\">\n          <span [innerHTML]=\"radioItem?.name\"></span>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n        [innerHTML]=\"options?.errorMessage\"></mat-error>\n    </div>",
                    styles: [" mat-error { font-size: 75%; } "]
                },] }
    ];
    MaterialButtonGroupComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialButtonGroupComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialCheckboxComponent = /** @class */ (function () {
        function MaterialCheckboxComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.trueValue = true;
            this.falseValue = false;
            this.showSlideToggle = false;
        }
        MaterialCheckboxComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this, !this.options.readonly);
            if (this.controlValue === null || this.controlValue === undefined) {
                this.controlValue = false;
                this.jsf.updateValue(this, this.falseValue);
            }
            if (this.layoutNode.type === 'slide-toggle' ||
                this.layoutNode.format === 'slide-toggle') {
                this.showSlideToggle = true;
            }
        };
        MaterialCheckboxComponent.prototype.updateValue = function (event) {
            this.options.showErrors = true;
            this.jsf.updateValue(this, event.checked ? this.trueValue : this.falseValue);
        };
        Object.defineProperty(MaterialCheckboxComponent.prototype, "isChecked", {
            get: function () {
                return this.jsf.getFormControlValue(this) === this.trueValue;
            },
            enumerable: false,
            configurable: true
        });
        return MaterialCheckboxComponent;
    }());
    MaterialCheckboxComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-checkbox-widget',
                    template: "\n    <mat-checkbox *ngIf=\"boundControl && !showSlideToggle\"\n      [formControl]=\"formControl\"\n      align=\"left\"\n      [color]=\"options?.color || 'primary'\"\n      [id]=\"'control' + layoutNode?._id\"\n      labelPosition=\"after\"\n      [name]=\"controlName\"\n      (blur)=\"options.showErrors = true\">\n      <span *ngIf=\"options?.title\"\n        class=\"checkbox-name\"\n        [style.display]=\"options?.notitle ? 'none' : ''\"\n        [innerHTML]=\"options?.title\"></span>\n    </mat-checkbox>\n    <mat-checkbox *ngIf=\"!boundControl && !showSlideToggle\"\n      align=\"left\"\n      [color]=\"options?.color || 'primary'\"\n      [disabled]=\"controlDisabled || options?.readonly\"\n      [id]=\"'control' + layoutNode?._id\"\n      labelPosition=\"after\"\n      [name]=\"controlName\"\n      [checked]=\"isChecked\"\n      (blur)=\"options.showErrors = true\"\n      (change)=\"updateValue($event)\">\n      <span *ngIf=\"options?.title\"\n        class=\"checkbox-name\"\n        [style.display]=\"options?.notitle ? 'none' : ''\"\n        [innerHTML]=\"options?.title\"></span>\n    </mat-checkbox>\n    <mat-slide-toggle *ngIf=\"boundControl && showSlideToggle\"\n      [formControl]=\"formControl\"\n      align=\"left\"\n      [color]=\"options?.color || 'primary'\"\n      [id]=\"'control' + layoutNode?._id\"\n      labelPosition=\"after\"\n      [name]=\"controlName\"\n      (blur)=\"options.showErrors = true\">\n      <span *ngIf=\"options?.title\"\n        class=\"checkbox-name\"\n        [style.display]=\"options?.notitle ? 'none' : ''\"\n        [innerHTML]=\"options?.title\"></span>\n    </mat-slide-toggle>\n    <mat-slide-toggle *ngIf=\"!boundControl && showSlideToggle\"\n      align=\"left\"\n      [color]=\"options?.color || 'primary'\"\n      [disabled]=\"controlDisabled || options?.readonly\"\n      [id]=\"'control' + layoutNode?._id\"\n      labelPosition=\"after\"\n      [name]=\"controlName\"\n      [checked]=\"isChecked\"\n      (blur)=\"options.showErrors = true\"\n      (change)=\"updateValue($event)\">\n      <span *ngIf=\"options?.title\"\n        class=\"checkbox-name\"\n        [style.display]=\"options?.notitle ? 'none' : ''\"\n        [innerHTML]=\"options?.title\"></span>\n    </mat-slide-toggle>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    .checkbox-name { white-space: nowrap; }\n    mat-error { font-size: 75%; }\n  "]
                },] }
    ];
    MaterialCheckboxComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialCheckboxComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    // TODO: Change this to use a Selection List instead?
    // https://material.angular.io/components/list/overview
    var MaterialCheckboxesComponent = /** @class */ (function () {
        function MaterialCheckboxesComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.horizontalList = false;
            this.checkboxList = [];
        }
        MaterialCheckboxesComponent.prototype.ngOnInit = function () {
            var e_1, _a;
            this.options = this.layoutNode.options || {};
            this.horizontalList = this.layoutNode.type === 'checkboxes-inline' ||
                this.layoutNode.type === 'checkboxbuttons';
            this.jsf.initializeControl(this);
            this.checkboxList = core$1.buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
            if (this.boundControl) {
                var formArray = this.jsf.getFormControl(this);
                try {
                    for (var _b = __values(this.checkboxList), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var checkboxItem = _c.value;
                        checkboxItem.checked = formArray.value.includes(checkboxItem.value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        };
        Object.defineProperty(MaterialCheckboxesComponent.prototype, "allChecked", {
            get: function () {
                return this.checkboxList.filter(function (t) { return t.checked; }).length === this.checkboxList.length;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MaterialCheckboxesComponent.prototype, "someChecked", {
            get: function () {
                var checkedItems = this.checkboxList.filter(function (t) { return t.checked; }).length;
                return checkedItems > 0 && checkedItems < this.checkboxList.length;
            },
            enumerable: false,
            configurable: true
        });
        MaterialCheckboxesComponent.prototype.updateValue = function () {
            this.options.showErrors = true;
            if (this.boundControl) {
                this.jsf.updateArrayCheckboxList(this, this.checkboxList);
            }
        };
        MaterialCheckboxesComponent.prototype.updateAllValues = function (event) {
            this.options.showErrors = true;
            this.checkboxList.forEach(function (t) { return t.checked = event.checked; });
            this.updateValue();
        };
        return MaterialCheckboxesComponent;
    }());
    MaterialCheckboxesComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-checkboxes-widget',
                    template: "\n    <div>\n      <mat-checkbox type=\"checkbox\"\n        [checked]=\"allChecked\"\n        [color]=\"options?.color || 'primary'\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [indeterminate]=\"someChecked\"\n        [name]=\"options?.name\"\n        (blur)=\"options.showErrors = true\"\n        (change)=\"updateAllValues($event)\">\n        <span class=\"checkbox-name\" [innerHTML]=\"options?.name\"></span>\n      </mat-checkbox>\n      <label *ngIf=\"options?.title\"\n        class=\"title\"\n        [class]=\"options?.labelHtmlClass || ''\"\n        [style.display]=\"options?.notitle ? 'none' : ''\"\n        [innerHTML]=\"options?.title\"></label>\n      <ul class=\"checkbox-list\" [class.horizontal-list]=\"horizontalList\">\n        <li *ngFor=\"let checkboxItem of checkboxList\"\n          [class]=\"options?.htmlClass || ''\">\n          <mat-checkbox type=\"checkbox\"\n            [(ngModel)]=\"checkboxItem.checked\"\n            [color]=\"options?.color || 'primary'\"\n            [disabled]=\"controlDisabled || options?.readonly\"\n            [name]=\"checkboxItem?.name\"\n            (blur)=\"options.showErrors = true\"\n            (change)=\"updateValue()\">\n            <span class=\"checkbox-name\" [innerHTML]=\"checkboxItem?.name\"></span>\n          </mat-checkbox>\n        </li>\n      </ul>\n      <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n        [innerHTML]=\"options?.errorMessage\"></mat-error>\n    </div>",
                    styles: ["\n    .title { font-weight: bold; }\n    .checkbox-list { list-style-type: none; }\n    .horizontal-list > li { display: inline-block; margin-right: 10px; zoom: 1; }\n    .checkbox-name { white-space: nowrap; }\n    mat-error { font-size: 75%; }\n  "]
                },] }
    ];
    MaterialCheckboxesComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialCheckboxesComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    // TODO: Add this control
    var MaterialChipListComponent = /** @class */ (function () {
        function MaterialChipListComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
        }
        MaterialChipListComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
        };
        MaterialChipListComponent.prototype.updateValue = function (event) {
            this.jsf.updateValue(this, event.target.value);
        };
        return MaterialChipListComponent;
    }());
    MaterialChipListComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-chip-list-widget',
                    template: ""
                },] }
    ];
    MaterialChipListComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialChipListComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialDatepickerComponent = /** @class */ (function () {
        function MaterialDatepickerComponent(matFormFieldDefaultOptions, jsf) {
            this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.autoCompleteList = [];
        }
        MaterialDatepickerComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this, !this.options.readonly);
            if (this.controlValue) {
                this.formControl.setValue(moment__namespace(this.controlValue).toISOString());
                this.dateValueStr = moment.utc(this.controlValue);
            }
            if (!this.options.notitle && !this.options.description && this.options.placeholder) {
                this.options.description = this.options.placeholder;
            }
        };
        MaterialDatepickerComponent.prototype.updateValue = function (event) {
            this.formControl.setValue(event.value.toISOString());
            this.options.showErrors = true;
            this.dateValueStr = moment.utc(this.controlValue);
        };
        return MaterialDatepickerComponent;
    }());
    MaterialDatepickerComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-datepicker-widget',
                    template: "\n    <mat-form-field [appearance]=\"options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'\"\n                    [class]=\"options?.htmlClass || ''\"\n                    [floatLabel]=\"options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')\"\n                    [hideRequiredMarker]=\"options?.hideRequired ? 'true' : 'false'\"\n                    [style.width]=\"'100%'\">\n      <mat-label *ngIf=\"!options?.notitle\">{{options?.title}}</mat-label>\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n        <input matInput *ngIf=\"boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [id]=\"'control' + layoutNode?._id\"\n        [max]=\"options?.maximum\"\n        [matDatepicker]=\"picker\"\n        [min]=\"options?.minimum\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.title\"\n        [readonly]=\"true\"\n        [required]=\"options?.required\"\n        [value]=\"dateValueStr\"\n        [style.width]=\"'100%'\"\n        (blur)=\"options.showErrors = true\"\n        [tabindex]=\"options?.tabindex ? options?.tabindex : 0\"\n        (dateChange)=\"updateValue($event)\"\n        (dateInput)=\"updateValue($event)\"\n        [style.cursor]=\"'default'\">\n      <input matInput *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [id]=\"'control' + layoutNode?._id\"\n        [max]=\"options?.maximum\"\n        [matDatepicker]=\"picker\"\n        [min]=\"options?.minimum\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.title\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [readonly]=\"options?.readonly\"\n        [tabindex]=\"options?.tabindex ? options?.tabindex : 0\"\n        (blur)=\"options.showErrors = true\"\n        (dateChange)=\"updateValue($event)\"\n        (dateInput)=\"updateValue($event)\">\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n      <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\n    </mat-form-field>\n    <mat-datepicker #picker ></mat-datepicker>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "]
                },] }
    ];
    MaterialDatepickerComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [formField.MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: core.Optional }] },
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialDatepickerComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialDesignFrameworkComponent = /** @class */ (function () {
        function MaterialDesignFrameworkComponent(changeDetector, jsf) {
            this.changeDetector = changeDetector;
            this.jsf = jsf;
            this.frameworkInitialized = false;
            this.formControl = null;
            this.parentArray = null;
            this.isOrderable = false;
            this.dynamicTitle = null;
        }
        Object.defineProperty(MaterialDesignFrameworkComponent.prototype, "showRemoveButton", {
            get: function () {
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
            },
            enumerable: false,
            configurable: true
        });
        MaterialDesignFrameworkComponent.prototype.ngOnInit = function () {
            this.initializeFramework();
        };
        MaterialDesignFrameworkComponent.prototype.ngOnChanges = function () {
            if (!this.frameworkInitialized) {
                this.initializeFramework();
            }
            if (this.dynamicTitle) {
                this.updateTitle();
            }
        };
        MaterialDesignFrameworkComponent.prototype.initializeFramework = function () {
            if (this.layoutNode) {
                this.options = cloneDeep__default['default'](this.layoutNode.options || {});
                this.widgetLayoutNode = Object.assign(Object.assign({}, this.layoutNode), { options: cloneDeep__default['default'](this.layoutNode.options || {}) });
                this.widgetOptions = this.widgetLayoutNode.options;
                this.formControl = this.jsf.getFormControl(this);
                if (core$1.isDefined(this.widgetOptions.minimum) &&
                    core$1.isDefined(this.widgetOptions.maximum) &&
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
        };
        MaterialDesignFrameworkComponent.prototype.updateTitle = function () {
            this.widgetLayoutNode.options.title = this.jsf.parseText(this.dynamicTitle, this.jsf.getFormControlValue(this), this.jsf.getFormControlGroup(this).value, this.dataIndex[this.dataIndex.length - 1]);
        };
        MaterialDesignFrameworkComponent.prototype.removeItem = function () {
            this.jsf.removeItem(this);
        };
        return MaterialDesignFrameworkComponent;
    }());
    MaterialDesignFrameworkComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-design-framework',
                    template: "<div\n  [class.array-item]=\"widgetLayoutNode?.arrayItem && widgetLayoutNode?.type !== '$ref'\"\n  [orderable]=\"isOrderable\"\n  [dataIndex]=\"dataIndex\"\n  [layoutIndex]=\"layoutIndex\"\n  [layoutNode]=\"widgetLayoutNode\">\n  <svg *ngIf=\"showRemoveButton\"\n       xmlns=\"http://www.w3.org/2000/svg\"\n       height=\"18\" width=\"18\" viewBox=\"0 0 24 24\"\n       class=\"close-button\"\n       (click)=\"removeItem()\">\n    <path\n      d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z\"/>\n  </svg>\n  <select-widget-widget\n    [dataIndex]=\"dataIndex\"\n    [layoutIndex]=\"layoutIndex\"\n    [parent]=\"parent\"\n    [layoutNode]=\"widgetLayoutNode\"></select-widget-widget>\n</div>\n<div class=\"spacer\" *ngIf=\"widgetLayoutNode?.arrayItem && widgetLayoutNode?.type !== '$ref'\"></div>\n",
                    styles: [".array-item{border-radius:2px;box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);padding:6px;position:relative;transition:all .28s cubic-bezier(.4,0,.2,1)}.close-button{cursor:pointer;position:absolute;top:6px;right:6px;fill:rgba(0,0,0,.4);visibility:hidden;z-index:500}.close-button:hover{fill:rgba(0,0,0,.8)}.array-item:hover>.close-button{visibility:visible}.spacer{margin:6px 0}[draggable=true]:hover{box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);cursor:move;z-index:10}[draggable=true].drag-target-top{box-shadow:0 -2px 0 #000;position:relative;z-index:20}[draggable=true].drag-target-bottom{box-shadow:0 2px 0 #000;position:relative;z-index:20}"]
                },] }
    ];
    MaterialDesignFrameworkComponent.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialDesignFrameworkComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }],
        parent: [{ type: core.Input }]
    };

    var toBase64 = function (file) { return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () { return resolve(reader.result); };
        reader.onerror = function (error) { return reject(error); };
    }); };
    var ɵ0 = toBase64;
    var MaterialFileComponent = /** @class */ (function () {
        function MaterialFileComponent(jsf, matFormFieldDefaultOptions) {
            this.jsf = jsf;
            this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
            this.controlDisabled = false;
            this.boundControl = false;
        }
        MaterialFileComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
        };
        MaterialFileComponent.prototype.updateValue = function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var base64String;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(event.target && event.target.files && event.target.files.length)) return [3 /*break*/, 2];
                            return [4 /*yield*/, toBase64(event.target.files[0])];
                        case 1:
                            base64String = _a.sent();
                            this.formControl.setValue(base64String);
                            return [3 /*break*/, 3];
                        case 2:
                            this.formControl.setValue(null);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return MaterialFileComponent;
    }());
    MaterialFileComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-file-widget',
                    template: "<mat-form-field [appearance]=\"options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'\"\n                    [class]=\"options?.htmlClass || ''\"\n                    [floatLabel]=\"options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')\"\n                    [hideRequiredMarker]=\"options?.hideRequired ? 'true' : 'false'\"\n                    [style.width]=\"'100%'\">\n      <mat-label *ngIf=\"!options?.notitle\">{{options?.title}}</mat-label>\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n      <ngx-mat-file-input [tabindex]=\"options?.tabindex ? options?.tabindex : 0\" #fileInput (change)=\"updateValue($event);options.showErrors = true\" [required]=\"options?.required\" (blur)=\"options.showErrors = true\"\n        >\n      </ngx-mat-file-input>\n      <button mat-icon-button matSuffix *ngIf=\"!fileInput.empty\" (click)=\"fileInput.clear($event);updateValue($event)\" style='cursor:pointer;'>\n        <mat-icon>clear</mat-icon>\n      </button>\n      <mat-icon matSuffix *ngIf=\"fileInput.empty\" style='cursor:pointer'>folder</mat-icon>\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n    </mat-form-field>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "]
                },] }
    ];
    MaterialFileComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService },
        { type: undefined, decorators: [{ type: core.Inject, args: [formField.MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: core.Optional }] }
    ]; };
    MaterialFileComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }],
        fileInput: [{ type: core.ViewChild, args: ['fileInput',] }]
    };

    var MaterialInputComponent = /** @class */ (function () {
        function MaterialInputComponent(matFormFieldDefaultOptions, jsf, cdf) {
            this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
            this.jsf = jsf;
            this.cdf = cdf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.autoCompleteList = [];
        }
        MaterialInputComponent.prototype.ngOnInit = function () {
            if (this.parent) {
                this.parent.selectFrameworkWidgets.push(this);
            }
            else {
                console.warn('Missing parent for', this);
            }
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
            if (!this.options.notitle && !this.options.description && this.options.placeholder) {
                this.options.description = this.options.placeholder;
            }
        };
        MaterialInputComponent.prototype.updateValue = function (event) {
            this.jsf.updateValue(this, event.target.value);
        };
        MaterialInputComponent.prototype.processKeydown = function (event) {
            this.jsf.updateKeydown({
                controlName: this.controlName,
                event: event
            });
        };
        return MaterialInputComponent;
    }());
    MaterialInputComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-input-widget',
                    template: "\n    <mat-form-field [appearance]=\"options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'\"\n      [class]=\"options?.htmlClass || ''\"\n      [floatLabel]=\"options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')\"\n      [hideRequiredMarker]=\"options?.hideRequired ? 'true' : 'false'\"\n      [style.width]=\"'100%'\">\n      <mat-label *ngIf=\"!options?.notitle\">{{options?.title}}</mat-label>\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n      <input matInput *ngIf=\"boundControl\"\n        [formControl]=\"formControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.maxlength]=\"options?.maxLength\"\n        [attr.minlength]=\"options?.minLength\"\n        [attr.pattern]=\"options?.pattern\"\n        [readonly]=\"options?.readonly ? 'readonly' : null\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [type]=\"layoutNode?.type\"\n        [tabindex]=\"options?.tabindex ? options?.tabindex : 0\"\n        (blur)=\"options.showErrors = true\"\n        (keydown)=\"processKeydown($event)\">\n      <input matInput *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.maxlength]=\"options?.maxLength\"\n        [attr.minlength]=\"options?.minLength\"\n        [attr.pattern]=\"options?.pattern\"\n        [disabled]=\"controlDisabled\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [readonly]=\"options?.readonly ? 'readonly' : null\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [type]=\"layoutNode?.type\"\n        [value]=\"controlValue\"\n        [tabindex]=\"options?.tabindex ? options?.tabindex : 0\"\n        (input)=\"updateValue($event)\"\n        (blur)=\"options.showErrors = true\" (keydown)=\"processKeydown($event)\">\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n      <mat-autocomplete *ngIf=\"options?.typeahead?.source\">\n        <mat-option *ngFor=\"let word of options?.typeahead?.source\"\n          [value]=\"word\">{{word}}</mat-option>\n      </mat-autocomplete>\n    </mat-form-field>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "]
                },] }
    ];
    MaterialInputComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [formField.MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: core.Optional }] },
        { type: core$1.JsonSchemaFormService },
        { type: core.ChangeDetectorRef }
    ]; };
    MaterialInputComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }],
        parent: [{ type: core.Input }]
    };

    var MaterialNumberComponent = /** @class */ (function () {
        function MaterialNumberComponent(matFormFieldDefaultOptions, jsf, cdf) {
            this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
            this.jsf = jsf;
            this.cdf = cdf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.allowNegative = true;
            this.allowDecimal = true;
            this.allowExponents = false;
            this.lastValidNumber = '';
        }
        MaterialNumberComponent.prototype.ngOnInit = function () {
            if (this.parent) {
                this.parent.selectFrameworkWidgets.push(this);
            }
            else {
                console.warn('Missing parent for', this);
            }
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
            if (this.layoutNode.dataType === 'integer') {
                this.allowDecimal = false;
            }
            if (!this.options.notitle && !this.options.description && this.options.placeholder) {
                this.options.description = this.options.placeholder;
            }
        };
        MaterialNumberComponent.prototype.updateValue = function (event) {
            this.jsf.updateValue(this, event.target.value);
        };
        return MaterialNumberComponent;
    }());
    MaterialNumberComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-number-widget',
                    template: "\n    <mat-form-field [appearance]=\"options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'\"\n    [class]=\"options?.htmlClass || ''\"\n    [floatLabel]=\"options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')\"\n    [hideRequiredMarker]=\"options?.hideRequired ? 'true' : 'false'\"\n    [style.width]=\"'100%'\">\n    <mat-label *ngIf=\"!options?.notitle\">{{options?.title}}</mat-label>\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n      <input matInput *ngIf=\"boundControl\"\n        [formControl]=\"formControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.max]=\"options?.maximum\"\n        [attr.min]=\"options?.minimum\"\n        [attr.step]=\"options?.multipleOf || options?.step || 'any'\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [readonly]=\"options?.readonly ? 'readonly' : null\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [type]=\"'number'\"\n        (blur)=\"options.showErrors = true\">\n      <input matInput *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.max]=\"options?.maximum\"\n        [attr.min]=\"options?.minimum\"\n        [attr.step]=\"options?.multipleOf || options?.step || 'any'\"\n        [disabled]=\"controlDisabled\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [readonly]=\"options?.readonly ? 'readonly' : null\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [type]=\"'number'\"\n        [value]=\"controlValue\"\n        (input)=\"updateValue($event)\"\n        (blur)=\"options.showErrors = true\">\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"layoutNode?.type === 'range'\" align=\"start\"\n        [innerHTML]=\"controlValue\"></mat-hint>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n    </mat-form-field>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "]
                },] }
    ];
    MaterialNumberComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [formField.MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: core.Optional }] },
        { type: core$1.JsonSchemaFormService },
        { type: core.ChangeDetectorRef }
    ]; };
    MaterialNumberComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }],
        parent: [{ type: core.Input }]
    };

    // TODO: Add this control
    var MaterialOneOfComponent = /** @class */ (function () {
        function MaterialOneOfComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
        }
        MaterialOneOfComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
        };
        MaterialOneOfComponent.prototype.updateValue = function (event) {
            this.jsf.updateValue(this, event.target.value);
        };
        return MaterialOneOfComponent;
    }());
    MaterialOneOfComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-one-of-widget',
                    template: ""
                },] }
    ];
    MaterialOneOfComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialOneOfComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialRadiosComponent = /** @class */ (function () {
        function MaterialRadiosComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.flexDirection = 'column';
            this.radiosList = [];
        }
        MaterialRadiosComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            if (this.layoutNode.type === 'radios-inline') {
                this.flexDirection = 'row';
            }
            this.radiosList = core$1.buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
            this.jsf.initializeControl(this, !this.options.readonly);
        };
        MaterialRadiosComponent.prototype.updateValue = function (value) {
            this.options.showErrors = true;
            this.jsf.updateValue(this, value);
        };
        return MaterialRadiosComponent;
    }());
    MaterialRadiosComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-radios-widget',
                    template: "\n    <div>\n      <div *ngIf=\"options?.title\">\n        <label\n          [attr.for]=\"'control' + layoutNode?._id\"\n          [class]=\"options?.labelHtmlClass || ''\"\n          [style.display]=\"options?.notitle ? 'none' : ''\"\n          [innerHTML]=\"options?.title\"></label>\n      </div>\n      <mat-radio-group *ngIf=\"boundControl\"\n        [formControl]=\"formControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [attr.required]=\"options?.required\"\n        [style.flex-direction]=\"flexDirection\"\n        [name]=\"controlName\"\n        (blur)=\"options.showErrors = true\">\n        <mat-radio-button *ngFor=\"let radioItem of radiosList\"\n          [id]=\"'control' + layoutNode?._id + '/' + radioItem?.name\"\n          [value]=\"radioItem?.value\">\n          <span [innerHTML]=\"radioItem?.name\"></span>\n        </mat-radio-button>\n      </mat-radio-group>\n      <mat-radio-group *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [attr.required]=\"options?.required\"\n        [style.flex-direction]=\"flexDirection\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [name]=\"controlName\"\n        [value]=\"controlValue\">\n        <mat-radio-button *ngFor=\"let radioItem of radiosList\"\n          [id]=\"'control' + layoutNode?._id + '/' + radioItem?.name\"\n          [value]=\"radioItem?.value\"\n          (click)=\"updateValue(radioItem?.value)\">\n          <span [innerHTML]=\"radioItem?.name\"></span>\n        </mat-radio-button>\n      </mat-radio-group>\n      <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n        [innerHTML]=\"options?.errorMessage\"></mat-error>\n    </div>",
                    styles: ["\n    mat-radio-group { display: inline-flex; }\n    mat-radio-button { margin: 2px; }\n    mat-error { font-size: 75%; }\n  "]
                },] }
    ];
    MaterialRadiosComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialRadiosComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialSelectComponent = /** @class */ (function () {
        function MaterialSelectComponent(matFormFieldDefaultOptions, jsf, cdf) {
            this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
            this.jsf = jsf;
            this.cdf = cdf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.selectList = [];
            this.isArray = core$1.isArray;
        }
        MaterialSelectComponent.prototype.ngOnInit = function () {
            if (this.parent) {
                this.parent.selectFrameworkWidgets.push(this);
            }
            else {
                console.warn('Missing parent for', this);
            }
            this.options = this.layoutNode.options || {};
            this.selectList = core$1.buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, !!this.options.required, !!this.options.flatList);
            this.jsf.initializeControl(this, !this.options.readonly);
            if (!this.options.notitle && !this.options.description && this.options.placeholder) {
                this.options.description = this.options.placeholder;
            }
        };
        MaterialSelectComponent.prototype.updateValue = function (event) {
            this.options.showErrors = true;
            this.jsf.updateValue(this, event.value);
        };
        return MaterialSelectComponent;
    }());
    MaterialSelectComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-select-widget',
                    template: "\n    <mat-form-field\n      [appearance]=\"options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'\"\n      [class]=\"options?.htmlClass || ''\"\n      [floatLabel]=\"options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')\"\n      [hideRequiredMarker]=\"options?.hideRequired ? 'true' : 'false'\"\n      [style.width]=\"'100%'\">\n      <mat-label *ngIf=\"!options?.notitle\">{{options?.title}}</mat-label>\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n      <mat-select *ngIf=\"boundControl\"\n        [formControl]=\"formControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.name]=\"controlName\"\n        [id]=\"'control' + layoutNode?._id\"\n        [multiple]=\"options?.multiple\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [tabIndex]=\"options?.tabindex ? options?.tabindex : 0\"\n        (blur)=\"options.showErrors = true\">\n        <ng-template ngFor let-selectItem [ngForOf]=\"selectList\">\n          <mat-option *ngIf=\"!isArray(selectItem?.items)\"\n            [value]=\"selectItem?.value\">\n            <span [innerHTML]=\"selectItem?.name\"></span>\n          </mat-option>\n          <mat-optgroup *ngIf=\"isArray(selectItem?.items)\"\n            [label]=\"selectItem?.group\">\n            <mat-option *ngFor=\"let subItem of selectItem.items\"\n              [value]=\"subItem?.value\">\n              <span [innerHTML]=\"subItem?.name\"></span>\n            </mat-option>\n          </mat-optgroup>\n        </ng-template>\n      </mat-select>\n      <mat-select *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.name]=\"controlName\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [id]=\"'control' + layoutNode?._id\"\n        [multiple]=\"options?.multiple\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [value]=\"controlValue\"\n        [tabIndex]=\"options?.tabindex ? options?.tabindex : 0\"\n        (blur)=\"options.showErrors = true\"\n        (change)=\"updateValue($event)\">\n        <ng-template ngFor let-selectItem [ngForOf]=\"selectList\">\n          <mat-option *ngIf=\"!isArray(selectItem?.items)\"\n            [attr.selected]=\"selectItem?.value === controlValue\"\n            [value]=\"selectItem?.value\">\n            <span [innerHTML]=\"selectItem?.name\"></span>\n          </mat-option>\n          <mat-optgroup *ngIf=\"isArray(selectItem?.items)\"\n            [label]=\"selectItem?.group\">\n            <mat-option *ngFor=\"let subItem of selectItem.items\"\n              [attr.selected]=\"subItem?.value === controlValue\"\n              [value]=\"subItem?.value\">\n              <span [innerHTML]=\"subItem?.name\"></span>\n            </mat-option>\n          </mat-optgroup>\n        </ng-template>\n      </mat-select>\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n    </mat-form-field>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "]
                },] }
    ];
    MaterialSelectComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [formField.MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: core.Optional }] },
        { type: core$1.JsonSchemaFormService },
        { type: core.ChangeDetectorRef }
    ]; };
    MaterialSelectComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }],
        parent: [{ type: core.Input }]
    };

    var MaterialSliderComponent = /** @class */ (function () {
        function MaterialSliderComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
            this.allowNegative = true;
            this.allowDecimal = true;
            this.allowExponents = false;
            this.lastValidNumber = '';
        }
        MaterialSliderComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this, !this.options.readonly);
        };
        MaterialSliderComponent.prototype.updateValue = function (event) {
            this.options.showErrors = true;
            this.jsf.updateValue(this, event.value);
        };
        return MaterialSliderComponent;
    }());
    MaterialSliderComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-slider-widget',
                    template: "\n    <mat-slider thumbLabel *ngIf=\"boundControl\"\n      [formControl]=\"formControl\"\n      [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n      [id]=\"'control' + layoutNode?._id\"\n      [max]=\"options?.maximum\"\n      [min]=\"options?.minimum\"\n      [step]=\"options?.multipleOf || options?.step || 'any'\"\n      [style.width]=\"'100%'\"\n      (blur)=\"options.showErrors = true\"></mat-slider>\n    <mat-slider thumbLabel *ngIf=\"!boundControl\"\n      [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n      [disabled]=\"controlDisabled || options?.readonly\"\n      [id]=\"'control' + layoutNode?._id\"\n      [max]=\"options?.maximum\"\n      [min]=\"options?.minimum\"\n      [step]=\"options?.multipleOf || options?.step || 'any'\"\n      [style.width]=\"'100%'\"\n      [value]=\"controlValue\"\n      (blur)=\"options.showErrors = true\"\n      (change)=\"updateValue($event)\"></mat-slider>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: [" mat-error { font-size: 75%; } "]
                },] }
    ];
    MaterialSliderComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialSliderComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    // TODO: Add this control
    var MaterialStepperComponent = /** @class */ (function () {
        function MaterialStepperComponent(jsf) {
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
        }
        MaterialStepperComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
        };
        MaterialStepperComponent.prototype.updateValue = function (event) {
            this.jsf.updateValue(this, event.target.value);
        };
        return MaterialStepperComponent;
    }());
    MaterialStepperComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-stepper-widget',
                    template: ""
                },] }
    ];
    MaterialStepperComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialStepperComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialTabsComponent = /** @class */ (function () {
        function MaterialTabsComponent(jsf) {
            this.jsf = jsf;
            this.selectedItem = 0;
            this.showAddTab = true;
        }
        MaterialTabsComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.itemCount = this.layoutNode.items.length - 1;
            this.updateControl();
        };
        MaterialTabsComponent.prototype.select = function (index) {
            if (this.layoutNode.items[index].type === '$ref') {
                this.jsf.addItem({
                    layoutNode: this.layoutNode.items[index],
                    layoutIndex: this.layoutIndex.concat(index),
                    dataIndex: this.dataIndex.concat(index)
                });
                this.updateControl();
            }
            this.selectedItem = index;
        };
        MaterialTabsComponent.prototype.updateControl = function () {
            this.itemCount = this.layoutNode.items.length - 1;
            var lastItem = this.layoutNode.items[this.layoutNode.items.length - 1];
            this.showAddTab = lastItem.type === '$ref' &&
                this.itemCount < (lastItem.options.maxItems || 1000);
        };
        MaterialTabsComponent.prototype.setTabTitle = function (item, index) {
            return this.jsf.setArrayItemTitle(this, item, index);
        };
        return MaterialTabsComponent;
    }());
    MaterialTabsComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-tabs-widget',
                    template: "\n    <nav mat-tab-nav-bar\n      [attr.aria-label]=\"options?.label || options?.title || ''\"\n      [style.width]=\"'100%'\">\n        <a mat-tab-link *ngFor=\"let item of layoutNode?.items; let i = index\"\n          [active]=\"selectedItem === i\"\n          (click)=\"select(i)\">\n          <span *ngIf=\"showAddTab || item.type !== '$ref'\"\n            [innerHTML]=\"setTabTitle(item, i)\"></span>\n        </a>\n    </nav>\n    <div *ngFor=\"let layoutItem of layoutNode?.items; let i = index\"\n      [class]=\"options?.htmlClass || ''\">\n      <select-framework-widget *ngIf=\"selectedItem === i\"\n        [class]=\"(options?.fieldHtmlClass || '') + ' ' + (options?.activeClass || '') + ' ' + (options?.style?.selected || '')\"\n        [dataIndex]=\"layoutNode?.dataType === 'array' ? (dataIndex || []).concat(i) : dataIndex\"\n        [layoutIndex]=\"(layoutIndex || []).concat(i)\"\n        [layoutNode]=\"layoutItem\"></select-framework-widget>\n    </div>",
                    styles: [" a { cursor: pointer; } "]
                },] }
    ];
    MaterialTabsComponent.ctorParameters = function () { return [
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialTabsComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MaterialTextareaComponent = /** @class */ (function () {
        function MaterialTextareaComponent(matFormFieldDefaultOptions, jsf) {
            this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
            this.jsf = jsf;
            this.controlDisabled = false;
            this.boundControl = false;
        }
        MaterialTextareaComponent.prototype.ngOnInit = function () {
            this.options = this.layoutNode.options || {};
            this.jsf.initializeControl(this);
            if (!this.options.notitle && !this.options.description && this.options.placeholder) {
                this.options.description = this.options.placeholder;
            }
        };
        MaterialTextareaComponent.prototype.updateValue = function (event) {
            this.jsf.updateValue(this, event.target.value);
        };
        return MaterialTextareaComponent;
    }());
    MaterialTextareaComponent.decorators = [
        { type: core.Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-textarea-widget',
                    template: "\n    <mat-form-field [appearance]=\"options?.appearance || matFormFieldDefaultOptions?.appearance || 'standard'\"\n      [class]=\"options?.htmlClass || ''\"\n      [floatLabel]=\"options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')\"\n      [hideRequiredMarker]=\"options?.hideRequired ? 'true' : 'false'\"\n      [style.width]=\"'100%'\">\n      <mat-label *ngIf=\"!options?.notitle\">{{options?.title}}</mat-label>\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n      <textarea matInput *ngIf=\"boundControl\"\n        [formControl]=\"formControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.maxlength]=\"options?.maxLength\"\n        [attr.minlength]=\"options?.minLength\"\n        [attr.pattern]=\"options?.pattern\"\n        [required]=\"options?.required\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [readonly]=\"options?.readonly ? 'readonly' : null\"\n        [style.width]=\"'100%'\"\n        (blur)=\"options.showErrors = true\"></textarea>\n      <textarea matInput *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.maxlength]=\"options?.maxLength\"\n        [attr.minlength]=\"options?.minLength\"\n        [attr.pattern]=\"options?.pattern\"\n        [required]=\"options?.required\"\n        [disabled]=\"controlDisabled\"\n        [id]=\"'control' + layoutNode?._id\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.notitle ? options?.placeholder : options?.title\"\n        [readonly]=\"options?.readonly ? 'readonly' : null\"\n        [style.width]=\"'100%'\"\n        [value]=\"controlValue\"\n        (input)=\"updateValue($event)\"\n        (blur)=\"options.showErrors = true\"></textarea>\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n    </mat-form-field>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
                    styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep json-schema-form mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "]
                },] }
    ];
    MaterialTextareaComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [formField.MAT_FORM_FIELD_DEFAULT_OPTIONS,] }, { type: core.Optional }] },
        { type: core$1.JsonSchemaFormService }
    ]; };
    MaterialTextareaComponent.propDecorators = {
        layoutNode: [{ type: core.Input }],
        layoutIndex: [{ type: core.Input }],
        dataIndex: [{ type: core.Input }]
    };

    var MATERIAL_FRAMEWORK_COMPONENTS = [
        FlexLayoutRootComponent, FlexLayoutSectionComponent,
        MaterialAddReferenceComponent, MaterialOneOfComponent,
        MaterialButtonComponent, MaterialButtonGroupComponent,
        MaterialCheckboxComponent, MaterialCheckboxesComponent,
        MaterialChipListComponent, MaterialDatepickerComponent,
        MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent,
        MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent,
        MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent,
        MaterialDesignFrameworkComponent
    ];

    // Material Design Framework
    // https://github.com/angular/material2
    var MaterialDesignFramework = /** @class */ (function (_super) {
        __extends(MaterialDesignFramework, _super);
        function MaterialDesignFramework() {
            var _this = _super.apply(this, __spread(arguments)) || this;
            _this.name = 'material-design';
            _this.framework = MaterialDesignFrameworkComponent;
            _this.stylesheets = [
                '//fonts.googleapis.com/icon?family=Material+Icons',
                '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
            ];
            _this.widgets = {
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
            return _this;
        }
        return MaterialDesignFramework;
    }(core$1.Framework));
    MaterialDesignFramework.decorators = [
        { type: core.Injectable }
    ];

    function fixAngularFlex() {
        // monkey patch based on errors in console  - https://github.com/angular/flex-layout/issues/1011
        var MediaMarshallerUpdateElement = core$2.MediaMarshaller.prototype.updateElement;
        core$2.MediaMarshaller.prototype.updateElement = function (element, key, value) {
            if (key === 'layout-gap' && (value === null || value === undefined)) {
                value = '0px';
            }
            MediaMarshallerUpdateElement.apply(this, [element, key, value]);
        };
    }

    var MomentUtcDateAdapter = /** @class */ (function (_super) {
        __extends(MomentUtcDateAdapter, _super);
        function MomentUtcDateAdapter(dateLocale) {
            return _super.call(this, dateLocale) || this;
        }
        MomentUtcDateAdapter.prototype.createDate = function (year, month, date) {
            // Moment.js will create an invalid date if any of the components are out of bounds, but we
            // explicitly check each case so we can throw more descriptive errors.
            if (month < 0 || month > 11) {
                throw Error("Invalid month index \"" + month + "\". Month index has to be between 0 and 11.");
            }
            if (date < 1) {
                throw Error("Invalid date \"" + date + "\". Date has to be greater than 0.");
            }
            var result = moment.utc({ year: year, month: month, date: date }).locale(this.locale);
            // If the result isn't valid, the date must have been out of bounds for this month.
            if (!result.isValid()) {
                throw Error("Invalid date \"" + date + "\" for month with index \"" + month + "\".");
            }
            return result;
        };
        return MomentUtcDateAdapter;
    }(materialMomentAdapter.MomentDateAdapter));
    MomentUtcDateAdapter.decorators = [
        { type: core.Injectable }
    ];
    MomentUtcDateAdapter.ctorParameters = function () { return [
        { type: String, decorators: [{ type: core.Optional }, { type: core.Inject, args: [core$3.MAT_DATE_LOCALE,] }] }
    ]; };

    /**
     * unused @angular/material modules:
     * MatDialogModule, MatGridListModule, MatListModule, MatMenuModule,
     * MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
     * MatSidenavModule, MatSnackBarModule, MatSortModule, MatTableModule,
     * ,
     */
    var ANGULAR_MATERIAL_MODULES = [
        autocomplete.MatAutocompleteModule, button.MatButtonModule, buttonToggle.MatButtonToggleModule, card.MatCardModule,
        checkbox.MatCheckboxModule, chips.MatChipsModule, datepicker.MatDatepickerModule, expansion.MatExpansionModule,
        formField.MatFormFieldModule, icon.MatIconModule, input.MatInputModule, core$3.MatNativeDateModule,
        radio.MatRadioModule, select.MatSelectModule, slider.MatSliderModule, slideToggle.MatSlideToggleModule,
        stepper.MatStepperModule, tabs.MatTabsModule, tooltip.MatTooltipModule,
        toolbar.MatToolbarModule, menu.MatMenuModule, toolbar.MatToolbarModule,
    ];
    var MaterialDesignFrameworkModule = /** @class */ (function () {
        function MaterialDesignFrameworkModule() {
            fixAngularFlex();
        }
        return MaterialDesignFrameworkModule;
    }());
    MaterialDesignFrameworkModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: __spread([
                        common.CommonModule,
                        forms.FormsModule,
                        forms.ReactiveFormsModule,
                        flexLayout.FlexLayoutModule
                    ], ANGULAR_MATERIAL_MODULES, [
                        core$1.WidgetLibraryModule,
                        core$1.JsonSchemaFormModule,
                        materialMomentAdapter.MatMomentDateModule,
                        ngxMaterialFileInput.MaterialFileInputModule,
                    ]),
                    declarations: __spread(MATERIAL_FRAMEWORK_COMPONENTS),
                    exports: __spread([
                        core$1.JsonSchemaFormModule
                    ], MATERIAL_FRAMEWORK_COMPONENTS),
                    providers: [
                        core$1.JsonSchemaFormService,
                        core$1.FrameworkLibraryService,
                        core$1.WidgetLibraryService,
                        { provide: core$1.Framework, useClass: MaterialDesignFramework, multi: true },
                        { provide: core$3.DateAdapter, useClass: MomentUtcDateAdapter }
                    ],
                    entryComponents: __spread(MATERIAL_FRAMEWORK_COMPONENTS)
                },] }
    ];
    MaterialDesignFrameworkModule.ctorParameters = function () { return []; };

    /*
     * Public API Surface of @ajsf/material-framework
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ANGULAR_MATERIAL_MODULES = ANGULAR_MATERIAL_MODULES;
    exports.FlexLayoutRootComponent = FlexLayoutRootComponent;
    exports.FlexLayoutSectionComponent = FlexLayoutSectionComponent;
    exports.MATERIAL_FRAMEWORK_COMPONENTS = MATERIAL_FRAMEWORK_COMPONENTS;
    exports.MaterialAddReferenceComponent = MaterialAddReferenceComponent;
    exports.MaterialButtonComponent = MaterialButtonComponent;
    exports.MaterialButtonGroupComponent = MaterialButtonGroupComponent;
    exports.MaterialCheckboxComponent = MaterialCheckboxComponent;
    exports.MaterialCheckboxesComponent = MaterialCheckboxesComponent;
    exports.MaterialChipListComponent = MaterialChipListComponent;
    exports.MaterialDatepickerComponent = MaterialDatepickerComponent;
    exports.MaterialDesignFramework = MaterialDesignFramework;
    exports.MaterialDesignFrameworkComponent = MaterialDesignFrameworkComponent;
    exports.MaterialDesignFrameworkModule = MaterialDesignFrameworkModule;
    exports.MaterialFileComponent = MaterialFileComponent;
    exports.MaterialInputComponent = MaterialInputComponent;
    exports.MaterialNumberComponent = MaterialNumberComponent;
    exports.MaterialOneOfComponent = MaterialOneOfComponent;
    exports.MaterialRadiosComponent = MaterialRadiosComponent;
    exports.MaterialSelectComponent = MaterialSelectComponent;
    exports.MaterialSliderComponent = MaterialSliderComponent;
    exports.MaterialStepperComponent = MaterialStepperComponent;
    exports.MaterialTabsComponent = MaterialTabsComponent;
    exports.MaterialTextareaComponent = MaterialTextareaComponent;
    exports.ɵa = MomentUtcDateAdapter;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ajsf-material.umd.js.map
