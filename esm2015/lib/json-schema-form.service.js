import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import Ajv from 'ajv';
import jsonDraft6 from 'ajv/lib/refs/json-schema-draft-06.json';
import { buildFormGroup, buildFormGroupTemplate, formatFormData, getControl, fixTitle, forEach, hasOwn, toTitleCase, buildLayout, getLayoutNode, buildSchemaFromData, buildSchemaFromLayout, removeRecursiveReferences, hasValue, isArray, isDefined, isEmpty, isObject, JsonPointer } from './shared';
import { deValidationMessages, enValidationMessages, esValidationMessages, frValidationMessages, itValidationMessages, ptValidationMessages, zhValidationMessages } from './locale';
import * as i0 from "@angular/core";
export class JsonSchemaFormService {
    constructor() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.ajvOptions = {
            allErrors: true,
            jsonPointers: true,
            unknownFormats: 'ignore'
        };
        this.ajv = new Ajv(this.ajvOptions); // AJV: Another JSON Schema Validator
        this.validateFormData = null; // Compiled AJV function to validate active form's schema
        this.formValues = {}; // Internal form data (may not have correct types)
        this.data = {}; // Output form data (formValues, formatted with correct data types)
        this.schema = {}; // Internal JSON Schema
        this.layout = []; // Internal form layout
        this.formGroupTemplate = {}; // Template used to create formGroup
        this.formGroup = null; // Angular formGroup, which powers the reactive form
        this.framework = null; // Active framework component
        this.validData = null; // Valid form data (or null) (=== isValid ? data : null)
        this.isValid = null; // Is current form data valid?
        this.ajvErrors = null; // Ajv errors for current data
        this.validationErrors = null; // Any validation errors for current data
        this.dataErrors = new Map(); //
        this.formValueSubscription = null; // Subscription to formGroup.valueChanges observable (for un- and re-subscribing)
        this.dataChanges = new Subject(); // Form data observable
        this.isValidChanges = new Subject(); // isValid observable
        this.validationErrorChanges = new Subject(); // validationErrors observable
        this.arrayMap = new Map(); // Maps arrays in data object and number of tuple values
        this.dataMap = new Map(); // Maps paths in form data to schema and formGroup paths
        this.dataRecursiveRefMap = new Map(); // Maps recursive reference points in form data
        this.schemaRecursiveRefMap = new Map(); // Maps recursive reference points in schema
        this.schemaRefLibrary = {}; // Library of schemas for resolving schema $refs
        this.layoutRefLibrary = { '': null }; // Library of layout nodes for adding to form
        this.templateRefLibrary = {}; // Library of formGroup templates for adding to form
        this.hasRootReference = false; // Does the form include a recursive reference to itself?
        this.language = 'en-US'; // Does the form include a recursive reference to itself?
        // Default global form options
        this.defaultFormOptions = {
            autocomplete: true,
            addSubmit: 'auto',
            // for addSubmit: true = always, false = never,
            // 'auto' = only if layout is undefined (form is built from schema alone)
            debug: false,
            disableInvalidSubmit: true,
            formDisabled: false,
            formReadonly: false,
            fieldsRequired: false,
            framework: 'no-framework',
            loadExternalAssets: false,
            pristine: { errors: true, success: true },
            supressPropertyTitles: false,
            setSchemaDefaults: 'auto',
            // true = always set (unless overridden by layout default or formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            setLayoutDefaults: 'auto',
            // true = always set (unless overridden by formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            validateOnRender: 'auto',
            // true = validate all fields immediately
            // false = only validate fields after they are touched by user
            // 'auto' = validate fields with values immediately, empty fields after they are touched
            widgets: {},
            defautWidgetOptions: {
                // Default options for form control widgets
                listItems: 1,
                addable: true,
                orderable: true,
                removable: true,
                enableErrorState: true,
                // disableErrorState: false, // Don't apply 'has-error' class when field fails validation?
                enableSuccessState: true,
                // disableSuccessState: false, // Don't apply 'has-success' class when field validates?
                feedback: false,
                feedbackOnRender: false,
                notitle: false,
                disabled: false,
                readonly: false,
                returnEmptyFields: true,
                validationMessages: {} // set by setLanguage()
            }
        };
        this.setLanguage(this.language);
        this.ajv.addMetaSchema(jsonDraft6);
    }
    setLanguage(language = 'en-US') {
        this.language = language;
        const languageValidationMessages = {
            de: deValidationMessages,
            en: enValidationMessages,
            es: esValidationMessages,
            fr: frValidationMessages,
            it: itValidationMessages,
            pt: ptValidationMessages,
            zh: zhValidationMessages,
        };
        const languageCode = language.slice(0, 2);
        const validationMessages = languageValidationMessages[languageCode];
        this.defaultFormOptions.defautWidgetOptions.validationMessages = cloneDeep(validationMessages);
    }
    getData() {
        return this.data;
    }
    getSchema() {
        return this.schema;
    }
    getLayout() {
        return this.layout;
    }
    resetAllValues() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.validateFormData = null;
        this.formValues = {};
        this.schema = {};
        this.layout = [];
        this.formGroupTemplate = {};
        this.formGroup = null;
        this.framework = null;
        this.data = {};
        this.validData = null;
        this.isValid = null;
        this.validationErrors = null;
        this.arrayMap = new Map();
        this.dataMap = new Map();
        this.dataRecursiveRefMap = new Map();
        this.schemaRecursiveRefMap = new Map();
        this.layoutRefLibrary = {};
        this.schemaRefLibrary = {};
        this.templateRefLibrary = {};
        this.formOptions = cloneDeep(this.defaultFormOptions);
    }
    /**
     * 'buildRemoteError' function
     *
     * Example errors:
     * {
     *   last_name: [ {
     *     message: 'Last name must by start with capital letter.',
     *     code: 'capital_letter'
     *   } ],
     *   email: [ {
     *     message: 'Email must be from example.com domain.',
     *     code: 'special_domain'
     *   }, {
     *     message: 'Email must contain an @ symbol.',
     *     code: 'at_symbol'
     *   } ]
     * }
     * //{ErrorMessages} errors
     */
    buildRemoteError(errors) {
        forEach(errors, (value, key) => {
            if (key in this.formGroup.controls) {
                for (const error of value) {
                    const err = {};
                    err[error['code']] = error['message'];
                    this.formGroup.get(key).setErrors(err, { emitEvent: true });
                }
            }
        });
    }
    validateData(newValue, updateSubscriptions = true) {
        // Format raw form data to correct data types
        this.data = formatFormData(newValue, this.dataMap, this.dataRecursiveRefMap, this.arrayMap, this.formOptions.returnEmptyFields);
        this.isValid = this.validateFormData(this.data);
        this.validData = this.isValid ? this.data : null;
        const compileErrors = errors => {
            const compiledErrors = {};
            (errors || []).forEach(error => {
                if (!compiledErrors[error.dataPath]) {
                    compiledErrors[error.dataPath] = [];
                }
                compiledErrors[error.dataPath].push(error.message);
            });
            return compiledErrors;
        };
        this.ajvErrors = this.validateFormData.errors;
        this.validationErrors = compileErrors(this.validateFormData.errors);
        if (updateSubscriptions) {
            this.dataChanges.next(this.data);
            this.isValidChanges.next(this.isValid);
            this.validationErrorChanges.next(this.ajvErrors);
        }
    }
    buildFormGroupTemplate(formValues = null, setValues = true) {
        this.formGroupTemplate = buildFormGroupTemplate(this, formValues, setValues);
    }
    buildFormGroup() {
        this.formGroup = buildFormGroup(this.formGroupTemplate);
        if (this.formGroup) {
            this.compileAjvSchema();
            this.validateData(this.formGroup.value);
            // Set up observables to emit data and validation info when form data changes
            if (this.formValueSubscription) {
                this.formValueSubscription.unsubscribe();
            }
            this.formValueSubscription = this.formGroup.valueChanges.subscribe(formValue => this.validateData(formValue));
        }
    }
    buildLayout(widgetLibrary) {
        this.layout = buildLayout(this, widgetLibrary);
    }
    setOptions(newOptions) {
        if (isObject(newOptions)) {
            const addOptions = cloneDeep(newOptions);
            // Backward compatibility for 'defaultOptions' (renamed 'defautWidgetOptions')
            if (isObject(addOptions.defaultOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defaultOptions);
                delete addOptions.defaultOptions;
            }
            if (isObject(addOptions.defautWidgetOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defautWidgetOptions);
                delete addOptions.defautWidgetOptions;
            }
            Object.assign(this.formOptions, addOptions);
            // convert disableErrorState / disableSuccessState to enable...
            const globalDefaults = this.formOptions.defautWidgetOptions;
            ['ErrorState', 'SuccessState']
                .filter(suffix => hasOwn(globalDefaults, 'disable' + suffix))
                .forEach(suffix => {
                globalDefaults['enable' + suffix] = !globalDefaults['disable' + suffix];
                delete globalDefaults['disable' + suffix];
            });
        }
    }
    compileAjvSchema() {
        if (!this.validateFormData) {
            // if 'ui:order' exists in properties, move it to root before compiling with ajv
            if (Array.isArray(this.schema.properties['ui:order'])) {
                this.schema['ui:order'] = this.schema.properties['ui:order'];
                delete this.schema.properties['ui:order'];
            }
            this.ajv.removeSchema(this.schema);
            this.validateFormData = this.ajv.compile(this.schema);
        }
    }
    buildSchemaFromData(data, requireAllFields = false) {
        if (data) {
            return buildSchemaFromData(data, requireAllFields);
        }
        this.schema = buildSchemaFromData(this.formValues, requireAllFields);
    }
    buildSchemaFromLayout(layout) {
        if (layout) {
            return buildSchemaFromLayout(layout);
        }
        this.schema = buildSchemaFromLayout(this.layout);
    }
    setTpldata(newTpldata = {}) {
        this.tpldata = newTpldata;
    }
    parseText(text = '', value = {}, values = {}, key = null) {
        if (!text || !/{{.+?}}/.test(text)) {
            return text;
        }
        return text.replace(/{{(.+?)}}/g, (...a) => this.parseExpression(a[1], value, values, key, this.tpldata));
    }
    parseExpression(expression = '', value = {}, values = {}, key = null, tpldata = null) {
        if (typeof expression !== 'string') {
            return '';
        }
        const index = typeof key === 'number' ? key + 1 + '' : key || '';
        expression = expression.trim();
        if ((expression[0] === "'" || expression[0] === '"') &&
            expression[0] === expression[expression.length - 1] &&
            expression.slice(1, expression.length - 1).indexOf(expression[0]) === -1) {
            return expression.slice(1, expression.length - 1);
        }
        if (expression === 'idx' || expression === '$index') {
            return index;
        }
        if (expression === 'value' && !hasOwn(values, 'value')) {
            return value;
        }
        if (['"', "'", ' ', '||', '&&', '+'].every(delim => expression.indexOf(delim) === -1)) {
            const pointer = JsonPointer.parseObjectPath(expression);
            return pointer[0] === 'value' && JsonPointer.has(value, pointer.slice(1))
                ? JsonPointer.get(value, pointer.slice(1))
                : pointer[0] === 'values' && JsonPointer.has(values, pointer.slice(1))
                    ? JsonPointer.get(values, pointer.slice(1))
                    : pointer[0] === 'tpldata' && JsonPointer.has(tpldata, pointer.slice(1))
                        ? JsonPointer.get(tpldata, pointer.slice(1))
                        : JsonPointer.has(values, pointer)
                            ? JsonPointer.get(values, pointer)
                            : '';
        }
        if (expression.indexOf('[idx]') > -1) {
            expression = expression.replace(/\[idx\]/g, index);
        }
        if (expression.indexOf('[$index]') > -1) {
            expression = expression.replace(/\[$index\]/g, index);
        }
        // TODO: Improve expression evaluation by parsing quoted strings first
        // let expressionArray = expression.match(/([^"']+|"[^"]+"|'[^']+')/g);
        if (expression.indexOf('||') > -1) {
            return expression
                .split('||')
                .reduce((all, term) => all || this.parseExpression(term, value, values, key, tpldata), '');
        }
        if (expression.indexOf('&&') > -1) {
            return expression
                .split('&&')
                .reduce((all, term) => all && this.parseExpression(term, value, values, key, tpldata), ' ')
                .trim();
        }
        if (expression.indexOf('+') > -1) {
            return expression
                .split('+')
                .map(term => this.parseExpression(term, value, values, key, tpldata))
                .join('');
        }
        return '';
    }
    setArrayItemTitle(parentCtx = {}, childNode = null, index = null) {
        const parentNode = parentCtx.layoutNode;
        const parentValues = this.getFormControlValue(parentCtx);
        const isArrayItem = (parentNode.type || '').slice(-5) === 'array' && isArray(parentValues);
        const text = JsonPointer.getFirst(isArrayItem && childNode.type !== '$ref'
            ? [
                [childNode, '/options/legend'],
                [childNode, '/options/title'],
                [parentNode, '/options/title'],
                [parentNode, '/options/legend']
            ]
            : [
                [childNode, '/options/title'],
                [childNode, '/options/legend'],
                [parentNode, '/options/title'],
                [parentNode, '/options/legend']
            ]);
        if (!text) {
            return text;
        }
        const childValue = isArray(parentValues) && index < parentValues.length
            ? parentValues[index]
            : parentValues;
        return this.parseText(text, childValue, parentValues, index);
    }
    setItemTitle(ctx) {
        return !ctx.options.title && /^(\d+|-)$/.test(ctx.layoutNode.name)
            ? null
            : this.parseText(ctx.options.title || toTitleCase(ctx.layoutNode.name), this.getFormControlValue(this), (this.getFormControlGroup(this) || {}).value, ctx.dataIndex[ctx.dataIndex.length - 1]);
    }
    evaluateCondition(layoutNode, dataIndex) {
        const arrayIndex = dataIndex && dataIndex[dataIndex.length - 1];
        let result = true;
        if (hasValue((layoutNode.options || {}).condition)) {
            if (typeof layoutNode.options.condition === 'string') {
                let pointer = layoutNode.options.condition;
                if (hasValue(arrayIndex)) {
                    pointer = pointer.replace('[arrayIndex]', `[${arrayIndex}]`);
                }
                pointer = JsonPointer.parseObjectPath(pointer);
                result = !!JsonPointer.get(this.data, pointer);
                if (!result && pointer[0] === 'model') {
                    result = !!JsonPointer.get({ model: this.data }, pointer);
                }
            }
            else if (typeof layoutNode.options.condition === 'function') {
                result = layoutNode.options.condition(this.data);
            }
            else if (typeof layoutNode.options.condition.functionBody === 'string') {
                try {
                    const dynFn = new Function('model', 'arrayIndices', layoutNode.options.condition.functionBody);
                    result = dynFn(this.data, dataIndex);
                }
                catch (e) {
                    result = true;
                    console.error('condition functionBody errored out on evaluation: ' +
                        layoutNode.options.condition.functionBody);
                }
            }
        }
        return result;
    }
    initializeControl(ctx, bind = true) {
        if (!isObject(ctx)) {
            return false;
        }
        if (isEmpty(ctx.options)) {
            ctx.options = !isEmpty((ctx.layoutNode || {}).options)
                ? ctx.layoutNode.options
                : cloneDeep(this.formOptions);
        }
        ctx.formControl = this.getFormControl(ctx);
        ctx.boundControl = bind && !!ctx.formControl;
        if (ctx.formControl) {
            ctx.controlName = this.getFormControlName(ctx);
            ctx.controlValue = ctx.formControl.value;
            ctx.controlDisabled = ctx.formControl.disabled;
            ctx.options.errorMessage =
                ctx.formControl.status === 'VALID'
                    ? null
                    : this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages);
            ctx.options.showErrors =
                this.formOptions.validateOnRender === true ||
                    (this.formOptions.validateOnRender === 'auto' &&
                        hasValue(ctx.controlValue));
            ctx.formControl.statusChanges.subscribe(status => (ctx.options.errorMessage =
                status === 'VALID'
                    ? null
                    : this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages)));
            ctx.formControl.valueChanges.subscribe(value => {
                if (!!value) {
                    ctx.controlValue = value;
                }
            });
        }
        else {
            ctx.controlName = ctx.layoutNode.name;
            ctx.controlValue = ctx.layoutNode.value || null;
            const dataPointer = this.getDataPointer(ctx);
            if (bind && dataPointer) {
                console.error(`warning: control "${dataPointer}" is not bound to the Angular FormGroup.`);
            }
        }
        return ctx.boundControl;
    }
    formatErrors(errors, validationMessages = {}) {
        if (isEmpty(errors)) {
            return null;
        }
        if (!isObject(validationMessages)) {
            validationMessages = {};
        }
        const addSpaces = string => string[0].toUpperCase() +
            (string.slice(1) || '')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/_/g, ' ');
        const formatError = error => typeof error === 'object'
            ? Object.keys(error)
                .map(key => error[key] === true
                ? addSpaces(key)
                : error[key] === false
                    ? 'Not ' + addSpaces(key)
                    : addSpaces(key) + ': ' + formatError(error[key]))
                .join(', ')
            : addSpaces(error.toString());
        const messages = [];
        return (Object.keys(errors)
            // Hide 'required' error, unless it is the only one
            .filter(errorKey => errorKey !== 'required' || Object.keys(errors).length === 1)
            .map(errorKey => 
        // If validationMessages is a string, return it
        typeof validationMessages === 'string'
            ? validationMessages
            : // If custom error message is a function, return function result
                typeof validationMessages[errorKey] === 'function'
                    ? validationMessages[errorKey](errors[errorKey])
                    : // If custom error message is a string, replace placeholders and return
                        typeof validationMessages[errorKey] === 'string'
                            ? // Does error message have any {{property}} placeholders?
                                !/{{.+?}}/.test(validationMessages[errorKey])
                                    ? validationMessages[errorKey]
                                    : // Replace {{property}} placeholders with values
                                        Object.keys(errors[errorKey]).reduce((errorMessage, errorProperty) => errorMessage.replace(new RegExp('{{' + errorProperty + '}}', 'g'), errors[errorKey][errorProperty]), validationMessages[errorKey])
                            : // If no custom error message, return formatted error data instead
                                addSpaces(errorKey) + ' Error: ' + formatError(errors[errorKey]))
            .join('<br>'));
    }
    updateValue(ctx, value) {
        // Set value of current control
        ctx.controlValue = value;
        if (ctx.boundControl) {
            ctx.formControl.setValue(value);
            ctx.formControl.markAsDirty();
        }
        ctx.layoutNode.value = value;
        // Set values of any related controls in copyValueTo array
        if (isArray(ctx.options.copyValueTo)) {
            for (const item of ctx.options.copyValueTo) {
                const targetControl = getControl(this.formGroup, item);
                if (isObject(targetControl) &&
                    typeof targetControl.setValue === 'function') {
                    targetControl.setValue(value);
                    targetControl.markAsDirty();
                }
            }
        }
    }
    updateArrayCheckboxList(ctx, checkboxList) {
        const formArray = this.getFormControl(ctx);
        // Remove all existing items
        while (formArray.value.length) {
            formArray.removeAt(0);
        }
        // Re-add an item for each checked box
        const refPointer = removeRecursiveReferences(ctx.layoutNode.dataPointer + '/-', this.dataRecursiveRefMap, this.arrayMap);
        for (const checkboxItem of checkboxList) {
            if (checkboxItem.checked) {
                const newFormControl = buildFormGroup(this.templateRefLibrary[refPointer]);
                newFormControl.setValue(checkboxItem.value);
                formArray.push(newFormControl);
            }
        }
        formArray.markAsDirty();
    }
    getFormControl(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx));
    }
    getFormControlValue(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        const control = getControl(this.formGroup, this.getDataPointer(ctx));
        return control ? control.value : null;
    }
    getFormControlGroup(ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer)) {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx), true);
    }
    getFormControlName(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toKey(this.getDataPointer(ctx));
    }
    getLayoutArray(ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -1);
    }
    getParentNode(ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -2);
    }
    getDataPointer(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toIndexedPointer(ctx.layoutNode.dataPointer, ctx.dataIndex, this.arrayMap);
    }
    getLayoutPointer(ctx) {
        if (!hasValue(ctx.layoutIndex)) {
            return null;
        }
        return '/' + ctx.layoutIndex.join('/items/');
    }
    isControlBound(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return false;
        }
        const controlGroup = this.getFormControlGroup(ctx);
        const name = this.getFormControlName(ctx);
        return controlGroup ? hasOwn(controlGroup.controls, name) : false;
    }
    addItem(ctx, name) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.$ref) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Create a new Angular form control from a template in templateRefLibrary
        const newFormGroup = buildFormGroup(this.templateRefLibrary[ctx.layoutNode.$ref]);
        // Add the new form control to the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            // Add new array item to formArray
            this.getFormControlGroup(ctx).push(newFormGroup);
        }
        else {
            // Add new $ref item to formGroup
            this.getFormControlGroup(ctx).addControl(name || this.getFormControlName(ctx), newFormGroup);
        }
        // Copy a new layoutNode from layoutRefLibrary
        const newLayoutNode = getLayoutNode(ctx.layoutNode, this);
        newLayoutNode.arrayItem = ctx.layoutNode.arrayItem;
        if (ctx.layoutNode.arrayItemType) {
            newLayoutNode.arrayItemType = ctx.layoutNode.arrayItemType;
        }
        else {
            delete newLayoutNode.arrayItemType;
        }
        if (name) {
            newLayoutNode.name = name;
            newLayoutNode.dataPointer += '/' + JsonPointer.escape(name);
            newLayoutNode.options.title = fixTitle(name);
        }
        // Add the new layoutNode to the form layout
        JsonPointer.insert(this.layout, this.getLayoutPointer(ctx), newLayoutNode);
        return true;
    }
    moveArrayItem(ctx, oldIndex, newIndex) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex) ||
            !isDefined(oldIndex) ||
            !isDefined(newIndex) ||
            oldIndex === newIndex) {
            return false;
        }
        // Move item in the formArray
        const formArray = this.getFormControlGroup(ctx);
        const arrayItem = formArray.at(oldIndex);
        formArray.removeAt(oldIndex);
        formArray.insert(newIndex, arrayItem);
        formArray.updateValueAndValidity();
        // Move layout item
        const layoutArray = this.getLayoutArray(ctx);
        layoutArray.splice(newIndex, 0, layoutArray.splice(oldIndex, 1)[0]);
        return true;
    }
    removeItem(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Remove the Angular form control from the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            // Remove array item from formArray
            this.getFormControlGroup(ctx).removeAt(ctx.dataIndex[ctx.dataIndex.length - 1]);
        }
        else {
            // Remove $ref item from formGroup
            this.getFormControlGroup(ctx).removeControl(this.getFormControlName(ctx));
        }
        // Remove layoutNode from layout
        JsonPointer.remove(this.layout, this.getLayoutPointer(ctx));
        return true;
    }
}
JsonSchemaFormService.ɵprov = i0.ɵɵdefineInjectable({ factory: function JsonSchemaFormService_Factory() { return new JsonSchemaFormService(); }, token: JsonSchemaFormService, providedIn: "root" });
JsonSchemaFormService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
JsonSchemaFormService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii9ob21lL2RuaW1vbi9Eb2N1bWVudHMvZ2l0L2NvbnZlcGF5L2Fqc2YvcHJvamVjdHMvYWpzZi1jb3JlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sU0FBUyxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQztBQUN0QixPQUFPLFVBQVUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNoRSxPQUFPLEVBQ0wsY0FBYyxFQUNkLHNCQUFzQixFQUN0QixjQUFjLEVBQ2QsVUFBVSxFQUNWLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxFQUNOLFdBQVcsRUFDWCxXQUFXLEVBQ1gsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixxQkFBcUIsRUFDckIseUJBQXlCLEVBQ3pCLFFBQVEsRUFDUixPQUFPLEVBQ1AsU0FBUyxFQUNULE9BQU8sRUFDUCxRQUFRLEVBQ1IsV0FBVyxFQUNaLE1BQU0sVUFBVSxDQUFDO0FBQ2xCLE9BQU8sRUFDTCxvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDckIsTUFBTSxVQUFVLENBQUM7O0FBb0JsQixNQUFNLE9BQU8scUJBQXFCO0lBNEZoQztRQTNGQSwwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFDOUIscUNBQWdDLEdBQUcsS0FBSyxDQUFDO1FBQ3pDLG1DQUE4QixHQUFHLEtBQUssQ0FBQztRQUN2QyxZQUFPLEdBQVEsRUFBRSxDQUFDO1FBRWxCLGVBQVUsR0FBUTtZQUNoQixTQUFT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QU07WUFDTCxrQ0FBa0M7WUFDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBRSxDQUFDLGFBQWEsQ0FDdEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUM3QixDQUFDO1NBQ0g7UUFFRCxnQ0FBZ0M7UUFDaEMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7OztZQS96QkYsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sLCBGb3JtQXJyYXksIEZvcm1Hcm91cCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgQWp2IGZyb20gJ2Fqdic7XG5pbXBvcnQganNvbkRyYWZ0NiBmcm9tICdhanYvbGliL3JlZnMvanNvbi1zY2hlbWEtZHJhZnQtMDYuanNvbic7XG5pbXBvcnQge1xuICBidWlsZEZvcm1Hcm91cCxcbiAgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZSxcbiAgZm9ybWF0Rm9ybURhdGEsXG4gIGdldENvbnRyb2wsXG4gIGZpeFRpdGxlLFxuICBmb3JFYWNoLFxuICBoYXNPd24sXG4gIHRvVGl0bGVDYXNlLFxuICBidWlsZExheW91dCxcbiAgZ2V0TGF5b3V0Tm9kZSxcbiAgYnVpbGRTY2hlbWFGcm9tRGF0YSxcbiAgYnVpbGRTY2hlbWFGcm9tTGF5b3V0LFxuICByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzLFxuICBoYXNWYWx1ZSxcbiAgaXNBcnJheSxcbiAgaXNEZWZpbmVkLFxuICBpc0VtcHR5LFxuICBpc09iamVjdCxcbiAgSnNvblBvaW50ZXJcbn0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtcbiAgZGVWYWxpZGF0aW9uTWVzc2FnZXMsXG4gIGVuVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICBlc1ZhbGlkYXRpb25NZXNzYWdlcyxcbiAgZnJWYWxpZGF0aW9uTWVzc2FnZXMsXG4gIGl0VmFsaWRhdGlvbk1lc3NhZ2VzLFxuICBwdFZhbGlkYXRpb25NZXNzYWdlcyxcbiAgemhWYWxpZGF0aW9uTWVzc2FnZXNcbn0gZnJvbSAnLi9sb2NhbGUnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgVGl0bGVNYXBJdGVtIHtcbiAgbmFtZT86IHN0cmluZztcbiAgdmFsdWU/OiBhbnk7XG4gIGNoZWNrZWQ/OiBib29sZWFuO1xuICBncm91cD86IHN0cmluZztcbiAgaXRlbXM/OiBUaXRsZU1hcEl0ZW1bXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JNZXNzYWdlcyB7XG4gIFtjb250cm9sX25hbWU6IHN0cmluZ106IHtcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCBGdW5jdGlvbiB8IE9iamVjdDtcbiAgICBjb2RlOiBzdHJpbmc7XG4gIH1bXTtcbn1cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIEpzb25TY2hlbWFGb3JtU2VydmljZSB7XG4gIEpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICBSZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICBBbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSBmYWxzZTtcbiAgdHBsZGF0YTogYW55ID0ge307XG5cbiAgYWp2T3B0aW9uczogYW55ID0ge1xuICAgIGFsbEVycm9yczogdHJ1ZSxcbiAgICBqc29uUG9pbnRlcnM6IHRydWUsXG4gICAgdW5rbm93bkZvcm1hdHM6ICdpZ25vcmUnXG4gIH07XG4gIGFqdjogYW55ID0gbmV3IEFqdih0aGlzLmFqdk9wdGlvbnMpOyAvLyBBSlY6IEFub3RoZXIgSlNPTiBTY2hlbWEgVmFsaWRhdG9yXG4gIHZhbGlkYXRlRm9ybURhdGE6IGFueSA9IG51bGw7IC8vIENvbXBpbGVkIEFKViBmdW5jdGlvbiB0byB2YWxpZGF0ZSBhY3RpdmUgZm9ybSdzIHNjaGVtYVxuXG4gIGZvcm1WYWx1ZXM6IGFueSA9IHt9OyAvLyBJbnRlcm5hbCBmb3JtIGRhdGEgKG1heSBub3QgaGF2ZSBjb3JyZWN0IHR5cGVzKVxuICBkYXRhOiBhbnkgPSB7fTsgLy8gT3V0cHV0IGZvcm0gZGF0YSAoZm9ybVZhbHVlcywgZm9ybWF0dGVkIHdpdGggY29ycmVjdCBkYXRhIHR5cGVzKVxuICBzY2hlbWE6IGFueSA9IHt9OyAvLyBJbnRlcm5hbCBKU09OIFNjaGVtYVxuICBsYXlvdXQ6IGFueVtdID0gW107IC8vIEludGVybmFsIGZvcm0gbGF5b3V0XG4gIGZvcm1Hcm91cFRlbXBsYXRlOiBhbnkgPSB7fTsgLy8gVGVtcGxhdGUgdXNlZCB0byBjcmVhdGUgZm9ybUdyb3VwXG4gIGZvcm1Hcm91cDogYW55ID0gbnVsbDsgLy8gQW5ndWxhciBmb3JtR3JvdXAsIHdoaWNoIHBvd2VycyB0aGUgcmVhY3RpdmUgZm9ybVxuICBmcmFtZXdvcms6IGFueSA9IG51bGw7IC8vIEFjdGl2ZSBmcmFtZXdvcmsgY29tcG9uZW50XG4gIGZvcm1PcHRpb25zOiBhbnk7IC8vIEFjdGl2ZSBvcHRpb25zLCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZm9ybVxuXG4gIHZhbGlkRGF0YTogYW55ID0gbnVsbDsgLy8gVmFsaWQgZm9ybSBkYXRhIChvciBudWxsKSAoPT09IGlzVmFsaWQgPyBkYXRhIDogbnVsbClcbiAgaXNWYWxpZDogYm9vbGVhbiA9IG51bGw7IC8vIElzIGN1cnJlbnQgZm9ybSBkYXRhIHZhbGlkP1xuICBhanZFcnJvcnM6IGFueSA9IG51bGw7IC8vIEFqdiBlcnJvcnMgZm9yIGN1cnJlbnQgZGF0YVxuICB2YWxpZGF0aW9uRXJyb3JzOiBhbnkgPSBudWxsOyAvLyBBbnkgdmFsaWRhdGlvbiBlcnJvcnMgZm9yIGN1cnJlbnQgZGF0YVxuICBkYXRhRXJyb3JzOiBhbnkgPSBuZXcgTWFwKCk7IC8vXG4gIGZvcm1WYWx1ZVN1YnNjcmlwdGlvbjogYW55ID0gbnVsbDsgLy8gU3Vic2NyaXB0aW9uIHRvIGZvcm1Hcm91cC52YWx1ZUNoYW5nZXMgb2JzZXJ2YWJsZSAoZm9yIHVuLSBhbmQgcmUtc3Vic2NyaWJpbmcpXG4gIGRhdGFDaGFuZ2VzOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdCgpOyAvLyBGb3JtIGRhdGEgb2JzZXJ2YWJsZVxuICBpc1ZhbGlkQ2hhbmdlczogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTsgLy8gaXNWYWxpZCBvYnNlcnZhYmxlXG4gIHZhbGlkYXRpb25FcnJvckNoYW5nZXM6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7IC8vIHZhbGlkYXRpb25FcnJvcnMgb2JzZXJ2YWJsZVxuXG4gIGFycmF5TWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIGFycmF5cyBpbiBkYXRhIG9iamVjdCBhbmQgbnVtYmVyIG9mIHR1cGxlIHZhbHVlc1xuICBkYXRhTWFwOiBNYXA8c3RyaW5nLCBhbnk+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIHBhdGhzIGluIGZvcm0gZGF0YSB0byBzY2hlbWEgYW5kIGZvcm1Hcm91cCBwYXRoc1xuICBkYXRhUmVjdXJzaXZlUmVmTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIHJlY3Vyc2l2ZSByZWZlcmVuY2UgcG9pbnRzIGluIGZvcm0gZGF0YVxuICBzY2hlbWFSZWN1cnNpdmVSZWZNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7IC8vIE1hcHMgcmVjdXJzaXZlIHJlZmVyZW5jZSBwb2ludHMgaW4gc2NoZW1hXG4gIHNjaGVtYVJlZkxpYnJhcnk6IGFueSA9IHt9OyAvLyBMaWJyYXJ5IG9mIHNjaGVtYXMgZm9yIHJlc29sdmluZyBzY2hlbWEgJHJlZnNcbiAgbGF5b3V0UmVmTGlicmFyeTogYW55ID0geyAnJzogbnVsbCB9OyAvLyBMaWJyYXJ5IG9mIGxheW91dCBub2RlcyBmb3IgYWRkaW5nIHRvIGZvcm1cbiAgdGVtcGxhdGVSZWZMaWJyYXJ5OiBhbnkgPSB7fTsgLy8gTGlicmFyeSBvZiBmb3JtR3JvdXAgdGVtcGxhdGVzIGZvciBhZGRpbmcgdG8gZm9ybVxuICBoYXNSb290UmVmZXJlbmNlID0gZmFsc2U7IC8vIERvZXMgdGhlIGZvcm0gaW5jbHVkZSBhIHJlY3Vyc2l2ZSByZWZlcmVuY2UgdG8gaXRzZWxmP1xuXG4gIGxhbmd1YWdlID0gJ2VuLVVTJzsgLy8gRG9lcyB0aGUgZm9ybSBpbmNsdWRlIGEgcmVjdXJzaXZlIHJlZmVyZW5jZSB0byBpdHNlbGY/XG5cbiAgLy8gRGVmYXVsdCBnbG9iYWwgZm9ybSBvcHRpb25zXG4gIGRlZmF1bHRGb3JtT3B0aW9uczogYW55ID0ge1xuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZSwgLy8gQWxsb3cgdGhlIHdlYiBicm93c2VyIHRvIHJlbWVtYmVyIHByZXZpb3VzIGZvcm0gc3VibWlzc2lvbiB2YWx1ZXMgYXMgZGVmYXVsdHNcbiAgICBhZGRTdWJtaXQ6ICdhdXRvJywgLy8gQWRkIGEgc3VibWl0IGJ1dHRvbiBpZiBsYXlvdXQgZG9lcyBub3QgaGF2ZSBvbmU/XG4gICAgLy8gZm9yIGFkZFN1Ym1pdDogdHJ1ZSA9IGFsd2F5cywgZmFsc2UgPSBuZXZlcixcbiAgICAvLyAnYXV0bycgPSBvbmx5IGlmIGxheW91dCBpcyB1bmRlZmluZWQgKGZvcm0gaXMgYnVpbHQgZnJvbSBzY2hlbWEgYWxvbmUpXG4gICAgZGVidWc6IGZhbHNlLCAvLyBTaG93IGRlYnVnZ2luZyBvdXRwdXQ/XG4gICAgZGlzYWJsZUludmFsaWRTdWJtaXQ6IHRydWUsIC8vIERpc2FibGUgc3VibWl0IGlmIGZvcm0gaW52YWxpZD9cbiAgICBmb3JtRGlzYWJsZWQ6IGZhbHNlLCAvLyBTZXQgZW50aXJlIGZvcm0gYXMgZGlzYWJsZWQ/IChub3QgZWRpdGFibGUsIGFuZCBkaXNhYmxlcyBvdXRwdXRzKVxuICAgIGZvcm1SZWFkb25seTogZmFsc2UsIC8vIFNldCBlbnRpcmUgZm9ybSBhcyByZWFkIG9ubHk/IChub3QgZWRpdGFibGUsIGJ1dCBvdXRwdXRzIHN0aWxsIGVuYWJsZWQpXG4gICAgZmllbGRzUmVxdWlyZWQ6IGZhbHNlLCAvLyAoc2V0IGF1dG9tYXRpY2FsbHkpIEFyZSB0aGVyZSBhbnkgcmVxdWlyZWQgZmllbGRzIGluIHRoZSBmb3JtP1xuICAgIGZyYW1ld29yazogJ25vLWZyYW1ld29yaycsIC8vIFRoZSBmcmFtZXdvcmsgdG8gbG9hZFxuICAgIGxvYWRFeHRlcm5hbEFzc2V0czogZmFsc2UsIC8vIExvYWQgZXh0ZXJuYWwgY3NzIGFuZCBKYXZhU2NyaXB0IGZvciBmcmFtZXdvcms/XG4gICAgcHJpc3RpbmU6IHsgZXJyb3JzOiB0cnVlLCBzdWNjZXNzOiB0cnVlIH0sXG4gICAgc3VwcmVzc1Byb3BlcnR5VGl0bGVzOiBmYWxzZSxcbiAgICBzZXRTY2hlbWFEZWZhdWx0czogJ2F1dG8nLCAvLyBTZXQgZmVmYXVsdCB2YWx1ZXMgZnJvbSBzY2hlbWE/XG4gICAgLy8gdHJ1ZSA9IGFsd2F5cyBzZXQgKHVubGVzcyBvdmVycmlkZGVuIGJ5IGxheW91dCBkZWZhdWx0IG9yIGZvcm1WYWx1ZXMpXG4gICAgLy8gZmFsc2UgPSBuZXZlciBzZXRcbiAgICAvLyAnYXV0bycgPSBzZXQgaW4gYWRkYWJsZSBjb21wb25lbnRzLCBhbmQgZXZlcnl3aGVyZSBpZiBmb3JtVmFsdWVzIG5vdCBzZXRcbiAgICBzZXRMYXlvdXREZWZhdWx0czogJ2F1dG8nLCAvLyBTZXQgZmVmYXVsdCB2YWx1ZXMgZnJvbSBsYXlvdXQ/XG4gICAgLy8gdHJ1ZSA9IGFsd2F5cyBzZXQgKHVubGVzcyBvdmVycmlkZGVuIGJ5IGZvcm1WYWx1ZXMpXG4gICAgLy8gZmFsc2UgPSBuZXZlciBzZXRcbiAgICAvLyAnYXV0bycgPSBzZXQgaW4gYWRkYWJsZSBjb21wb25lbnRzLCBhbmQgZXZlcnl3aGVyZSBpZiBmb3JtVmFsdWVzIG5vdCBzZXRcbiAgICB2YWxpZGF0ZU9uUmVuZGVyOiAnYXV0bycsIC8vIFZhbGlkYXRlIGZpZWxkcyBpbW1lZGlhdGVseSwgYmVmb3JlIHRoZXkgYXJlIHRvdWNoZWQ/XG4gICAgLy8gdHJ1ZSA9IHZhbGlkYXRlIGFsbCBmaWVsZHMgaW1tZWRpYXRlbHlcbiAgICAvLyBmYWxzZSA9IG9ubHkgdmFsaWRhdGUgZmllbGRzIGFmdGVyIHRoZXkgYXJlIHRvdWNoZWQgYnkgdXNlclxuICAgIC8vICdhdXRvJyA9IHZhbGlkYXRlIGZpZWxkcyB3aXRoIHZhbHVlcyBpbW1lZGlhdGVseSwgZW1wdHkgZmllbGRzIGFmdGVyIHRoZXkgYXJlIHRvdWNoZWRcbiAgICB3aWRnZXRzOiB7fSwgLy8gQW55IGN1c3RvbSB3aWRnZXRzIHRvIGxvYWRcbiAgICBkZWZhdXRXaWRnZXRPcHRpb25zOiB7XG4gICAgICAvLyBEZWZhdWx0IG9wdGlvbnMgZm9yIGZvcm0gY29udHJvbCB3aWRnZXRzXG4gICAgICBsaXN0SXRlbXM6IDEsIC8vIE51bWJlciBvZiBsaXN0IGl0ZW1zIHRvIGluaXRpYWxseSBhZGQgdG8gYXJyYXlzIHdpdGggbm8gZGVmYXVsdCB2YWx1ZVxuICAgICAgYWRkYWJsZTogdHJ1ZSwgLy8gQWxsb3cgYWRkaW5nIGl0ZW1zIHRvIGFuIGFycmF5IG9yICRyZWYgcG9pbnQ/XG4gICAgICBvcmRlcmFibGU6IHRydWUsIC8vIEFsbG93IHJlb3JkZXJpbmcgaXRlbXMgd2l0aGluIGFuIGFycmF5P1xuICAgICAgcmVtb3ZhYmxlOiB0cnVlLCAvLyBBbGxvdyByZW1vdmluZyBpdGVtcyBmcm9tIGFuIGFycmF5IG9yICRyZWYgcG9pbnQ/XG4gICAgICBlbmFibGVFcnJvclN0YXRlOiB0cnVlLCAvLyBBcHBseSAnaGFzLWVycm9yJyBjbGFzcyB3aGVuIGZpZWxkIGZhaWxzIHZhbGlkYXRpb24/XG4gICAgICAvLyBkaXNhYmxlRXJyb3JTdGF0ZTogZmFsc2UsIC8vIERvbid0IGFwcGx5ICdoYXMtZXJyb3InIGNsYXNzIHdoZW4gZmllbGQgZmFpbHMgdmFsaWRhdGlvbj9cbiAgICAgIGVuYWJsZVN1Y2Nlc3NTdGF0ZTogdHJ1ZSwgLy8gQXBwbHkgJ2hhcy1zdWNjZXNzJyBjbGFzcyB3aGVuIGZpZWxkIHZhbGlkYXRlcz9cbiAgICAgIC8vIGRpc2FibGVTdWNjZXNzU3RhdGU6IGZhbHNlLCAvLyBEb24ndCBhcHBseSAnaGFzLXN1Y2Nlc3MnIGNsYXNzIHdoZW4gZmllbGQgdmFsaWRhdGVzP1xuICAgICAgZmVlZGJhY2s6IGZhbHNlLCAvLyBTaG93IGlubGluZSBmZWVkYmFjayBpY29ucz9cbiAgICAgIGZlZWRiYWNrT25SZW5kZXI6IGZhbHNlLCAvLyBTaG93IGVycm9yTWVzc2FnZSBvbiBSZW5kZXI/XG4gICAgICBub3RpdGxlOiBmYWxzZSwgLy8gSGlkZSB0aXRsZT9cbiAgICAgIGRpc2FibGVkOiBmYWxzZSwgLy8gU2V0IGNvbnRyb2wgYXMgZGlzYWJsZWQ/IChub3QgZWRpdGFibGUsIGFuZCBleGNsdWRlZCBmcm9tIG91dHB1dClcbiAgICAgIHJlYWRvbmx5OiBmYWxzZSwgLy8gU2V0IGNvbnRyb2wgYXMgcmVhZCBvbmx5PyAobm90IGVkaXRhYmxlLCBidXQgaW5jbHVkZWQgaW4gb3V0cHV0KVxuICAgICAgcmV0dXJuRW1wdHlGaWVsZHM6IHRydWUsIC8vIHJldHVybiB2YWx1ZXMgZm9yIGZpZWxkcyB0aGF0IGNvbnRhaW4gbm8gZGF0YT9cbiAgICAgIHZhbGlkYXRpb25NZXNzYWdlczoge30gLy8gc2V0IGJ5IHNldExhbmd1YWdlKClcbiAgICB9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZXRMYW5ndWFnZSh0aGlzLmxhbmd1YWdlKTtcbiAgICB0aGlzLmFqdi5hZGRNZXRhU2NoZW1hKGpzb25EcmFmdDYpO1xuICB9XG5cbiAgc2V0TGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZyA9ICdlbi1VUycpIHtcbiAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgY29uc3QgbGFuZ3VhZ2VWYWxpZGF0aW9uTWVzc2FnZXMgPSB7XG4gICAgICBkZTogZGVWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBlbjogZW5WYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBlczogZXNWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBmcjogZnJWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBpdDogaXRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBwdDogcHRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICB6aDogemhWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgfTtcbiAgICBjb25zdCBsYW5ndWFnZUNvZGUgPSBsYW5ndWFnZS5zbGljZSgwLCAyKTtcblxuICAgIGNvbnN0IHZhbGlkYXRpb25NZXNzYWdlcyA9IGxhbmd1YWdlVmFsaWRhdGlvbk1lc3NhZ2VzW2xhbmd1YWdlQ29kZV07XG5cbiAgICB0aGlzLmRlZmF1bHRGb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlcyA9IGNsb25lRGVlcChcbiAgICAgIHZhbGlkYXRpb25NZXNzYWdlc1xuICAgICk7XG4gIH1cblxuICBnZXREYXRhKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGE7XG4gIH1cblxuICBnZXRTY2hlbWEoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZW1hO1xuICB9XG5cbiAgZ2V0TGF5b3V0KCkge1xuICAgIHJldHVybiB0aGlzLmxheW91dDtcbiAgfVxuXG4gIHJlc2V0QWxsVmFsdWVzKCkge1xuICAgIHRoaXMuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gICAgdGhpcy5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICAgIHRoaXMuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gICAgdGhpcy50cGxkYXRhID0ge307XG4gICAgdGhpcy52YWxpZGF0ZUZvcm1EYXRhID0gbnVsbDtcbiAgICB0aGlzLmZvcm1WYWx1ZXMgPSB7fTtcbiAgICB0aGlzLnNjaGVtYSA9IHt9O1xuICAgIHRoaXMubGF5b3V0ID0gW107XG4gICAgdGhpcy5mb3JtR3JvdXBUZW1wbGF0ZSA9IHt9O1xuICAgIHRoaXMuZm9ybUdyb3VwID0gbnVsbDtcbiAgICB0aGlzLmZyYW1ld29yayA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0ge307XG4gICAgdGhpcy52YWxpZERhdGEgPSBudWxsO1xuICAgIHRoaXMuaXNWYWxpZCA9IG51bGw7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gbnVsbDtcbiAgICB0aGlzLmFycmF5TWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmRhdGFSZWN1cnNpdmVSZWZNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5zY2hlbWFSZWN1cnNpdmVSZWZNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5sYXlvdXRSZWZMaWJyYXJ5ID0ge307XG4gICAgdGhpcy5zY2hlbWFSZWZMaWJyYXJ5ID0ge307XG4gICAgdGhpcy50ZW1wbGF0ZVJlZkxpYnJhcnkgPSB7fTtcbiAgICB0aGlzLmZvcm1PcHRpb25zID0gY2xvbmVEZWVwKHRoaXMuZGVmYXVsdEZvcm1PcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnYnVpbGRSZW1vdGVFcnJvcicgZnVuY3Rpb25cbiAgICpcbiAgICogRXhhbXBsZSBlcnJvcnM6XG4gICAqIHtcbiAgICogICBsYXN0X25hbWU6IFsge1xuICAgKiAgICAgbWVzc2FnZTogJ0xhc3QgbmFtZSBtdXN0IGJ5IHN0YXJ0IHdpdGggY2FwaXRhbCBsZXR0ZXIuJyxcbiAgICogICAgIGNvZGU6ICdjYXBpdGFsX2xldHRlcidcbiAgICogICB9IF0sXG4gICAqICAgZW1haWw6IFsge1xuICAgKiAgICAgbWVzc2FnZTogJ0VtYWlsIG11c3QgYmUgZnJvbSBleGFtcGxlLmNvbSBkb21haW4uJyxcbiAgICogICAgIGNvZGU6ICdzcGVjaWFsX2RvbWFpbidcbiAgICogICB9LCB7XG4gICAqICAgICBtZXNzYWdlOiAnRW1haWwgbXVzdCBjb250YWluIGFuIEAgc3ltYm9sLicsXG4gICAqICAgICBjb2RlOiAnYXRfc3ltYm9sJ1xuICAgKiAgIH0gXVxuICAgKiB9XG4gICAqIC8ve0Vycm9yTWVzc2FnZXN9IGVycm9yc1xuICAgKi9cbiAgYnVpbGRSZW1vdGVFcnJvcihlcnJvcnM6IEVycm9yTWVzc2FnZXMpIHtcbiAgICBmb3JFYWNoKGVycm9ycywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGlmIChrZXkgaW4gdGhpcy5mb3JtR3JvdXAuY29udHJvbHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBlcnJvciBvZiB2YWx1ZSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9IHt9O1xuICAgICAgICAgIGVycltlcnJvclsnY29kZSddXSA9IGVycm9yWydtZXNzYWdlJ107XG4gICAgICAgICAgdGhpcy5mb3JtR3JvdXAuZ2V0KGtleSkuc2V0RXJyb3JzKGVyciwgeyBlbWl0RXZlbnQ6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhbGlkYXRlRGF0YShuZXdWYWx1ZTogYW55LCB1cGRhdGVTdWJzY3JpcHRpb25zID0gdHJ1ZSk6IHZvaWQge1xuICAgIC8vIEZvcm1hdCByYXcgZm9ybSBkYXRhIHRvIGNvcnJlY3QgZGF0YSB0eXBlc1xuICAgIHRoaXMuZGF0YSA9IGZvcm1hdEZvcm1EYXRhKFxuICAgICAgbmV3VmFsdWUsXG4gICAgICB0aGlzLmRhdGFNYXAsXG4gICAgICB0aGlzLmRhdGFSZWN1cnNpdmVSZWZNYXAsXG4gICAgICB0aGlzLmFycmF5TWFwLFxuICAgICAgdGhpcy5mb3JtT3B0aW9ucy5yZXR1cm5FbXB0eUZpZWxkc1xuICAgICk7XG4gICAgdGhpcy5pc1ZhbGlkID0gdGhpcy52YWxpZGF0ZUZvcm1EYXRhKHRoaXMuZGF0YSk7XG4gICAgdGhpcy52YWxpZERhdGEgPSB0aGlzLmlzVmFsaWQgPyB0aGlzLmRhdGEgOiBudWxsO1xuICAgIGNvbnN0IGNvbXBpbGVFcnJvcnMgPSBlcnJvcnMgPT4ge1xuICAgICAgY29uc3QgY29tcGlsZWRFcnJvcnMgPSB7fTtcbiAgICAgIChlcnJvcnMgfHwgW10pLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBpZiAoIWNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXSkge1xuICAgICAgICAgIGNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXS5wdXNoKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gY29tcGlsZWRFcnJvcnM7XG4gICAgfTtcbiAgICB0aGlzLmFqdkVycm9ycyA9IHRoaXMudmFsaWRhdGVGb3JtRGF0YS5lcnJvcnM7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gY29tcGlsZUVycm9ycyh0aGlzLnZhbGlkYXRlRm9ybURhdGEuZXJyb3JzKTtcbiAgICBpZiAodXBkYXRlU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5kYXRhQ2hhbmdlcy5uZXh0KHRoaXMuZGF0YSk7XG4gICAgICB0aGlzLmlzVmFsaWRDaGFuZ2VzLm5leHQodGhpcy5pc1ZhbGlkKTtcbiAgICAgIHRoaXMudmFsaWRhdGlvbkVycm9yQ2hhbmdlcy5uZXh0KHRoaXMuYWp2RXJyb3JzKTtcbiAgICB9XG4gIH1cblxuICBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKGZvcm1WYWx1ZXM6IGFueSA9IG51bGwsIHNldFZhbHVlcyA9IHRydWUpIHtcbiAgICB0aGlzLmZvcm1Hcm91cFRlbXBsYXRlID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgIHRoaXMsXG4gICAgICBmb3JtVmFsdWVzLFxuICAgICAgc2V0VmFsdWVzXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkRm9ybUdyb3VwKCkge1xuICAgIHRoaXMuZm9ybUdyb3VwID0gPEZvcm1Hcm91cD5idWlsZEZvcm1Hcm91cCh0aGlzLmZvcm1Hcm91cFRlbXBsYXRlKTtcbiAgICBpZiAodGhpcy5mb3JtR3JvdXApIHtcbiAgICAgIHRoaXMuY29tcGlsZUFqdlNjaGVtYSgpO1xuICAgICAgdGhpcy52YWxpZGF0ZURhdGEodGhpcy5mb3JtR3JvdXAudmFsdWUpO1xuXG4gICAgICAvLyBTZXQgdXAgb2JzZXJ2YWJsZXMgdG8gZW1pdCBkYXRhIGFuZCB2YWxpZGF0aW9uIGluZm8gd2hlbiBmb3JtIGRhdGEgY2hhbmdlc1xuICAgICAgaWYgKHRoaXMuZm9ybVZhbHVlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMuZm9ybVZhbHVlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmZvcm1WYWx1ZVN1YnNjcmlwdGlvbiA9IHRoaXMuZm9ybUdyb3VwLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUoXG4gICAgICAgIGZvcm1WYWx1ZSA9PiB0aGlzLnZhbGlkYXRlRGF0YShmb3JtVmFsdWUpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkTGF5b3V0KHdpZGdldExpYnJhcnk6IGFueSkge1xuICAgIHRoaXMubGF5b3V0ID0gYnVpbGRMYXlvdXQodGhpcywgd2lkZ2V0TGlicmFyeSk7XG4gIH1cblxuICBzZXRPcHRpb25zKG5ld09wdGlvbnM6IGFueSkge1xuICAgIGlmIChpc09iamVjdChuZXdPcHRpb25zKSkge1xuICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IGNsb25lRGVlcChuZXdPcHRpb25zKTtcbiAgICAgIC8vIEJhY2t3YXJkIGNvbXBhdGliaWxpdHkgZm9yICdkZWZhdWx0T3B0aW9ucycgKHJlbmFtZWQgJ2RlZmF1dFdpZGdldE9wdGlvbnMnKVxuICAgICAgaWYgKGlzT2JqZWN0KGFkZE9wdGlvbnMuZGVmYXVsdE9wdGlvbnMpKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgdGhpcy5mb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zLFxuICAgICAgICAgIGFkZE9wdGlvbnMuZGVmYXVsdE9wdGlvbnNcbiAgICAgICAgKTtcbiAgICAgICAgZGVsZXRlIGFkZE9wdGlvbnMuZGVmYXVsdE9wdGlvbnM7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QoYWRkT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHRoaXMuZm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucyxcbiAgICAgICAgICBhZGRPcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnNcbiAgICAgICAgKTtcbiAgICAgICAgZGVsZXRlIGFkZE9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucztcbiAgICAgIH1cbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5mb3JtT3B0aW9ucywgYWRkT3B0aW9ucyk7XG5cbiAgICAgIC8vIGNvbnZlcnQgZGlzYWJsZUVycm9yU3RhdGUgLyBkaXNhYmxlU3VjY2Vzc1N0YXRlIHRvIGVuYWJsZS4uLlxuICAgICAgY29uc3QgZ2xvYmFsRGVmYXVsdHMgPSB0aGlzLmZvcm1PcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnM7XG4gICAgICBbJ0Vycm9yU3RhdGUnLCAnU3VjY2Vzc1N0YXRlJ11cbiAgICAgICAgLmZpbHRlcihzdWZmaXggPT4gaGFzT3duKGdsb2JhbERlZmF1bHRzLCAnZGlzYWJsZScgKyBzdWZmaXgpKVxuICAgICAgICAuZm9yRWFjaChzdWZmaXggPT4ge1xuICAgICAgICAgIGdsb2JhbERlZmF1bHRzWydlbmFibGUnICsgc3VmZml4XSA9ICFnbG9iYWxEZWZhdWx0c1tcbiAgICAgICAgICAgICdkaXNhYmxlJyArIHN1ZmZpeFxuICAgICAgICAgIF07XG4gICAgICAgICAgZGVsZXRlIGdsb2JhbERlZmF1bHRzWydkaXNhYmxlJyArIHN1ZmZpeF07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGVBanZTY2hlbWEoKSB7XG4gICAgaWYgKCF0aGlzLnZhbGlkYXRlRm9ybURhdGEpIHtcbiAgICAgIC8vIGlmICd1aTpvcmRlcicgZXhpc3RzIGluIHByb3BlcnRpZXMsIG1vdmUgaXQgdG8gcm9vdCBiZWZvcmUgY29tcGlsaW5nIHdpdGggYWp2XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnNjaGVtYS5wcm9wZXJ0aWVzWyd1aTpvcmRlciddKSkge1xuICAgICAgICB0aGlzLnNjaGVtYVsndWk6b3JkZXInXSA9IHRoaXMuc2NoZW1hLnByb3BlcnRpZXNbJ3VpOm9yZGVyJ107XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVtYS5wcm9wZXJ0aWVzWyd1aTpvcmRlciddO1xuICAgICAgfVxuICAgICAgdGhpcy5hanYucmVtb3ZlU2NoZW1hKHRoaXMuc2NoZW1hKTtcbiAgICAgIHRoaXMudmFsaWRhdGVGb3JtRGF0YSA9IHRoaXMuYWp2LmNvbXBpbGUodGhpcy5zY2hlbWEpO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkU2NoZW1hRnJvbURhdGEoZGF0YT86IGFueSwgcmVxdWlyZUFsbEZpZWxkcyA9IGZhbHNlKTogYW55IHtcbiAgICBpZiAoZGF0YSkge1xuICAgICAgcmV0dXJuIGJ1aWxkU2NoZW1hRnJvbURhdGEoZGF0YSwgcmVxdWlyZUFsbEZpZWxkcyk7XG4gICAgfVxuICAgIHRoaXMuc2NoZW1hID0gYnVpbGRTY2hlbWFGcm9tRGF0YSh0aGlzLmZvcm1WYWx1ZXMsIHJlcXVpcmVBbGxGaWVsZHMpO1xuICB9XG5cbiAgYnVpbGRTY2hlbWFGcm9tTGF5b3V0KGxheW91dD86IGFueSk6IGFueSB7XG4gICAgaWYgKGxheW91dCkge1xuICAgICAgcmV0dXJuIGJ1aWxkU2NoZW1hRnJvbUxheW91dChsYXlvdXQpO1xuICAgIH1cbiAgICB0aGlzLnNjaGVtYSA9IGJ1aWxkU2NoZW1hRnJvbUxheW91dCh0aGlzLmxheW91dCk7XG4gIH1cblxuICBzZXRUcGxkYXRhKG5ld1RwbGRhdGE6IGFueSA9IHt9KTogdm9pZCB7XG4gICAgdGhpcy50cGxkYXRhID0gbmV3VHBsZGF0YTtcbiAgfVxuXG4gIHBhcnNlVGV4dChcbiAgICB0ZXh0ID0gJycsXG4gICAgdmFsdWU6IGFueSA9IHt9LFxuICAgIHZhbHVlczogYW55ID0ge30sXG4gICAga2V5OiBudW1iZXIgfCBzdHJpbmcgPSBudWxsXG4gICk6IHN0cmluZyB7XG4gICAgaWYgKCF0ZXh0IHx8ICEve3suKz99fS8udGVzdCh0ZXh0KSkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL3t7KC4rPyl9fS9nLCAoLi4uYSkgPT5cbiAgICAgIHRoaXMucGFyc2VFeHByZXNzaW9uKGFbMV0sIHZhbHVlLCB2YWx1ZXMsIGtleSwgdGhpcy50cGxkYXRhKVxuICAgICk7XG4gIH1cblxuICBwYXJzZUV4cHJlc3Npb24oXG4gICAgZXhwcmVzc2lvbiA9ICcnLFxuICAgIHZhbHVlOiBhbnkgPSB7fSxcbiAgICB2YWx1ZXM6IGFueSA9IHt9LFxuICAgIGtleTogbnVtYmVyIHwgc3RyaW5nID0gbnVsbCxcbiAgICB0cGxkYXRhOiBhbnkgPSBudWxsXG4gICkge1xuICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJyA/IGtleSArIDEgKyAnJyA6IGtleSB8fCAnJztcbiAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi50cmltKCk7XG4gICAgaWYgKFxuICAgICAgKGV4cHJlc3Npb25bMF0gPT09IFwiJ1wiIHx8IGV4cHJlc3Npb25bMF0gPT09ICdcIicpICYmXG4gICAgICBleHByZXNzaW9uWzBdID09PSBleHByZXNzaW9uW2V4cHJlc3Npb24ubGVuZ3RoIC0gMV0gJiZcbiAgICAgIGV4cHJlc3Npb24uc2xpY2UoMSwgZXhwcmVzc2lvbi5sZW5ndGggLSAxKS5pbmRleE9mKGV4cHJlc3Npb25bMF0pID09PSAtMVxuICAgICkge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb24uc2xpY2UoMSwgZXhwcmVzc2lvbi5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24gPT09ICdpZHgnIHx8IGV4cHJlc3Npb24gPT09ICckaW5kZXgnKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uID09PSAndmFsdWUnICYmICFoYXNPd24odmFsdWVzLCAndmFsdWUnKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICBbJ1wiJywgXCInXCIsICcgJywgJ3x8JywgJyYmJywgJysnXS5ldmVyeShcbiAgICAgICAgZGVsaW0gPT4gZXhwcmVzc2lvbi5pbmRleE9mKGRlbGltKSA9PT0gLTFcbiAgICAgIClcbiAgICApIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBKc29uUG9pbnRlci5wYXJzZU9iamVjdFBhdGgoZXhwcmVzc2lvbik7XG4gICAgICByZXR1cm4gcG9pbnRlclswXSA9PT0gJ3ZhbHVlJyAmJiBKc29uUG9pbnRlci5oYXModmFsdWUsIHBvaW50ZXIuc2xpY2UoMSkpXG4gICAgICAgID8gSnNvblBvaW50ZXIuZ2V0KHZhbHVlLCBwb2ludGVyLnNsaWNlKDEpKVxuICAgICAgICA6IHBvaW50ZXJbMF0gPT09ICd2YWx1ZXMnICYmIEpzb25Qb2ludGVyLmhhcyh2YWx1ZXMsIHBvaW50ZXIuc2xpY2UoMSkpXG4gICAgICAgICAgPyBKc29uUG9pbnRlci5nZXQodmFsdWVzLCBwb2ludGVyLnNsaWNlKDEpKVxuICAgICAgICAgIDogcG9pbnRlclswXSA9PT0gJ3RwbGRhdGEnICYmIEpzb25Qb2ludGVyLmhhcyh0cGxkYXRhLCBwb2ludGVyLnNsaWNlKDEpKVxuICAgICAgICAgICAgPyBKc29uUG9pbnRlci5nZXQodHBsZGF0YSwgcG9pbnRlci5zbGljZSgxKSlcbiAgICAgICAgICAgIDogSnNvblBvaW50ZXIuaGFzKHZhbHVlcywgcG9pbnRlcilcbiAgICAgICAgICAgICAgPyBKc29uUG9pbnRlci5nZXQodmFsdWVzLCBwb2ludGVyKVxuICAgICAgICAgICAgICA6ICcnO1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCdbaWR4XScpID4gLTEpIHtcbiAgICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnJlcGxhY2UoL1xcW2lkeFxcXS9nLCA8c3RyaW5nPmluZGV4KTtcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZignWyRpbmRleF0nKSA+IC0xKSB7XG4gICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cXFskaW5kZXhcXF0vZywgPHN0cmluZz5pbmRleCk7XG4gICAgfVxuICAgIC8vIFRPRE86IEltcHJvdmUgZXhwcmVzc2lvbiBldmFsdWF0aW9uIGJ5IHBhcnNpbmcgcXVvdGVkIHN0cmluZ3MgZmlyc3RcbiAgICAvLyBsZXQgZXhwcmVzc2lvbkFycmF5ID0gZXhwcmVzc2lvbi5tYXRjaCgvKFteXCInXSt8XCJbXlwiXStcInwnW14nXSsnKS9nKTtcbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCd8fCcpID4gLTEpIHtcbiAgICAgIHJldHVybiBleHByZXNzaW9uXG4gICAgICAgIC5zcGxpdCgnfHwnKVxuICAgICAgICAucmVkdWNlKFxuICAgICAgICAgIChhbGwsIHRlcm0pID0+XG4gICAgICAgICAgICBhbGwgfHwgdGhpcy5wYXJzZUV4cHJlc3Npb24odGVybSwgdmFsdWUsIHZhbHVlcywga2V5LCB0cGxkYXRhKSxcbiAgICAgICAgICAnJ1xuICAgICAgICApO1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCcmJicpID4gLTEpIHtcbiAgICAgIHJldHVybiBleHByZXNzaW9uXG4gICAgICAgIC5zcGxpdCgnJiYnKVxuICAgICAgICAucmVkdWNlKFxuICAgICAgICAgIChhbGwsIHRlcm0pID0+XG4gICAgICAgICAgICBhbGwgJiYgdGhpcy5wYXJzZUV4cHJlc3Npb24odGVybSwgdmFsdWUsIHZhbHVlcywga2V5LCB0cGxkYXRhKSxcbiAgICAgICAgICAnICdcbiAgICAgICAgKVxuICAgICAgICAudHJpbSgpO1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCcrJykgPiAtMSkge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb25cbiAgICAgICAgLnNwbGl0KCcrJylcbiAgICAgICAgLm1hcCh0ZXJtID0+IHRoaXMucGFyc2VFeHByZXNzaW9uKHRlcm0sIHZhbHVlLCB2YWx1ZXMsIGtleSwgdHBsZGF0YSkpXG4gICAgICAgIC5qb2luKCcnKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgc2V0QXJyYXlJdGVtVGl0bGUoXG4gICAgcGFyZW50Q3R4OiBhbnkgPSB7fSxcbiAgICBjaGlsZE5vZGU6IGFueSA9IG51bGwsXG4gICAgaW5kZXg6IG51bWJlciA9IG51bGxcbiAgKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gcGFyZW50Q3R4LmxheW91dE5vZGU7XG4gICAgY29uc3QgcGFyZW50VmFsdWVzOiBhbnkgPSB0aGlzLmdldEZvcm1Db250cm9sVmFsdWUocGFyZW50Q3R4KTtcbiAgICBjb25zdCBpc0FycmF5SXRlbSA9XG4gICAgICAocGFyZW50Tm9kZS50eXBlIHx8ICcnKS5zbGljZSgtNSkgPT09ICdhcnJheScgJiYgaXNBcnJheShwYXJlbnRWYWx1ZXMpO1xuICAgIGNvbnN0IHRleHQgPSBKc29uUG9pbnRlci5nZXRGaXJzdChcbiAgICAgIGlzQXJyYXlJdGVtICYmIGNoaWxkTm9kZS50eXBlICE9PSAnJHJlZidcbiAgICAgICAgPyBbXG4gICAgICAgICAgW2NoaWxkTm9kZSwgJy9vcHRpb25zL2xlZ2VuZCddLFxuICAgICAgICAgIFtjaGlsZE5vZGUsICcvb3B0aW9ucy90aXRsZSddLFxuICAgICAgICAgIFtwYXJlbnROb2RlLCAnL29wdGlvbnMvdGl0bGUnXSxcbiAgICAgICAgICBbcGFyZW50Tm9kZSwgJy9vcHRpb25zL2xlZ2VuZCddXG4gICAgICAgIF1cbiAgICAgICAgOiBbXG4gICAgICAgICAgW2NoaWxkTm9kZSwgJy9vcHRpb25zL3RpdGxlJ10sXG4gICAgICAgICAgW2NoaWxkTm9kZSwgJy9vcHRpb25zL2xlZ2VuZCddLFxuICAgICAgICAgIFtwYXJlbnROb2RlLCAnL29wdGlvbnMvdGl0bGUnXSxcbiAgICAgICAgICBbcGFyZW50Tm9kZSwgJy9vcHRpb25zL2xlZ2VuZCddXG4gICAgICAgIF1cbiAgICApO1xuICAgIGlmICghdGV4dCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGNvbnN0IGNoaWxkVmFsdWUgPVxuICAgICAgaXNBcnJheShwYXJlbnRWYWx1ZXMpICYmIGluZGV4IDwgcGFyZW50VmFsdWVzLmxlbmd0aFxuICAgICAgICA/IHBhcmVudFZhbHVlc1tpbmRleF1cbiAgICAgICAgOiBwYXJlbnRWYWx1ZXM7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VUZXh0KHRleHQsIGNoaWxkVmFsdWUsIHBhcmVudFZhbHVlcywgaW5kZXgpO1xuICB9XG5cbiAgc2V0SXRlbVRpdGxlKGN0eDogYW55KSB7XG4gICAgcmV0dXJuICFjdHgub3B0aW9ucy50aXRsZSAmJiAvXihcXGQrfC0pJC8udGVzdChjdHgubGF5b3V0Tm9kZS5uYW1lKVxuICAgICAgPyBudWxsXG4gICAgICA6IHRoaXMucGFyc2VUZXh0KFxuICAgICAgICBjdHgub3B0aW9ucy50aXRsZSB8fCB0b1RpdGxlQ2FzZShjdHgubGF5b3V0Tm9kZS5uYW1lKSxcbiAgICAgICAgdGhpcy5nZXRGb3JtQ29udHJvbFZhbHVlKHRoaXMpLFxuICAgICAgICAodGhpcy5nZXRGb3JtQ29udHJvbEdyb3VwKHRoaXMpIHx8IDxhbnk+e30pLnZhbHVlLFxuICAgICAgICBjdHguZGF0YUluZGV4W2N0eC5kYXRhSW5kZXgubGVuZ3RoIC0gMV1cbiAgICAgICk7XG4gIH1cblxuICBldmFsdWF0ZUNvbmRpdGlvbihsYXlvdXROb2RlOiBhbnksIGRhdGFJbmRleDogbnVtYmVyW10pOiBib29sZWFuIHtcbiAgICBjb25zdCBhcnJheUluZGV4ID0gZGF0YUluZGV4ICYmIGRhdGFJbmRleFtkYXRhSW5kZXgubGVuZ3RoIC0gMV07XG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKGhhc1ZhbHVlKChsYXlvdXROb2RlLm9wdGlvbnMgfHwge30pLmNvbmRpdGlvbikpIHtcbiAgICAgIGlmICh0eXBlb2YgbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbGV0IHBvaW50ZXIgPSBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uO1xuICAgICAgICBpZiAoaGFzVmFsdWUoYXJyYXlJbmRleCkpIHtcbiAgICAgICAgICBwb2ludGVyID0gcG9pbnRlci5yZXBsYWNlKCdbYXJyYXlJbmRleF0nLCBgWyR7YXJyYXlJbmRleH1dYCk7XG4gICAgICAgIH1cbiAgICAgICAgcG9pbnRlciA9IEpzb25Qb2ludGVyLnBhcnNlT2JqZWN0UGF0aChwb2ludGVyKTtcbiAgICAgICAgcmVzdWx0ID0gISFKc29uUG9pbnRlci5nZXQodGhpcy5kYXRhLCBwb2ludGVyKTtcbiAgICAgICAgaWYgKCFyZXN1bHQgJiYgcG9pbnRlclswXSA9PT0gJ21vZGVsJykge1xuICAgICAgICAgIHJlc3VsdCA9ICEhSnNvblBvaW50ZXIuZ2V0KHsgbW9kZWw6IHRoaXMuZGF0YSB9LCBwb2ludGVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXN1bHQgPSBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uKHRoaXMuZGF0YSk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0eXBlb2YgbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbi5mdW5jdGlvbkJvZHkgPT09ICdzdHJpbmcnXG4gICAgICApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBkeW5GbiA9IG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICdtb2RlbCcsXG4gICAgICAgICAgICAnYXJyYXlJbmRpY2VzJyxcbiAgICAgICAgICAgIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24uZnVuY3Rpb25Cb2R5XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXN1bHQgPSBkeW5Gbih0aGlzLmRhdGEsIGRhdGFJbmRleCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAnY29uZGl0aW9uIGZ1bmN0aW9uQm9keSBlcnJvcmVkIG91dCBvbiBldmFsdWF0aW9uOiAnICtcbiAgICAgICAgICAgIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24uZnVuY3Rpb25Cb2R5XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaW5pdGlhbGl6ZUNvbnRyb2woY3R4OiBhbnksIGJpbmQgPSB0cnVlKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpc09iamVjdChjdHgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpc0VtcHR5KGN0eC5vcHRpb25zKSkge1xuICAgICAgY3R4Lm9wdGlvbnMgPSAhaXNFbXB0eSgoY3R4LmxheW91dE5vZGUgfHwge30pLm9wdGlvbnMpXG4gICAgICAgID8gY3R4LmxheW91dE5vZGUub3B0aW9uc1xuICAgICAgICA6IGNsb25lRGVlcCh0aGlzLmZvcm1PcHRpb25zKTtcbiAgICB9XG4gICAgY3R4LmZvcm1Db250cm9sID0gdGhpcy5nZXRGb3JtQ29udHJvbChjdHgpO1xuICAgIGN0eC5ib3VuZENvbnRyb2wgPSBiaW5kICYmICEhY3R4LmZvcm1Db250cm9sO1xuICAgIGlmIChjdHguZm9ybUNvbnRyb2wpIHtcbiAgICAgIGN0eC5jb250cm9sTmFtZSA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eCk7XG4gICAgICBjdHguY29udHJvbFZhbHVlID0gY3R4LmZvcm1Db250cm9sLnZhbHVlO1xuICAgICAgY3R4LmNvbnRyb2xEaXNhYmxlZCA9IGN0eC5mb3JtQ29udHJvbC5kaXNhYmxlZDtcbiAgICAgIGN0eC5vcHRpb25zLmVycm9yTWVzc2FnZSA9XG4gICAgICAgIGN0eC5mb3JtQ29udHJvbC5zdGF0dXMgPT09ICdWQUxJRCdcbiAgICAgICAgICA/IG51bGxcbiAgICAgICAgICA6IHRoaXMuZm9ybWF0RXJyb3JzKFxuICAgICAgICAgICAgY3R4LmZvcm1Db250cm9sLmVycm9ycyxcbiAgICAgICAgICAgIGN0eC5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlc1xuICAgICAgICAgICk7XG4gICAgICBjdHgub3B0aW9ucy5zaG93RXJyb3JzID1cbiAgICAgICAgdGhpcy5mb3JtT3B0aW9ucy52YWxpZGF0ZU9uUmVuZGVyID09PSB0cnVlIHx8XG4gICAgICAgICh0aGlzLmZvcm1PcHRpb25zLnZhbGlkYXRlT25SZW5kZXIgPT09ICdhdXRvJyAmJlxuICAgICAgICAgIGhhc1ZhbHVlKGN0eC5jb250cm9sVmFsdWUpKTtcbiAgICAgIGN0eC5mb3JtQ29udHJvbC5zdGF0dXNDaGFuZ2VzLnN1YnNjcmliZShcbiAgICAgICAgc3RhdHVzID0+XG4gICAgICAgICAgKGN0eC5vcHRpb25zLmVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICBzdGF0dXMgPT09ICdWQUxJRCdcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDogdGhpcy5mb3JtYXRFcnJvcnMoXG4gICAgICAgICAgICAgICAgY3R4LmZvcm1Db250cm9sLmVycm9ycyxcbiAgICAgICAgICAgICAgICBjdHgub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXNcbiAgICAgICAgICAgICAgKSlcbiAgICAgICk7XG4gICAgICBjdHguZm9ybUNvbnRyb2wudmFsdWVDaGFuZ2VzLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gICAgICAgIGlmICghIXZhbHVlKSB7XG4gICAgICAgICAgY3R4LmNvbnRyb2xWYWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LmNvbnRyb2xOYW1lID0gY3R4LmxheW91dE5vZGUubmFtZTtcbiAgICAgIGN0eC5jb250cm9sVmFsdWUgPSBjdHgubGF5b3V0Tm9kZS52YWx1ZSB8fCBudWxsO1xuICAgICAgY29uc3QgZGF0YVBvaW50ZXIgPSB0aGlzLmdldERhdGFQb2ludGVyKGN0eCk7XG4gICAgICBpZiAoYmluZCAmJiBkYXRhUG9pbnRlcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIGB3YXJuaW5nOiBjb250cm9sIFwiJHtkYXRhUG9pbnRlcn1cIiBpcyBub3QgYm91bmQgdG8gdGhlIEFuZ3VsYXIgRm9ybUdyb3VwLmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0eC5ib3VuZENvbnRyb2w7XG4gIH1cblxuICBmb3JtYXRFcnJvcnMoZXJyb3JzOiBhbnksIHZhbGlkYXRpb25NZXNzYWdlczogYW55ID0ge30pOiBzdHJpbmcge1xuICAgIGlmIChpc0VtcHR5KGVycm9ycykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoIWlzT2JqZWN0KHZhbGlkYXRpb25NZXNzYWdlcykpIHtcbiAgICAgIHZhbGlkYXRpb25NZXNzYWdlcyA9IHt9O1xuICAgIH1cbiAgICBjb25zdCBhZGRTcGFjZXMgPSBzdHJpbmcgPT5cbiAgICAgIHN0cmluZ1swXS50b1VwcGVyQ2FzZSgpICtcbiAgICAgIChzdHJpbmcuc2xpY2UoMSkgfHwgJycpXG4gICAgICAgIC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEgJDInKVxuICAgICAgICAucmVwbGFjZSgvXy9nLCAnICcpO1xuICAgIGNvbnN0IGZvcm1hdEVycm9yID0gZXJyb3IgPT5cbiAgICAgIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCdcbiAgICAgICAgPyBPYmplY3Qua2V5cyhlcnJvcilcbiAgICAgICAgICAubWFwKGtleSA9PlxuICAgICAgICAgICAgZXJyb3Jba2V5XSA9PT0gdHJ1ZVxuICAgICAgICAgICAgICA/IGFkZFNwYWNlcyhrZXkpXG4gICAgICAgICAgICAgIDogZXJyb3Jba2V5XSA9PT0gZmFsc2VcbiAgICAgICAgICAgICAgICA/ICdOb3QgJyArIGFkZFNwYWNlcyhrZXkpXG4gICAgICAgICAgICAgICAgOiBhZGRTcGFjZXMoa2V5KSArICc6ICcgKyBmb3JtYXRFcnJvcihlcnJvcltrZXldKVxuICAgICAgICAgIClcbiAgICAgICAgICAuam9pbignLCAnKVxuICAgICAgICA6IGFkZFNwYWNlcyhlcnJvci50b1N0cmluZygpKTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgIHJldHVybiAoXG4gICAgICBPYmplY3Qua2V5cyhlcnJvcnMpXG4gICAgICAgIC8vIEhpZGUgJ3JlcXVpcmVkJyBlcnJvciwgdW5sZXNzIGl0IGlzIHRoZSBvbmx5IG9uZVxuICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgIGVycm9yS2V5ID0+XG4gICAgICAgICAgICBlcnJvcktleSAhPT0gJ3JlcXVpcmVkJyB8fCBPYmplY3Qua2V5cyhlcnJvcnMpLmxlbmd0aCA9PT0gMVxuICAgICAgICApXG4gICAgICAgIC5tYXAoZXJyb3JLZXkgPT5cbiAgICAgICAgICAvLyBJZiB2YWxpZGF0aW9uTWVzc2FnZXMgaXMgYSBzdHJpbmcsIHJldHVybiBpdFxuICAgICAgICAgIHR5cGVvZiB2YWxpZGF0aW9uTWVzc2FnZXMgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IHZhbGlkYXRpb25NZXNzYWdlc1xuICAgICAgICAgICAgOiAvLyBJZiBjdXN0b20gZXJyb3IgbWVzc2FnZSBpcyBhIGZ1bmN0aW9uLCByZXR1cm4gZnVuY3Rpb24gcmVzdWx0XG4gICAgICAgICAgICB0eXBlb2YgdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV0oZXJyb3JzW2Vycm9yS2V5XSlcbiAgICAgICAgICAgICAgOiAvLyBJZiBjdXN0b20gZXJyb3IgbWVzc2FnZSBpcyBhIHN0cmluZywgcmVwbGFjZSBwbGFjZWhvbGRlcnMgYW5kIHJldHVyblxuICAgICAgICAgICAgICB0eXBlb2YgdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICA/IC8vIERvZXMgZXJyb3IgbWVzc2FnZSBoYXZlIGFueSB7e3Byb3BlcnR5fX0gcGxhY2Vob2xkZXJzP1xuICAgICAgICAgICAgICAgICEve3suKz99fS8udGVzdCh2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldKVxuICAgICAgICAgICAgICAgICAgPyB2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldXG4gICAgICAgICAgICAgICAgICA6IC8vIFJlcGxhY2Uge3twcm9wZXJ0eX19IHBsYWNlaG9sZGVycyB3aXRoIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZXJyb3JzW2Vycm9yS2V5XSkucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAoZXJyb3JNZXNzYWdlLCBlcnJvclByb3BlcnR5KSA9PlxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFJlZ0V4cCgne3snICsgZXJyb3JQcm9wZXJ0eSArICd9fScsICdnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnNbZXJyb3JLZXldW2Vycm9yUHJvcGVydHldXG4gICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIDogLy8gSWYgbm8gY3VzdG9tIGVycm9yIG1lc3NhZ2UsIHJldHVybiBmb3JtYXR0ZWQgZXJyb3IgZGF0YSBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgYWRkU3BhY2VzKGVycm9yS2V5KSArICcgRXJyb3I6ICcgKyBmb3JtYXRFcnJvcihlcnJvcnNbZXJyb3JLZXldKVxuICAgICAgICApXG4gICAgICAgIC5qb2luKCc8YnI+JylcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlVmFsdWUoY3R4OiBhbnksIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBTZXQgdmFsdWUgb2YgY3VycmVudCBjb250cm9sXG4gICAgY3R4LmNvbnRyb2xWYWx1ZSA9IHZhbHVlO1xuICAgIGlmIChjdHguYm91bmRDb250cm9sKSB7XG4gICAgICBjdHguZm9ybUNvbnRyb2wuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgY3R4LmZvcm1Db250cm9sLm1hcmtBc0RpcnR5KCk7XG4gICAgfVxuICAgIGN0eC5sYXlvdXROb2RlLnZhbHVlID0gdmFsdWU7XG5cbiAgICAvLyBTZXQgdmFsdWVzIG9mIGFueSByZWxhdGVkIGNvbnRyb2xzIGluIGNvcHlWYWx1ZVRvIGFycmF5XG4gICAgaWYgKGlzQXJyYXkoY3R4Lm9wdGlvbnMuY29weVZhbHVlVG8pKSB7XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgY3R4Lm9wdGlvbnMuY29weVZhbHVlVG8pIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Q29udHJvbCA9IGdldENvbnRyb2wodGhpcy5mb3JtR3JvdXAsIGl0ZW0pO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaXNPYmplY3QodGFyZ2V0Q29udHJvbCkgJiZcbiAgICAgICAgICB0eXBlb2YgdGFyZ2V0Q29udHJvbC5zZXRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICApIHtcbiAgICAgICAgICB0YXJnZXRDb250cm9sLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICB0YXJnZXRDb250cm9sLm1hcmtBc0RpcnR5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVBcnJheUNoZWNrYm94TGlzdChjdHg6IGFueSwgY2hlY2tib3hMaXN0OiBUaXRsZU1hcEl0ZW1bXSk6IHZvaWQge1xuICAgIGNvbnN0IGZvcm1BcnJheSA9IDxGb3JtQXJyYXk+dGhpcy5nZXRGb3JtQ29udHJvbChjdHgpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBleGlzdGluZyBpdGVtc1xuICAgIHdoaWxlIChmb3JtQXJyYXkudmFsdWUubGVuZ3RoKSB7XG4gICAgICBmb3JtQXJyYXkucmVtb3ZlQXQoMCk7XG4gICAgfVxuXG4gICAgLy8gUmUtYWRkIGFuIGl0ZW0gZm9yIGVhY2ggY2hlY2tlZCBib3hcbiAgICBjb25zdCByZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgIGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgIHRoaXMuZGF0YVJlY3Vyc2l2ZVJlZk1hcCxcbiAgICAgIHRoaXMuYXJyYXlNYXBcbiAgICApO1xuICAgIGZvciAoY29uc3QgY2hlY2tib3hJdGVtIG9mIGNoZWNrYm94TGlzdCkge1xuICAgICAgaWYgKGNoZWNrYm94SXRlbS5jaGVja2VkKSB7XG4gICAgICAgIGNvbnN0IG5ld0Zvcm1Db250cm9sID0gYnVpbGRGb3JtR3JvdXAoXG4gICAgICAgICAgdGhpcy50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl1cbiAgICAgICAgKTtcbiAgICAgICAgbmV3Rm9ybUNvbnRyb2wuc2V0VmFsdWUoY2hlY2tib3hJdGVtLnZhbHVlKTtcbiAgICAgICAgZm9ybUFycmF5LnB1c2gobmV3Rm9ybUNvbnRyb2wpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3JtQXJyYXkubWFya0FzRGlydHkoKTtcbiAgfVxuXG4gIGdldEZvcm1Db250cm9sKGN0eDogYW55KTogQWJzdHJhY3RDb250cm9sIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICBjdHgubGF5b3V0Tm9kZS50eXBlID09PSAnJHJlZidcbiAgICApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29udHJvbCh0aGlzLmZvcm1Hcm91cCwgdGhpcy5nZXREYXRhUG9pbnRlcihjdHgpKTtcbiAgfVxuXG4gIGdldEZvcm1Db250cm9sVmFsdWUoY3R4OiBhbnkpOiBBYnN0cmFjdENvbnRyb2wge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgIGN0eC5sYXlvdXROb2RlLnR5cGUgPT09ICckcmVmJ1xuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRyb2wgPSBnZXRDb250cm9sKHRoaXMuZm9ybUdyb3VwLCB0aGlzLmdldERhdGFQb2ludGVyKGN0eCkpO1xuICAgIHJldHVybiBjb250cm9sID8gY29udHJvbC52YWx1ZSA6IG51bGw7XG4gIH1cblxuICBnZXRGb3JtQ29udHJvbEdyb3VwKGN0eDogYW55KTogRm9ybUFycmF5IHwgRm9ybUdyb3VwIHtcbiAgICBpZiAoIWN0eC5sYXlvdXROb2RlIHx8ICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbnRyb2wodGhpcy5mb3JtR3JvdXAsIHRoaXMuZ2V0RGF0YVBvaW50ZXIoY3R4KSwgdHJ1ZSk7XG4gIH1cblxuICBnZXRGb3JtQ29udHJvbE5hbWUoY3R4OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBKc29uUG9pbnRlci50b0tleSh0aGlzLmdldERhdGFQb2ludGVyKGN0eCkpO1xuICB9XG5cbiAgZ2V0TGF5b3V0QXJyYXkoY3R4OiBhbnkpOiBhbnlbXSB7XG4gICAgcmV0dXJuIEpzb25Qb2ludGVyLmdldCh0aGlzLmxheW91dCwgdGhpcy5nZXRMYXlvdXRQb2ludGVyKGN0eCksIDAsIC0xKTtcbiAgfVxuXG4gIGdldFBhcmVudE5vZGUoY3R4OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBKc29uUG9pbnRlci5nZXQodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpLCAwLCAtMik7XG4gIH1cblxuICBnZXREYXRhUG9pbnRlcihjdHg6IGFueSk6IHN0cmluZyB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8XG4gICAgICAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5kYXRhSW5kZXgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIEpzb25Qb2ludGVyLnRvSW5kZXhlZFBvaW50ZXIoXG4gICAgICBjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcixcbiAgICAgIGN0eC5kYXRhSW5kZXgsXG4gICAgICB0aGlzLmFycmF5TWFwXG4gICAgKTtcbiAgfVxuXG4gIGdldExheW91dFBvaW50ZXIoY3R4OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmICghaGFzVmFsdWUoY3R4LmxheW91dEluZGV4KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAnLycgKyBjdHgubGF5b3V0SW5kZXguam9pbignL2l0ZW1zLycpO1xuICB9XG5cbiAgaXNDb250cm9sQm91bmQoY3R4OiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleClcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY29udHJvbEdyb3VwID0gdGhpcy5nZXRGb3JtQ29udHJvbEdyb3VwKGN0eCk7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eCk7XG4gICAgcmV0dXJuIGNvbnRyb2xHcm91cCA/IGhhc093bihjb250cm9sR3JvdXAuY29udHJvbHMsIG5hbWUpIDogZmFsc2U7XG4gIH1cblxuICBhZGRJdGVtKGN0eDogYW55LCBuYW1lPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8XG4gICAgICAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLiRyZWYpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleCkgfHxcbiAgICAgICFoYXNWYWx1ZShjdHgubGF5b3V0SW5kZXgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IEFuZ3VsYXIgZm9ybSBjb250cm9sIGZyb20gYSB0ZW1wbGF0ZSBpbiB0ZW1wbGF0ZVJlZkxpYnJhcnlcbiAgICBjb25zdCBuZXdGb3JtR3JvdXAgPSBidWlsZEZvcm1Hcm91cChcbiAgICAgIHRoaXMudGVtcGxhdGVSZWZMaWJyYXJ5W2N0eC5sYXlvdXROb2RlLiRyZWZdXG4gICAgKTtcblxuICAgIC8vIEFkZCB0aGUgbmV3IGZvcm0gY29udHJvbCB0byB0aGUgcGFyZW50IGZvcm1BcnJheSBvciBmb3JtR3JvdXBcbiAgICBpZiAoY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtKSB7XG4gICAgICAvLyBBZGQgbmV3IGFycmF5IGl0ZW0gdG8gZm9ybUFycmF5XG4gICAgICAoPEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KSkucHVzaChuZXdGb3JtR3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBZGQgbmV3ICRyZWYgaXRlbSB0byBmb3JtR3JvdXBcbiAgICAgICg8Rm9ybUdyb3VwPnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKS5hZGRDb250cm9sKFxuICAgICAgICBuYW1lIHx8IHRoaXMuZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eCksXG4gICAgICAgIG5ld0Zvcm1Hcm91cFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IGEgbmV3IGxheW91dE5vZGUgZnJvbSBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgY29uc3QgbmV3TGF5b3V0Tm9kZSA9IGdldExheW91dE5vZGUoY3R4LmxheW91dE5vZGUsIHRoaXMpO1xuICAgIG5ld0xheW91dE5vZGUuYXJyYXlJdGVtID0gY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtO1xuICAgIGlmIChjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlKSB7XG4gICAgICBuZXdMYXlvdXROb2RlLmFycmF5SXRlbVR5cGUgPSBjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbmV3TGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlO1xuICAgIH1cbiAgICBpZiAobmFtZSkge1xuICAgICAgbmV3TGF5b3V0Tm9kZS5uYW1lID0gbmFtZTtcbiAgICAgIG5ld0xheW91dE5vZGUuZGF0YVBvaW50ZXIgKz0gJy8nICsgSnNvblBvaW50ZXIuZXNjYXBlKG5hbWUpO1xuICAgICAgbmV3TGF5b3V0Tm9kZS5vcHRpb25zLnRpdGxlID0gZml4VGl0bGUobmFtZSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBuZXcgbGF5b3V0Tm9kZSB0byB0aGUgZm9ybSBsYXlvdXRcbiAgICBKc29uUG9pbnRlci5pbnNlcnQodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpLCBuZXdMYXlvdXROb2RlKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbW92ZUFycmF5SXRlbShjdHg6IGFueSwgb2xkSW5kZXg6IG51bWJlciwgbmV3SW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleCkgfHxcbiAgICAgICFpc0RlZmluZWQob2xkSW5kZXgpIHx8XG4gICAgICAhaXNEZWZpbmVkKG5ld0luZGV4KSB8fFxuICAgICAgb2xkSW5kZXggPT09IG5ld0luZGV4XG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTW92ZSBpdGVtIGluIHRoZSBmb3JtQXJyYXlcbiAgICBjb25zdCBmb3JtQXJyYXkgPSA8Rm9ybUFycmF5PnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpO1xuICAgIGNvbnN0IGFycmF5SXRlbSA9IGZvcm1BcnJheS5hdChvbGRJbmRleCk7XG4gICAgZm9ybUFycmF5LnJlbW92ZUF0KG9sZEluZGV4KTtcbiAgICBmb3JtQXJyYXkuaW5zZXJ0KG5ld0luZGV4LCBhcnJheUl0ZW0pO1xuICAgIGZvcm1BcnJheS51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG5cbiAgICAvLyBNb3ZlIGxheW91dCBpdGVtXG4gICAgY29uc3QgbGF5b3V0QXJyYXkgPSB0aGlzLmdldExheW91dEFycmF5KGN0eCk7XG4gICAgbGF5b3V0QXJyYXkuc3BsaWNlKG5ld0luZGV4LCAwLCBsYXlvdXRBcnJheS5zcGxpY2Uob2xkSW5kZXgsIDEpWzBdKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbW92ZUl0ZW0oY3R4OiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleCkgfHxcbiAgICAgICFoYXNWYWx1ZShjdHgubGF5b3V0SW5kZXgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBBbmd1bGFyIGZvcm0gY29udHJvbCBmcm9tIHRoZSBwYXJlbnQgZm9ybUFycmF5IG9yIGZvcm1Hcm91cFxuICAgIGlmIChjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW0pIHtcbiAgICAgIC8vIFJlbW92ZSBhcnJheSBpdGVtIGZyb20gZm9ybUFycmF5XG4gICAgICAoPEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KSkucmVtb3ZlQXQoXG4gICAgICAgIGN0eC5kYXRhSW5kZXhbY3R4LmRhdGFJbmRleC5sZW5ndGggLSAxXVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVtb3ZlICRyZWYgaXRlbSBmcm9tIGZvcm1Hcm91cFxuICAgICAgKDxGb3JtR3JvdXA+dGhpcy5nZXRGb3JtQ29udHJvbEdyb3VwKGN0eCkpLnJlbW92ZUNvbnRyb2woXG4gICAgICAgIHRoaXMuZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGxheW91dE5vZGUgZnJvbSBsYXlvdXRcbiAgICBKc29uUG9pbnRlci5yZW1vdmUodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19