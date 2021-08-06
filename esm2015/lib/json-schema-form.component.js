import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { convertSchemaToDraft6 } from './shared/convert-schema-to-draft6.function';
import { forEach, hasOwn } from './shared/utility.functions';
import { FrameworkLibraryService } from './framework-library/framework-library.service';
import { hasValue, inArray, isArray, isEmpty, isObject } from './shared/validator.functions';
import { JsonPointer } from './shared/jsonpointer.functions';
import { JsonSchemaFormService } from './json-schema-form.service';
import { resolveSchemaReferences } from './shared/json-schema.functions';
import { WidgetLibraryService } from './widget-library/widget-library.service';
import { Subscription } from 'rxjs';
/**
 * @module 'JsonSchemaFormComponent' - Angular JSON Schema Form
 *
 * Root module of the Angular JSON Schema Form client-side library,
 * an Angular library which generates an HTML form from a JSON schema
 * structured data model and/or a JSON Schema Form layout description.
 *
 * This library also validates input data by the user, using both validators on
 * individual controls to provide real-time feedback while the user is filling
 * out the form, and then validating the entire input against the schema when
 * the form is submitted to make sure the returned JSON data object is valid.
 *
 * This library is similar to, and mostly API compatible with:
 *
 * - JSON Schema Form's Angular Schema Form library for AngularJs
 *   http://schemaform.io
 *   http://schemaform.io/examples/bootstrap-example.html (examples)
 *
 * - Mozilla's react-jsonschema-form library for React
 *   https://github.com/mozilla-services/react-jsonschema-form
 *   https://mozilla-services.github.io/react-jsonschema-form (examples)
 *
 * - Joshfire's JSON Form library for jQuery
 *   https://github.com/joshfire/jsonform
 *   http://ulion.github.io/jsonform/playground (examples)
 *
 * This library depends on:
 *  - Angular (obviously)                  https://angular.io
 *  - lodash, JavaScript utility library   https://github.com/lodash/lodash
 *  - ajv, Another JSON Schema validator   https://github.com/epoberezkin/ajv
 *
 * In addition, the Example Playground also depends on:
 *  - brace, Browserified Ace editor       http://thlorenz.github.io/brace
 */
export class JsonSchemaFormComponent {
    constructor(changeDetector, frameworkLibrary, widgetLibrary, jsf) {
        this.changeDetector = changeDetector;
        this.frameworkLibrary = frameworkLibrary;
        this.widgetLibrary = widgetLibrary;
        this.jsf = jsf;
        this.formValueSubscription = null;
        this.formInitialized = false;
        this.objectWrap = false; // Is non-object input schema wrapped in an object?
        this.subscriptions = new Subscription();
        this.previousInputs = {
            schema: null, layout: null, data: null, options: null, framework: null,
            widgets: null, form: null, model: null, JSONSchema: null, UISchema: null,
            formData: null, loadExternalAssets: null, debug: null,
        };
        // Outputs
        this.onChanges = new EventEmitter(); // Live unvalidated internal form data
        this.onSubmit = new EventEmitter(); // Complete validated form data
        this.isValid = new EventEmitter(); // Is current data valid?
        this.validationErrors = new EventEmitter(); // Validation errors (if any)
        this.formSchema = new EventEmitter(); // Final schema used to create form
        this.formLayout = new EventEmitter(); // Final layout used to create form
        // Outputs for possible 2-way data binding
        // Only the one input providing the initial form data will be bound.
        // If there is no inital data, input '{}' to activate 2-way data binding.
        // There is no 2-way binding if inital data is combined inside the 'form' input.
        this.dataChange = new EventEmitter();
        this.modelChange = new EventEmitter();
        this.formDataChange = new EventEmitter();
        this.ngModelChange = new EventEmitter();
    }
    get value() {
        return this.objectWrap ? this.jsf.data['1'] : this.jsf.data;
    }
    set value(value) {
        this.setFormValues(value, false);
    }
    resetScriptsAndStyleSheets() {
        document.querySelectorAll('.ajsf').forEach(element => element.remove());
    }
    loadScripts() {
        const scripts = this.frameworkLibrary.getFrameworkScripts();
        scripts.map(script => {
            const scriptTag = document.createElement('script');
            scriptTag.src = script;
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.setAttribute('class', 'ajsf');
            document.getElementsByTagName('head')[0].appendChild(scriptTag);
        });
    }
    loadStyleSheets() {
        const stylesheets = this.frameworkLibrary.getFrameworkStylesheets();
        stylesheets.map(stylesheet => {
            const linkTag = document.createElement('link');
            linkTag.rel = 'stylesheet';
            linkTag.href = stylesheet;
            linkTag.setAttribute('class', 'ajsf');
            document.getElementsByTagName('head')[0].appendChild(linkTag);
        });
    }
    loadAssets() {
        this.resetScriptsAndStyleSheets();
        this.loadScripts();
        this.loadStyleSheets();
    }
    ngOnInit() {
        this.updateForm();
        this.loadAssets();
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
    ngOnChanges(changes) {
        this.updateForm();
        // Check if there's changes in Framework then load assets if that's the
        if (changes.framework) {
            if (!changes.framework.isFirstChange() &&
                (changes.framework.previousValue !== changes.framework.currentValue)) {
                this.loadAssets();
            }
        }
    }
    writeValue(value) {
        this.setFormValues(value, false);
        if (!this.formValuesInput) {
            this.formValuesInput = 'ngModel';
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        if (this.jsf.formOptions.formDisabled !== !!isDisabled) {
            this.jsf.formOptions.formDisabled = !!isDisabled;
            this.initializeForm();
        }
    }
    updateForm() {
        if (!this.formInitialized || !this.formValuesInput ||
            (this.language && this.language !== this.jsf.language)) {
            this.initializeForm();
        }
        else {
            if (this.language && this.language !== this.jsf.language) {
                this.jsf.setLanguage(this.language);
            }
            // Get names of changed inputs
            let changedInput = Object.keys(this.previousInputs)
                .filter(input => this.previousInputs[input] !== this[input]);
            let resetFirst = true;
            if (changedInput.length === 1 && changedInput[0] === 'form' &&
                this.formValuesInput.startsWith('form.')) {
                // If only 'form' input changed, get names of changed keys
                changedInput = Object.keys(this.previousInputs.form || {})
                    .filter(key => !isEqual(this.previousInputs.form[key], this.form[key]))
                    .map(key => `form.${key}`);
                resetFirst = false;
            }
            // If only input values have changed, update the form values
            if (changedInput.length === 1 && changedInput[0] === this.formValuesInput) {
                if (this.formValuesInput.indexOf('.') === -1) {
                    this.setFormValues(this[this.formValuesInput], resetFirst);
                }
                else {
                    const [input, key] = this.formValuesInput.split('.');
                    this.setFormValues(this[input][key], resetFirst);
                }
                // If anything else has changed, re-render the entire form
            }
            else if (changedInput.length) {
                this.initializeForm();
                if (this.onChange) {
                    this.onChange(this.jsf.formValues);
                }
                if (this.onTouched) {
                    this.onTouched(this.jsf.formValues);
                }
            }
            // Update previous inputs
            Object.keys(this.previousInputs)
                .filter(input => this.previousInputs[input] !== this[input])
                .forEach(input => this.previousInputs[input] = this[input]);
        }
    }
    setFormValues(formValues, resetFirst = true) {
        if (formValues) {
            const newFormValues = this.objectWrap ? formValues['1'] : formValues;
            if (!this.jsf.formGroup) {
                this.jsf.formValues = formValues;
                this.activateForm();
            }
            else if (resetFirst) {
                this.jsf.formGroup.reset();
            }
            if (this.jsf.formGroup) {
                this.jsf.formGroup.patchValue(newFormValues);
            }
            if (this.onChange) {
                this.onChange(newFormValues);
            }
            if (this.onTouched) {
                this.onTouched(newFormValues);
            }
        }
        else {
            this.jsf.formGroup.reset();
        }
    }
    submitForm() {
        const validData = this.jsf.validData;
        this.onSubmit.emit(this.objectWrap ? validData['1'] : validData);
    }
    /**
     * 'initializeForm' function
     *
     * - Update 'schema', 'layout', and 'formValues', from inputs.
     *
     * - Create 'schemaRefLibrary' and 'schemaRecursiveRefMap'
     *   to resolve schema $ref links, including recursive $ref links.
     *
     * - Create 'dataRecursiveRefMap' to resolve recursive links in data
     *   and corectly set output formats for recursively nested values.
     *
     * - Create 'layoutRefLibrary' and 'templateRefLibrary' to store
     *   new layout nodes and formGroup elements to use when dynamically
     *   adding form components to arrays and recursive $ref points.
     *
     * - Create 'dataMap' to map the data to the schema and template.
     *
     * - Create the master 'formGroupTemplate' then from it 'formGroup'
     *   the Angular formGroup used to control the reactive form.
     */
    initializeForm() {
        if (this.schema || this.layout || this.data || this.form || this.model ||
            this.JSONSchema || this.UISchema || this.formData || this.ngModel ||
            this.jsf.data) {
            this.jsf.resetAllValues(); // Reset all form values to defaults
            this.initializeOptions(); // Update options
            this.initializeSchema(); // Update schema, schemaRefLibrary,
            // schemaRecursiveRefMap, & dataRecursiveRefMap
            this.initializeLayout(); // Update layout, layoutRefLibrary,
            this.initializeData(); // Update formValues
            this.activateForm(); // Update dataMap, templateRefLibrary,
            // formGroupTemplate, formGroup
            // Uncomment individual lines to output debugging information to console:
            // (These always work.)
            // console.log('loading form...');
            // console.log('schema', this.jsf.schema);
            // console.log('layout', this.jsf.layout);
            // console.log('options', this.options);
            // console.log('formValues', this.jsf.formValues);
            // console.log('formGroupTemplate', this.jsf.formGroupTemplate);
            // console.log('formGroup', this.jsf.formGroup);
            // console.log('formGroup.value', this.jsf.formGroup.value);
            // console.log('schemaRefLibrary', this.jsf.schemaRefLibrary);
            // console.log('layoutRefLibrary', this.jsf.layoutRefLibrary);
            // console.log('templateRefLibrary', this.jsf.templateRefLibrary);
            // console.log('dataMap', this.jsf.dataMap);
            // console.log('arrayMap', this.jsf.arrayMap);
            // console.log('schemaRecursiveRefMap', this.jsf.schemaRecursiveRefMap);
            // console.log('dataRecursiveRefMap', this.jsf.dataRecursiveRefMap);
            // Uncomment individual lines to output debugging information to browser:
            // (These only work if the 'debug' option has also been set to 'true'.)
            if (this.debug || this.jsf.formOptions.debug) {
                const vars = [];
                // vars.push(this.jsf.schema);
                // vars.push(this.jsf.layout);
                // vars.push(this.options);
                // vars.push(this.jsf.formValues);
                // vars.push(this.jsf.formGroup.value);
                // vars.push(this.jsf.formGroupTemplate);
                // vars.push(this.jsf.formGroup);
                // vars.push(this.jsf.schemaRefLibrary);
                // vars.push(this.jsf.layoutRefLibrary);
                // vars.push(this.jsf.templateRefLibrary);
                // vars.push(this.jsf.dataMap);
                // vars.push(this.jsf.arrayMap);
                // vars.push(this.jsf.schemaRecursiveRefMap);
                // vars.push(this.jsf.dataRecursiveRefMap);
                this.debugOutput = vars.map(v => JSON.stringify(v, null, 2)).join('\n');
            }
            this.formInitialized = true;
        }
    }
    /**
     * 'initializeOptions' function
     *
     * Initialize 'options' (global form options) and set framework
     * Combine available inputs:
     * 1. options - recommended
     * 2. form.options - Single input style
     */
    initializeOptions() {
        if (this.language && this.language !== this.jsf.language) {
            this.jsf.setLanguage(this.language);
        }
        this.jsf.setOptions({ debug: !!this.debug });
        let loadExternalAssets = this.loadExternalAssets || false;
        let framework = this.framework || 'default';
        if (isObject(this.options)) {
            this.jsf.setOptions(this.options);
            loadExternalAssets = this.options.loadExternalAssets || loadExternalAssets;
            framework = this.options.framework || framework;
        }
        if (isObject(this.form) && isObject(this.form.options)) {
            this.jsf.setOptions(this.form.options);
            loadExternalAssets = this.form.options.loadExternalAssets || loadExternalAssets;
            framework = this.form.options.framework || framework;
        }
        if (isObject(this.widgets)) {
            this.jsf.setOptions({ widgets: this.widgets });
        }
        this.frameworkLibrary.setLoadExternalAssets(loadExternalAssets);
        this.frameworkLibrary.setFramework(framework);
        this.jsf.framework = this.frameworkLibrary.getFramework();
        if (isObject(this.jsf.formOptions.widgets)) {
            for (const widget of Object.keys(this.jsf.formOptions.widgets)) {
                this.widgetLibrary.registerWidget(widget, this.jsf.formOptions.widgets[widget]);
            }
        }
        if (isObject(this.form) && isObject(this.form.tpldata)) {
            this.jsf.setTpldata(this.form.tpldata);
        }
    }
    /**
     * 'initializeSchema' function
     *
     * Initialize 'schema'
     * Use first available input:
     * 1. schema - recommended / Angular Schema Form style
     * 2. form.schema - Single input / JSON Form style
     * 3. JSONSchema - React JSON Schema Form style
     * 4. form.JSONSchema - For testing single input React JSON Schema Forms
     * 5. form - For testing single schema-only inputs
     *
     * ... if no schema input found, the 'activateForm' function, below,
     *     will make two additional attempts to build a schema
     * 6. If layout input - build schema from layout
     * 7. If data input - build schema from data
     */
    initializeSchema() {
        // TODO: update to allow non-object schemas
        if (isObject(this.schema)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.schema = cloneDeep(this.schema);
        }
        else if (hasOwn(this.form, 'schema') && isObject(this.form.schema)) {
            this.jsf.schema = cloneDeep(this.form.schema);
        }
        else if (isObject(this.JSONSchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.schema = cloneDeep(this.JSONSchema);
        }
        else if (hasOwn(this.form, 'JSONSchema') && isObject(this.form.JSONSchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.schema = cloneDeep(this.form.JSONSchema);
        }
        else if (hasOwn(this.form, 'properties') && isObject(this.form.properties)) {
            this.jsf.schema = cloneDeep(this.form);
        }
        else if (isObject(this.form)) {
            // TODO: Handle other types of form input
        }
        if (!isEmpty(this.jsf.schema)) {
            // If other types also allowed, render schema as an object
            if (inArray('object', this.jsf.schema.type)) {
                this.jsf.schema.type = 'object';
            }
            // Wrap non-object schemas in object.
            if (hasOwn(this.jsf.schema, 'type') && this.jsf.schema.type !== 'object') {
                this.jsf.schema = {
                    'type': 'object',
                    'properties': { 1: this.jsf.schema }
                };
                this.objectWrap = true;
            }
            else if (!hasOwn(this.jsf.schema, 'type')) {
                // Add type = 'object' if missing
                if (isObject(this.jsf.schema.properties) ||
                    isObject(this.jsf.schema.patternProperties) ||
                    isObject(this.jsf.schema.additionalProperties)) {
                    this.jsf.schema.type = 'object';
                    // Fix JSON schema shorthand (JSON Form style)
                }
                else {
                    this.jsf.JsonFormCompatibility = true;
                    this.jsf.schema = {
                        'type': 'object',
                        'properties': this.jsf.schema
                    };
                }
            }
            // If needed, update JSON Schema to draft 6 format, including
            // draft 3 (JSON Form style) and draft 4 (Angular Schema Form style)
            this.jsf.schema = convertSchemaToDraft6(this.jsf.schema);
            // Initialize ajv and compile schema
            this.jsf.compileAjvSchema();
            // Create schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, & arrayMap
            this.jsf.schema = resolveSchemaReferences(this.jsf.schema, this.jsf.schemaRefLibrary, this.jsf.schemaRecursiveRefMap, this.jsf.dataRecursiveRefMap, this.jsf.arrayMap);
            if (hasOwn(this.jsf.schemaRefLibrary, '')) {
                this.jsf.hasRootReference = true;
            }
            // TODO: (?) Resolve external $ref links
            // // Create schemaRefLibrary & schemaRecursiveRefMap
            // this.parser.bundle(this.schema)
            //   .then(schema => this.schema = resolveSchemaReferences(
            //     schema, this.jsf.schemaRefLibrary,
            //     this.jsf.schemaRecursiveRefMap, this.jsf.dataRecursiveRefMap
            //   ));
        }
    }
    /**
     * 'initializeData' function
     *
     * Initialize 'formValues'
     * defulat or previously submitted values used to populate form
     * Use first available input:
     * 1. data - recommended
     * 2. model - Angular Schema Form style
     * 3. form.value - JSON Form style
     * 4. form.data - Single input style
     * 5. formData - React JSON Schema Form style
     * 6. form.formData - For easier testing of React JSON Schema Forms
     * 7. (none) no data - initialize data from schema and layout defaults only
     */
    initializeData() {
        if (hasValue(this.data)) {
            this.jsf.formValues = cloneDeep(this.data);
            this.formValuesInput = 'data';
        }
        else if (hasValue(this.model)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.model);
            this.formValuesInput = 'model';
        }
        else if (hasValue(this.ngModel)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.ngModel);
            this.formValuesInput = 'ngModel';
        }
        else if (isObject(this.form) && hasValue(this.form.value)) {
            this.jsf.JsonFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.form.value);
            this.formValuesInput = 'form.value';
        }
        else if (isObject(this.form) && hasValue(this.form.data)) {
            this.jsf.formValues = cloneDeep(this.form.data);
            this.formValuesInput = 'form.data';
        }
        else if (hasValue(this.formData)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.formValuesInput = 'formData';
        }
        else if (hasOwn(this.form, 'formData') && hasValue(this.form.formData)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.form.formData);
            this.formValuesInput = 'form.formData';
        }
        else {
            this.formValuesInput = null;
        }
    }
    /**
     * 'initializeLayout' function
     *
     * Initialize 'layout'
     * Use first available array input:
     * 1. layout - recommended
     * 2. form - Angular Schema Form style
     * 3. form.form - JSON Form style
     * 4. form.layout - Single input style
     * 5. (none) no layout - set default layout instead
     *    (full layout will be built later from the schema)
     *
     * Also, if alternate layout formats are available,
     * import from 'UISchema' or 'customFormItems'
     * used for React JSON Schema Form and JSON Form API compatibility
     * Use first available input:
     * 1. UISchema - React JSON Schema Form style
     * 2. form.UISchema - For testing single input React JSON Schema Forms
     * 2. form.customFormItems - JSON Form style
     * 3. (none) no input - don't import
     */
    initializeLayout() {
        // Rename JSON Form-style 'options' lists to
        // Angular Schema Form-style 'titleMap' lists.
        const fixJsonFormOptions = (layout) => {
            if (isObject(layout) || isArray(layout)) {
                forEach(layout, (value, key) => {
                    if (hasOwn(value, 'options') && isObject(value.options)) {
                        value.titleMap = value.options;
                        delete value.options;
                    }
                }, 'top-down');
            }
            return layout;
        };
        // Check for layout inputs and, if found, initialize form layout
        if (isArray(this.layout)) {
            this.jsf.layout = cloneDeep(this.layout);
        }
        else if (isArray(this.form)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.layout = cloneDeep(this.form);
        }
        else if (this.form && isArray(this.form.form)) {
            this.jsf.JsonFormCompatibility = true;
            this.jsf.layout = fixJsonFormOptions(cloneDeep(this.form.form));
        }
        else if (this.form && isArray(this.form.layout)) {
            this.jsf.layout = cloneDeep(this.form.layout);
        }
        else {
            this.jsf.layout = ['*'];
        }
        // Check for alternate layout inputs
        let alternateLayout = null;
        if (isObject(this.UISchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = cloneDeep(this.UISchema);
        }
        else if (hasOwn(this.form, 'UISchema')) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = cloneDeep(this.form.UISchema);
        }
        else if (hasOwn(this.form, 'uiSchema')) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = cloneDeep(this.form.uiSchema);
        }
        else if (hasOwn(this.form, 'customFormItems')) {
            this.jsf.JsonFormCompatibility = true;
            alternateLayout = fixJsonFormOptions(cloneDeep(this.form.customFormItems));
        }
        // if alternate layout found, copy alternate layout options into schema
        if (alternateLayout) {
            JsonPointer.forEachDeep(alternateLayout, (value, pointer) => {
                const schemaPointer = pointer
                    .replace(/\//g, '/properties/')
                    .replace(/\/properties\/items\/properties\//g, '/items/properties/')
                    .replace(/\/properties\/titleMap\/properties\//g, '/titleMap/properties/');
                if (hasValue(value) && hasValue(pointer)) {
                    let key = JsonPointer.toKey(pointer);
                    const groupPointer = (JsonPointer.parse(schemaPointer) || []).slice(0, -2);
                    let itemPointer;
                    // If 'ui:order' object found, copy into object schema root
                    if (key.toLowerCase() === 'ui:order') {
                        itemPointer = [...groupPointer, 'ui:order'];
                        // Copy other alternate layout options to schema 'x-schema-form',
                        // (like Angular Schema Form options) and remove any 'ui:' prefixes
                    }
                    else {
                        if (key.slice(0, 3).toLowerCase() === 'ui:') {
                            key = key.slice(3);
                        }
                        itemPointer = [...groupPointer, 'x-schema-form', key];
                    }
                    if (JsonPointer.has(this.jsf.schema, groupPointer) &&
                        !JsonPointer.has(this.jsf.schema, itemPointer)) {
                        JsonPointer.set(this.jsf.schema, itemPointer, value);
                    }
                }
            });
        }
    }
    /**
     * 'activateForm' function
     *
     * ...continued from 'initializeSchema' function, above
     * If 'schema' has not been initialized (i.e. no schema input found)
     * 6. If layout input - build schema from layout input
     * 7. If data input - build schema from data input
     *
     * Create final layout,
     * build the FormGroup template and the Angular FormGroup,
     * subscribe to changes,
     * and activate the form.
     */
    activateForm() {
        // If 'schema' not initialized
        if (isEmpty(this.jsf.schema)) {
            // TODO: If full layout input (with no '*'), build schema from layout
            // if (!this.jsf.layout.includes('*')) {
            //   this.jsf.buildSchemaFromLayout();
            // } else
            // If data input, build schema from data
            if (!isEmpty(this.jsf.formValues)) {
                this.jsf.buildSchemaFromData();
            }
        }
        if (!isEmpty(this.jsf.schema)) {
            // If not already initialized, initialize ajv and compile schema
            this.jsf.compileAjvSchema();
            // Update all layout elements, add values, widgets, and validators,
            // replace any '*' with a layout built from all schema elements,
            // and update the FormGroup template with any new validators
            this.jsf.buildLayout(this.widgetLibrary);
            // Build the Angular FormGroup template from the schema
            this.jsf.buildFormGroupTemplate(this.jsf.formValues);
            // Build the real Angular FormGroup from the FormGroup template
            this.jsf.buildFormGroup();
        }
        if (this.jsf.formGroup) {
            // Reset initial form values
            if (!isEmpty(this.jsf.formValues) &&
                this.jsf.formOptions.setSchemaDefaults !== true &&
                this.jsf.formOptions.setLayoutDefaults !== true) {
                this.setFormValues(this.jsf.formValues);
            }
            // TODO: Figure out how to display calculated values without changing object data
            // See http://ulion.github.io/jsonform/playground/?example=templating-values
            // Calculate references to other fields
            // if (!isEmpty(this.jsf.formGroup.value)) {
            //   forEach(this.jsf.formGroup.value, (value, key, object, rootObject) => {
            //     if (typeof value === 'string') {
            //       object[key] = this.jsf.parseText(value, value, rootObject, key);
            //     }
            //   }, 'top-down');
            // }
            // Subscribe to form changes to output live data, validation, and errors
            this.subscriptions.add(this.jsf.dataChanges.subscribe(data => {
                this.onChanges.emit(this.objectWrap ? data['1'] : data);
                if (this.formValuesInput && this.formValuesInput.indexOf('.') === -1) {
                    this[`${this.formValuesInput}Change`].emit(this.objectWrap ? data['1'] : data);
                }
            }));
            // Trigger change detection on statusChanges to show updated errors
            this.subscriptions.add(this.jsf.formGroup.statusChanges.subscribe(() => this.changeDetector.markForCheck()));
            this.subscriptions.add(this.jsf.isValidChanges.subscribe(isValid => this.isValid.emit(isValid)));
            this.subscriptions.add(this.jsf.validationErrorChanges.subscribe(err => this.validationErrors.emit(err)));
            // Output final schema, final layout, and initial data
            this.formSchema.emit(this.jsf.schema);
            this.formLayout.emit(this.jsf.layout);
            this.onChanges.emit(this.objectWrap ? this.jsf.data['1'] : this.jsf.data);
            // If validateOnRender, output initial validation and any errors
            const validateOnRender = JsonPointer.get(this.jsf, '/formOptions/validateOnRender');
            if (validateOnRender) { // validateOnRender === 'auto' || true
                const touchAll = (control) => {
                    if (validateOnRender === true || hasValue(control.value)) {
                        control.markAsTouched();
                    }
                    Object.keys(control.controls || {})
                        .forEach(key => touchAll(control.controls[key]));
                };
                touchAll(this.jsf.formGroup);
                this.isValid.emit(this.jsf.isValid);
                this.validationErrors.emit(this.jsf.ajvErrors);
            }
        }
    }
}
JsonSchemaFormComponent.decorators = [
    { type: Component, args: [{
                // tslint:disable-next-line:component-selector
                selector: 'json-schema-form',
                template: "<form [autocomplete]=\"jsf?.formOptions?.autocomplete ? 'on' : 'off'\" class=\"json-schema-form\" (ngSubmit)=\"submitForm()\">\n  <root-widget [layout]=\"jsf?.layout\" #rootWidget></root-widget>\n</form>\n<div *ngIf=\"debug || jsf?.formOptions?.debug\">\n  Debug output:\n  <pre>{{debugOutput}}</pre>\n</div>\n",
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
JsonSchemaFormComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: FrameworkLibraryService },
    { type: WidgetLibraryService },
    { type: JsonSchemaFormService }
];
JsonSchemaFormComponent.propDecorators = {
    schema: [{ type: Input }],
    layout: [{ type: Input }],
    data: [{ type: Input }],
    options: [{ type: Input }],
    framework: [{ type: Input }],
    widgets: [{ type: Input }],
    form: [{ type: Input }],
    model: [{ type: Input }],
    JSONSchema: [{ type: Input }],
    UISchema: [{ type: Input }],
    formData: [{ type: Input }],
    ngModel: [{ type: Input }],
    language: [{ type: Input }],
    loadExternalAssets: [{ type: Input }],
    debug: [{ type: Input }],
    value: [{ type: Input }],
    onChanges: [{ type: Output }],
    onSubmit: [{ type: Output }],
    isValid: [{ type: Output }],
    validationErrors: [{ type: Output }],
    formSchema: [{ type: Output }],
    formLayout: [{ type: Output }],
    dataChange: [{ type: Output }],
    modelChange: [{ type: Output }],
    formDataChange: [{ type: Output }],
    ngModelChange: [{ type: Output }],
    rootWidget: [{ type: ViewChild, args: ['rootWidget',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWNvcmUvc3JjL2xpYi9qc29uLXNjaGVtYS1mb3JtLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFHTCxNQUFNLEVBRU4sU0FBUyxFQUNWLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDeEYsT0FBTyxFQUNMLFFBQVEsRUFDUixPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1QsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDN0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDbkUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDekUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDL0UsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUdwQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNHO0FBT0gsTUFBTSxPQUFPLHVCQUF1QjtJQTJFbEMsWUFDVSxjQUFpQyxFQUNqQyxnQkFBeUMsRUFDekMsYUFB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QUs7dUJBRUwsS0FBSztpQ0FHTCxLQUFLO29CQUNMLEtBQUs7b0JBRUwsS0FBSzt3QkFTTCxNQUFNO3VCQUNOLE1BQU07c0JBQ04sTUFBTTsrQkFDTixNQUFNO3lCQUNOLE1BQU07eUJBQ04sTUFBTTt5QkFNTixNQUFNOzBCQUNOLE1BQU07NkJBQ04sTUFBTTs0QkFDTixNQUFNO3lCQUtOLFNBQVMsU0FBQyxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJztcbmltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC9pc0VxdWFsJztcblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdDaGlsZFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgY29udmVydFNjaGVtYVRvRHJhZnQ2IH0gZnJvbSAnLi9zaGFyZWQvY29udmVydC1zY2hlbWEtdG8tZHJhZnQ2LmZ1bmN0aW9uJztcbmltcG9ydCB7IGZvckVhY2gsIGhhc093biB9IGZyb20gJy4vc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7IEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi9mcmFtZXdvcmstbGlicmFyeS9mcmFtZXdvcmstbGlicmFyeS5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIGhhc1ZhbHVlLFxuICBpbkFycmF5LFxuICBpc0FycmF5LFxuICBpc0VtcHR5LFxuICBpc09iamVjdFxufSBmcm9tICcuL3NoYXJlZC92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9zaGFyZWQvanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcbmltcG9ydCB7IHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzIH0gZnJvbSAnLi9zaGFyZWQvanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcbmltcG9ydCB7IFdpZGdldExpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5zZXJ2aWNlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5cbi8qKlxuICogQG1vZHVsZSAnSnNvblNjaGVtYUZvcm1Db21wb25lbnQnIC0gQW5ndWxhciBKU09OIFNjaGVtYSBGb3JtXG4gKlxuICogUm9vdCBtb2R1bGUgb2YgdGhlIEFuZ3VsYXIgSlNPTiBTY2hlbWEgRm9ybSBjbGllbnQtc2lkZSBsaWJyYXJ5LFxuICogYW4gQW5ndWxhciBsaWJyYXJ5IHdoaWNoIGdlbmVyYXRlcyBhbiBIVE1MIGZvcm0gZnJvbSBhIEpTT04gc2NoZW1hXG4gKiBzdHJ1Y3R1cmVkIGRhdGEgbW9kZWwgYW5kL29yIGEgSlNPTiBTY2hlbWEgRm9ybSBsYXlvdXQgZGVzY3JpcHRpb24uXG4gKlxuICogVGhpcyBsaWJyYXJ5IGFsc28gdmFsaWRhdGVzIGlucHV0IGRhdGEgYnkgdGhlIHVzZXIsIHVzaW5nIGJvdGggdmFsaWRhdG9ycyBvblxuICogaW5kaXZpZHVhbCBjb250cm9scyB0byBwcm92aWRlIHJlYWwtdGltZSBmZWVkYmFjayB3aGlsZSB0aGUgdXNlciBpcyBmaWxsaW5nXG4gKiBvdXQgdGhlIGZvcm0sIGFuZCB0aGVuIHZhbGlkYXRpbmcgdGhlIGVudGlyZSBpbnB1dCBhZ2FpbnN0IHRoZSBzY2hlbWEgd2hlblxuICogdGhlIGZvcm0gaXMgc3VibWl0dGVkIHRvIG1ha2Ugc3VyZSB0aGUgcmV0dXJuZWQgSlNPTiBkYXRhIG9iamVjdCBpcyB2YWxpZC5cbiAqXG4gKiBUaGlzIGxpYnJhcnkgaXMgc2ltaWxhciB0bywgYW5kIG1vc3RseSBBUEkgY29tcGF0aWJsZSB3aXRoOlxuICpcbiAqIC0gSlNPTiBTY2hlbWEgRm9ybSdzIEFuZ3VsYXIgU2NoZW1hIEZvcm0gbGlicmFyeSBmb3IgQW5ndWxhckpzXG4gKiAgIGh0dHA6Ly9zY2hlbWFmb3JtLmlvXG4gKiAgIGh0dHA6Ly9zY2hlbWFmb3JtLmlvL2V4YW1wbGVzL2Jvb3RzdHJhcC1leGFtcGxlLmh0bWwgKGV4YW1wbGVzKVxuICpcbiAqIC0gTW96aWxsYSdzIHJlYWN0LWpzb25zY2hlbWEtZm9ybSBsaWJyYXJ5IGZvciBSZWFjdFxuICogICBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS1zZXJ2aWNlcy9yZWFjdC1qc29uc2NoZW1hLWZvcm1cbiAqICAgaHR0cHM6Ly9tb3ppbGxhLXNlcnZpY2VzLmdpdGh1Yi5pby9yZWFjdC1qc29uc2NoZW1hLWZvcm0gKGV4YW1wbGVzKVxuICpcbiAqIC0gSm9zaGZpcmUncyBKU09OIEZvcm0gbGlicmFyeSBmb3IgalF1ZXJ5XG4gKiAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3NoZmlyZS9qc29uZm9ybVxuICogICBodHRwOi8vdWxpb24uZ2l0aHViLmlvL2pzb25mb3JtL3BsYXlncm91bmQgKGV4YW1wbGVzKVxuICpcbiAqIFRoaXMgbGlicmFyeSBkZXBlbmRzIG9uOlxuICogIC0gQW5ndWxhciAob2J2aW91c2x5KSAgICAgICAgICAgICAgICAgIGh0dHBzOi8vYW5ndWxhci5pb1xuICogIC0gbG9kYXNoLCBKYXZhU2NyaXB0IHV0aWxpdHkgbGlicmFyeSAgIGh0dHBzOi8vZ2l0aHViLmNvbS9sb2Rhc2gvbG9kYXNoXG4gKiAgLSBhanYsIEFub3RoZXIgSlNPTiBTY2hlbWEgdmFsaWRhdG9yICAgaHR0cHM6Ly9naXRodWIuY29tL2Vwb2JlcmV6a2luL2FqdlxuICpcbiAqIEluIGFkZGl0aW9uLCB0aGUgRXhhbXBsZSBQbGF5Z3JvdW5kIGFsc28gZGVwZW5kcyBvbjpcbiAqICAtIGJyYWNlLCBCcm93c2VyaWZpZWQgQWNlIGVkaXRvciAgICAgICBodHRwOi8vdGhsb3JlbnouZ2l0aHViLmlvL2JyYWNlXG4gKi9cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnanNvbi1zY2hlbWEtZm9ybScsXG4gIHRlbXBsYXRlVXJsOiAnLi9qc29uLXNjaGVtYS1mb3JtLmNvbXBvbmVudC5odG1sJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgSnNvblNjaGVtYUZvcm1Db21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25DaGFuZ2VzLCBPbkluaXQge1xuICBkZWJ1Z091dHB1dDogYW55OyAvLyBEZWJ1ZyBpbmZvcm1hdGlvbiwgaWYgcmVxdWVzdGVkXG4gIGZvcm1WYWx1ZVN1YnNjcmlwdGlvbjogYW55ID0gbnVsbDtcbiAgZm9ybUluaXRpYWxpemVkID0gZmFsc2U7XG4gIG9iamVjdFdyYXAgPSBmYWxzZTsgLy8gSXMgbm9uLW9iamVjdCBpbnB1dCBzY2hlbWEgd3JhcHBlZCBpbiBhbiBvYmplY3Q/XG4gIHN1YnNjcmlwdGlvbnM6IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICBmb3JtVmFsdWVzSW5wdXQ6IHN0cmluZzsgLy8gTmFtZSBvZiB0aGUgaW5wdXQgcHJvdmlkaW5nIHRoZSBmb3JtIGRhdGFcbiAgcHJldmlvdXNJbnB1dHM6IHsgLy8gUHJldmlvdXMgaW5wdXQgdmFsdWVzLCB0byBkZXRlY3Qgd2hpY2ggaW5wdXQgdHJpZ2dlcnMgb25DaGFuZ2VzXG4gICAgc2NoZW1hOiBhbnksIGxheW91dDogYW55W10sIGRhdGE6IGFueSwgb3B0aW9uczogYW55LCBmcmFtZXdvcms6IGFueSB8IHN0cmluZyxcbiAgICB3aWRnZXRzOiBhbnksIGZvcm06IGFueSwgbW9kZWw6IGFueSwgSlNPTlNjaGVtYTogYW55LCBVSVNjaGVtYTogYW55LFxuICAgIGZvcm1EYXRhOiBhbnksIGxvYWRFeHRlcm5hbEFzc2V0czogYm9vbGVhbiwgZGVidWc6IGJvb2xlYW4sXG4gIH0gPSB7XG4gICAgICBzY2hlbWE6IG51bGwsIGxheW91dDogbnVsbCwgZGF0YTogbnVsbCwgb3B0aW9uczogbnVsbCwgZnJhbWV3b3JrOiBudWxsLFxuICAgICAgd2lkZ2V0czogbnVsbCwgZm9ybTogbnVsbCwgbW9kZWw6IG51bGwsIEpTT05TY2hlbWE6IG51bGwsIFVJU2NoZW1hOiBudWxsLFxuICAgICAgZm9ybURhdGE6IG51bGwsIGxvYWRFeHRlcm5hbEFzc2V0czogbnVsbCwgZGVidWc6IG51bGwsXG4gICAgfTtcblxuICAvLyBSZWNvbW1lbmRlZCBpbnB1dHNcbiAgQElucHV0KCkgc2NoZW1hOiBhbnk7IC8vIFRoZSBKU09OIFNjaGVtYVxuICBASW5wdXQoKSBsYXlvdXQ6IGFueVtdOyAvLyBUaGUgZm9ybSBsYXlvdXRcbiAgQElucHV0KCkgZGF0YTogYW55OyAvLyBUaGUgZm9ybSBkYXRhXG4gIEBJbnB1dCgpIG9wdGlvbnM6IGFueTsgLy8gVGhlIGdsb2JhbCBmb3JtIG9wdGlvbnNcbiAgQElucHV0KCkgZnJhbWV3b3JrOiBhbnkgfCBzdHJpbmc7IC8vIFRoZSBmcmFtZXdvcmsgdG8gbG9hZFxuICBASW5wdXQoKSB3aWRnZXRzOiBhbnk7IC8vIEFueSBjdXN0b20gd2lkZ2V0cyB0byBsb2FkXG5cbiAgLy8gQWx0ZXJuYXRlIGNvbWJpbmVkIHNpbmdsZSBpbnB1dFxuICBASW5wdXQoKSBmb3JtOiBhbnk7IC8vIEZvciB0ZXN0aW5nLCBhbmQgSlNPTiBTY2hlbWEgRm9ybSBBUEkgY29tcGF0aWJpbGl0eVxuXG4gIC8vIEFuZ3VsYXIgU2NoZW1hIEZvcm0gQVBJIGNvbXBhdGliaWxpdHkgaW5wdXRcbiAgQElucHV0KCkgbW9kZWw6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBmb3JtIGRhdGFcblxuICAvLyBSZWFjdCBKU09OIFNjaGVtYSBGb3JtIEFQSSBjb21wYXRpYmlsaXR5IGlucHV0c1xuICBASW5wdXQoKSBKU09OU2NoZW1hOiBhbnk7IC8vIEFsdGVybmF0ZSBpbnB1dCBmb3IgSlNPTiBTY2hlbWFcbiAgQElucHV0KCkgVUlTY2hlbWE6IGFueTsgLy8gVUkgc2NoZW1hIC0gYWx0ZXJuYXRlIGZvcm0gbGF5b3V0IGZvcm1hdFxuICBASW5wdXQoKSBmb3JtRGF0YTogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIGZvcm0gZGF0YVxuXG4gIEBJbnB1dCgpIG5nTW9kZWw6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBBbmd1bGFyIGZvcm1zXG5cbiAgQElucHV0KCkgbGFuZ3VhZ2U6IHN0cmluZzsgLy8gTGFuZ3VhZ2VcblxuICAvLyBEZXZlbG9wbWVudCBpbnB1dHMsIGZvciB0ZXN0aW5nIGFuZCBkZWJ1Z2dpbmdcbiAgQElucHV0KCkgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuOyAvLyBMb2FkIGV4dGVybmFsIGZyYW1ld29yayBhc3NldHM/XG4gIEBJbnB1dCgpIGRlYnVnOiBib29sZWFuOyAvLyBTaG93IGRlYnVnIGluZm9ybWF0aW9uP1xuXG4gIEBJbnB1dCgpXG4gIGdldCB2YWx1ZSgpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLm9iamVjdFdyYXAgPyB0aGlzLmpzZi5kYXRhWycxJ10gOiB0aGlzLmpzZi5kYXRhO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5zZXRGb3JtVmFsdWVzKHZhbHVlLCBmYWxzZSk7XG4gIH1cblxuICAvLyBPdXRwdXRzXG4gIEBPdXRwdXQoKSBvbkNoYW5nZXMgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gTGl2ZSB1bnZhbGlkYXRlZCBpbnRlcm5hbCBmb3JtIGRhdGFcbiAgQE91dHB1dCgpIG9uU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7IC8vIENvbXBsZXRlIHZhbGlkYXRlZCBmb3JtIGRhdGFcbiAgQE91dHB1dCgpIGlzVmFsaWQgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7IC8vIElzIGN1cnJlbnQgZGF0YSB2YWxpZD9cbiAgQE91dHB1dCgpIHZhbGlkYXRpb25FcnJvcnMgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gVmFsaWRhdGlvbiBlcnJvcnMgKGlmIGFueSlcbiAgQE91dHB1dCgpIGZvcm1TY2hlbWEgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gRmluYWwgc2NoZW1hIHVzZWQgdG8gY3JlYXRlIGZvcm1cbiAgQE91dHB1dCgpIGZvcm1MYXlvdXQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gRmluYWwgbGF5b3V0IHVzZWQgdG8gY3JlYXRlIGZvcm1cblxuICAvLyBPdXRwdXRzIGZvciBwb3NzaWJsZSAyLXdheSBkYXRhIGJpbmRpbmdcbiAgLy8gT25seSB0aGUgb25lIGlucHV0IHByb3ZpZGluZyB0aGUgaW5pdGlhbCBmb3JtIGRhdGEgd2lsbCBiZSBib3VuZC5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gaW5pdGFsIGRhdGEsIGlucHV0ICd7fScgdG8gYWN0aXZhdGUgMi13YXkgZGF0YSBiaW5kaW5nLlxuICAvLyBUaGVyZSBpcyBubyAyLXdheSBiaW5kaW5nIGlmIGluaXRhbCBkYXRhIGlzIGNvbWJpbmVkIGluc2lkZSB0aGUgJ2Zvcm0nIGlucHV0LlxuICBAT3V0cHV0KCkgZGF0YUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgbW9kZWxDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIGZvcm1EYXRhQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBuZ01vZGVsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgb25DaGFuZ2U6IEZ1bmN0aW9uO1xuICBvblRvdWNoZWQ6IEZ1bmN0aW9uO1xuXG4gIEBWaWV3Q2hpbGQoJ3Jvb3RXaWRnZXQnKSByb290V2lkZ2V0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgZnJhbWV3b3JrTGlicmFyeTogRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UsXG4gICAgcHJpdmF0ZSB3aWRnZXRMaWJyYXJ5OiBXaWRnZXRMaWJyYXJ5U2VydmljZSxcbiAgICBwdWJsaWMganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICkgeyB9XG5cbiAgcHJpdmF0ZSByZXNldFNjcmlwdHNBbmRTdHlsZVNoZWV0cygpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWpzZicpLmZvckVhY2goZWxlbWVudCA9PiBlbGVtZW50LnJlbW92ZSgpKTtcbiAgfVxuICBwcml2YXRlIGxvYWRTY3JpcHRzKCkge1xuICAgIGNvbnN0IHNjcmlwdHMgPSB0aGlzLmZyYW1ld29ya0xpYnJhcnkuZ2V0RnJhbWV3b3JrU2NyaXB0cygpO1xuICAgIHNjcmlwdHMubWFwKHNjcmlwdCA9PiB7XG4gICAgICBjb25zdCBzY3JpcHRUYWc6IEhUTUxTY3JpcHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHRUYWcuc3JjID0gc2NyaXB0O1xuICAgICAgc2NyaXB0VGFnLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgIHNjcmlwdFRhZy5hc3luYyA9IHRydWU7XG4gICAgICBzY3JpcHRUYWcuc2V0QXR0cmlidXRlKCdjbGFzcycsICdhanNmJyk7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdFRhZyk7XG4gICAgfSk7XG4gIH1cbiAgcHJpdmF0ZSBsb2FkU3R5bGVTaGVldHMoKSB7XG4gICAgY29uc3Qgc3R5bGVzaGVldHMgPSB0aGlzLmZyYW1ld29ya0xpYnJhcnkuZ2V0RnJhbWV3b3JrU3R5bGVzaGVldHMoKTtcbiAgICBzdHlsZXNoZWV0cy5tYXAoc3R5bGVzaGVldCA9PiB7XG4gICAgICBjb25zdCBsaW5rVGFnOiBIVE1MTGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICBsaW5rVGFnLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICAgIGxpbmtUYWcuaHJlZiA9IHN0eWxlc2hlZXQ7XG4gICAgICBsaW5rVGFnLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnYWpzZicpO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChsaW5rVGFnKTtcbiAgICB9KTtcbiAgfVxuICBwcml2YXRlIGxvYWRBc3NldHMoKSB7XG4gICAgdGhpcy5yZXNldFNjcmlwdHNBbmRTdHlsZVNoZWV0cygpO1xuICAgIHRoaXMubG9hZFNjcmlwdHMoKTtcbiAgICB0aGlzLmxvYWRTdHlsZVNoZWV0cygpO1xuICB9XG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMudXBkYXRlRm9ybSgpO1xuICAgIHRoaXMubG9hZEFzc2V0cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgdGhpcy51cGRhdGVGb3JtKCk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBjaGFuZ2VzIGluIEZyYW1ld29yayB0aGVuIGxvYWQgYXNzZXRzIGlmIHRoYXQncyB0aGVcbiAgICBpZiAoY2hhbmdlcy5mcmFtZXdvcmspIHtcbiAgICAgIGlmICghY2hhbmdlcy5mcmFtZXdvcmsuaXNGaXJzdENoYW5nZSgpICYmXG4gICAgICAgIChjaGFuZ2VzLmZyYW1ld29yay5wcmV2aW91c1ZhbHVlICE9PSBjaGFuZ2VzLmZyYW1ld29yay5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIHRoaXMubG9hZEFzc2V0cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSkge1xuICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh2YWx1ZSwgZmFsc2UpO1xuICAgIGlmICghdGhpcy5mb3JtVmFsdWVzSW5wdXQpIHsgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbmdNb2RlbCc7IH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmpzZi5mb3JtT3B0aW9ucy5mb3JtRGlzYWJsZWQgIT09ICEhaXNEaXNhYmxlZCkge1xuICAgICAgdGhpcy5qc2YuZm9ybU9wdGlvbnMuZm9ybURpc2FibGVkID0gISFpc0Rpc2FibGVkO1xuICAgICAgdGhpcy5pbml0aWFsaXplRm9ybSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUZvcm0oKSB7XG4gICAgaWYgKCF0aGlzLmZvcm1Jbml0aWFsaXplZCB8fCAhdGhpcy5mb3JtVmFsdWVzSW5wdXQgfHxcbiAgICAgICh0aGlzLmxhbmd1YWdlICYmIHRoaXMubGFuZ3VhZ2UgIT09IHRoaXMuanNmLmxhbmd1YWdlKVxuICAgICkge1xuICAgICAgdGhpcy5pbml0aWFsaXplRm9ybSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5sYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlICE9PSB0aGlzLmpzZi5sYW5ndWFnZSkge1xuICAgICAgICB0aGlzLmpzZi5zZXRMYW5ndWFnZSh0aGlzLmxhbmd1YWdlKTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG5hbWVzIG9mIGNoYW5nZWQgaW5wdXRzXG4gICAgICBsZXQgY2hhbmdlZElucHV0ID0gT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cylcbiAgICAgICAgLmZpbHRlcihpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSAhPT0gdGhpc1tpbnB1dF0pO1xuICAgICAgbGV0IHJlc2V0Rmlyc3QgPSB0cnVlO1xuICAgICAgaWYgKGNoYW5nZWRJbnB1dC5sZW5ndGggPT09IDEgJiYgY2hhbmdlZElucHV0WzBdID09PSAnZm9ybScgJiZcbiAgICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQuc3RhcnRzV2l0aCgnZm9ybS4nKVxuICAgICAgKSB7XG4gICAgICAgIC8vIElmIG9ubHkgJ2Zvcm0nIGlucHV0IGNoYW5nZWQsIGdldCBuYW1lcyBvZiBjaGFuZ2VkIGtleXNcbiAgICAgICAgY2hhbmdlZElucHV0ID0gT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cy5mb3JtIHx8IHt9KVxuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+ICFpc0VxdWFsKHRoaXMucHJldmlvdXNJbnB1dHMuZm9ybVtrZXldLCB0aGlzLmZvcm1ba2V5XSkpXG4gICAgICAgICAgLm1hcChrZXkgPT4gYGZvcm0uJHtrZXl9YCk7XG4gICAgICAgIHJlc2V0Rmlyc3QgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgb25seSBpbnB1dCB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLCB1cGRhdGUgdGhlIGZvcm0gdmFsdWVzXG4gICAgICBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCA9PT0gMSAmJiBjaGFuZ2VkSW5wdXRbMF0gPT09IHRoaXMuZm9ybVZhbHVlc0lucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZXNJbnB1dC5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKHRoaXNbdGhpcy5mb3JtVmFsdWVzSW5wdXRdLCByZXNldEZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBbaW5wdXQsIGtleV0gPSB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5zcGxpdCgnLicpO1xuICAgICAgICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh0aGlzW2lucHV0XVtrZXldLCByZXNldEZpcnN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGFueXRoaW5nIGVsc2UgaGFzIGNoYW5nZWQsIHJlLXJlbmRlciB0aGUgZW50aXJlIGZvcm1cbiAgICAgIH0gZWxzZSBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVGb3JtKCk7XG4gICAgICAgIGlmICh0aGlzLm9uQ2hhbmdlKSB7IHRoaXMub25DaGFuZ2UodGhpcy5qc2YuZm9ybVZhbHVlcyk7IH1cbiAgICAgICAgaWYgKHRoaXMub25Ub3VjaGVkKSB7IHRoaXMub25Ub3VjaGVkKHRoaXMuanNmLmZvcm1WYWx1ZXMpOyB9XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSBwcmV2aW91cyBpbnB1dHNcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucHJldmlvdXNJbnB1dHMpXG4gICAgICAgIC5maWx0ZXIoaW5wdXQgPT4gdGhpcy5wcmV2aW91c0lucHV0c1tpbnB1dF0gIT09IHRoaXNbaW5wdXRdKVxuICAgICAgICAuZm9yRWFjaChpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSA9IHRoaXNbaW5wdXRdKTtcbiAgICB9XG4gIH1cblxuICBzZXRGb3JtVmFsdWVzKGZvcm1WYWx1ZXM6IGFueSwgcmVzZXRGaXJzdCA9IHRydWUpIHtcbiAgICBpZiAoZm9ybVZhbHVlcykge1xuICAgICAgY29uc3QgbmV3Rm9ybVZhbHVlcyA9IHRoaXMub2JqZWN0V3JhcCA/IGZvcm1WYWx1ZXNbJzEnXSA6IGZvcm1WYWx1ZXM7XG4gICAgICBpZiAoIXRoaXMuanNmLmZvcm1Hcm91cCkge1xuICAgICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gZm9ybVZhbHVlcztcbiAgICAgICAgdGhpcy5hY3RpdmF0ZUZvcm0oKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzZXRGaXJzdCkge1xuICAgICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucmVzZXQoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmpzZi5mb3JtR3JvdXApIHtcbiAgICAgICAgdGhpcy5qc2YuZm9ybUdyb3VwLnBhdGNoVmFsdWUobmV3Rm9ybVZhbHVlcyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vbkNoYW5nZSkgeyB0aGlzLm9uQ2hhbmdlKG5ld0Zvcm1WYWx1ZXMpOyB9XG4gICAgICBpZiAodGhpcy5vblRvdWNoZWQpIHsgdGhpcy5vblRvdWNoZWQobmV3Rm9ybVZhbHVlcyk7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5qc2YuZm9ybUdyb3VwLnJlc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgc3VibWl0Rm9ybSgpIHtcbiAgICBjb25zdCB2YWxpZERhdGEgPSB0aGlzLmpzZi52YWxpZERhdGE7XG4gICAgdGhpcy5vblN1Ym1pdC5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IHZhbGlkRGF0YVsnMSddIDogdmFsaWREYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZUZvcm0nIGZ1bmN0aW9uXG4gICAqXG4gICAqIC0gVXBkYXRlICdzY2hlbWEnLCAnbGF5b3V0JywgYW5kICdmb3JtVmFsdWVzJywgZnJvbSBpbnB1dHMuXG4gICAqXG4gICAqIC0gQ3JlYXRlICdzY2hlbWFSZWZMaWJyYXJ5JyBhbmQgJ3NjaGVtYVJlY3Vyc2l2ZVJlZk1hcCdcbiAgICogICB0byByZXNvbHZlIHNjaGVtYSAkcmVmIGxpbmtzLCBpbmNsdWRpbmcgcmVjdXJzaXZlICRyZWYgbGlua3MuXG4gICAqXG4gICAqIC0gQ3JlYXRlICdkYXRhUmVjdXJzaXZlUmVmTWFwJyB0byByZXNvbHZlIHJlY3Vyc2l2ZSBsaW5rcyBpbiBkYXRhXG4gICAqICAgYW5kIGNvcmVjdGx5IHNldCBvdXRwdXQgZm9ybWF0cyBmb3IgcmVjdXJzaXZlbHkgbmVzdGVkIHZhbHVlcy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2xheW91dFJlZkxpYnJhcnknIGFuZCAndGVtcGxhdGVSZWZMaWJyYXJ5JyB0byBzdG9yZVxuICAgKiAgIG5ldyBsYXlvdXQgbm9kZXMgYW5kIGZvcm1Hcm91cCBlbGVtZW50cyB0byB1c2Ugd2hlbiBkeW5hbWljYWxseVxuICAgKiAgIGFkZGluZyBmb3JtIGNvbXBvbmVudHMgdG8gYXJyYXlzIGFuZCByZWN1cnNpdmUgJHJlZiBwb2ludHMuXG4gICAqXG4gICAqIC0gQ3JlYXRlICdkYXRhTWFwJyB0byBtYXAgdGhlIGRhdGEgdG8gdGhlIHNjaGVtYSBhbmQgdGVtcGxhdGUuXG4gICAqXG4gICAqIC0gQ3JlYXRlIHRoZSBtYXN0ZXIgJ2Zvcm1Hcm91cFRlbXBsYXRlJyB0aGVuIGZyb20gaXQgJ2Zvcm1Hcm91cCdcbiAgICogICB0aGUgQW5ndWxhciBmb3JtR3JvdXAgdXNlZCB0byBjb250cm9sIHRoZSByZWFjdGl2ZSBmb3JtLlxuICAgKi9cbiAgaW5pdGlhbGl6ZUZvcm0oKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5zY2hlbWEgfHwgdGhpcy5sYXlvdXQgfHwgdGhpcy5kYXRhIHx8IHRoaXMuZm9ybSB8fCB0aGlzLm1vZGVsIHx8XG4gICAgICB0aGlzLkpTT05TY2hlbWEgfHwgdGhpcy5VSVNjaGVtYSB8fCB0aGlzLmZvcm1EYXRhIHx8IHRoaXMubmdNb2RlbCB8fFxuICAgICAgdGhpcy5qc2YuZGF0YVxuICAgICkge1xuXG4gICAgICB0aGlzLmpzZi5yZXNldEFsbFZhbHVlcygpOyAgLy8gUmVzZXQgYWxsIGZvcm0gdmFsdWVzIHRvIGRlZmF1bHRzXG4gICAgICB0aGlzLmluaXRpYWxpemVPcHRpb25zKCk7ICAgLy8gVXBkYXRlIG9wdGlvbnNcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjaGVtYSgpOyAgICAvLyBVcGRhdGUgc2NoZW1hLCBzY2hlbWFSZWZMaWJyYXJ5LFxuICAgICAgLy8gc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCAmIGRhdGFSZWN1cnNpdmVSZWZNYXBcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZUxheW91dCgpOyAgICAvLyBVcGRhdGUgbGF5b3V0LCBsYXlvdXRSZWZMaWJyYXJ5LFxuICAgICAgdGhpcy5pbml0aWFsaXplRGF0YSgpOyAgICAgIC8vIFVwZGF0ZSBmb3JtVmFsdWVzXG4gICAgICB0aGlzLmFjdGl2YXRlRm9ybSgpOyAgICAgICAgLy8gVXBkYXRlIGRhdGFNYXAsIHRlbXBsYXRlUmVmTGlicmFyeSxcbiAgICAgIC8vIGZvcm1Hcm91cFRlbXBsYXRlLCBmb3JtR3JvdXBcblxuICAgICAgLy8gVW5jb21tZW50IGluZGl2aWR1YWwgbGluZXMgdG8gb3V0cHV0IGRlYnVnZ2luZyBpbmZvcm1hdGlvbiB0byBjb25zb2xlOlxuICAgICAgLy8gKFRoZXNlIGFsd2F5cyB3b3JrLilcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsb2FkaW5nIGZvcm0uLi4nKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzY2hlbWEnLCB0aGlzLmpzZi5zY2hlbWEpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2xheW91dCcsIHRoaXMuanNmLmxheW91dCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnb3B0aW9ucycsIHRoaXMub3B0aW9ucyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZm9ybVZhbHVlcycsIHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1Hcm91cFRlbXBsYXRlJywgdGhpcy5qc2YuZm9ybUdyb3VwVGVtcGxhdGUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1Hcm91cCcsIHRoaXMuanNmLmZvcm1Hcm91cCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZm9ybUdyb3VwLnZhbHVlJywgdGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzY2hlbWFSZWZMaWJyYXJ5JywgdGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnbGF5b3V0UmVmTGlicmFyeScsIHRoaXMuanNmLmxheW91dFJlZkxpYnJhcnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3RlbXBsYXRlUmVmTGlicmFyeScsIHRoaXMuanNmLnRlbXBsYXRlUmVmTGlicmFyeSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZGF0YU1hcCcsIHRoaXMuanNmLmRhdGFNYXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2FycmF5TWFwJywgdGhpcy5qc2YuYXJyYXlNYXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3NjaGVtYVJlY3Vyc2l2ZVJlZk1hcCcsIHRoaXMuanNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZGF0YVJlY3Vyc2l2ZVJlZk1hcCcsIHRoaXMuanNmLmRhdGFSZWN1cnNpdmVSZWZNYXApO1xuXG4gICAgICAvLyBVbmNvbW1lbnQgaW5kaXZpZHVhbCBsaW5lcyB0byBvdXRwdXQgZGVidWdnaW5nIGluZm9ybWF0aW9uIHRvIGJyb3dzZXI6XG4gICAgICAvLyAoVGhlc2Ugb25seSB3b3JrIGlmIHRoZSAnZGVidWcnIG9wdGlvbiBoYXMgYWxzbyBiZWVuIHNldCB0byAndHJ1ZScuKVxuICAgICAgaWYgKHRoaXMuZGVidWcgfHwgdGhpcy5qc2YuZm9ybU9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgY29uc3QgdmFyczogYW55W10gPSBbXTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnNjaGVtYSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5sYXlvdXQpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5vcHRpb25zKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1Hcm91cFRlbXBsYXRlKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1Hcm91cCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5zY2hlbWFSZWZMaWJyYXJ5KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmxheW91dFJlZkxpYnJhcnkpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YudGVtcGxhdGVSZWZMaWJyYXJ5KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmRhdGFNYXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuYXJyYXlNYXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmRhdGFSZWN1cnNpdmVSZWZNYXApO1xuICAgICAgICB0aGlzLmRlYnVnT3V0cHV0ID0gdmFycy5tYXAodiA9PiBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAyKSkuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmZvcm1Jbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplT3B0aW9ucycgZnVuY3Rpb25cbiAgICpcbiAgICogSW5pdGlhbGl6ZSAnb3B0aW9ucycgKGdsb2JhbCBmb3JtIG9wdGlvbnMpIGFuZCBzZXQgZnJhbWV3b3JrXG4gICAqIENvbWJpbmUgYXZhaWxhYmxlIGlucHV0czpcbiAgICogMS4gb3B0aW9ucyAtIHJlY29tbWVuZGVkXG4gICAqIDIuIGZvcm0ub3B0aW9ucyAtIFNpbmdsZSBpbnB1dCBzdHlsZVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3B0aW9ucygpIHtcbiAgICBpZiAodGhpcy5sYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlICE9PSB0aGlzLmpzZi5sYW5ndWFnZSkge1xuICAgICAgdGhpcy5qc2Yuc2V0TGFuZ3VhZ2UodGhpcy5sYW5ndWFnZSk7XG4gICAgfVxuICAgIHRoaXMuanNmLnNldE9wdGlvbnMoeyBkZWJ1ZzogISF0aGlzLmRlYnVnIH0pO1xuICAgIGxldCBsb2FkRXh0ZXJuYWxBc3NldHM6IGJvb2xlYW4gPSB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyB8fCBmYWxzZTtcbiAgICBsZXQgZnJhbWV3b3JrOiBhbnkgPSB0aGlzLmZyYW1ld29yayB8fCAnZGVmYXVsdCc7XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMub3B0aW9ucykpIHtcbiAgICAgIHRoaXMuanNmLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgIGxvYWRFeHRlcm5hbEFzc2V0cyA9IHRoaXMub3B0aW9ucy5sb2FkRXh0ZXJuYWxBc3NldHMgfHwgbG9hZEV4dGVybmFsQXNzZXRzO1xuICAgICAgZnJhbWV3b3JrID0gdGhpcy5vcHRpb25zLmZyYW1ld29yayB8fCBmcmFtZXdvcms7XG4gICAgfVxuICAgIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5vcHRpb25zKSkge1xuICAgICAgdGhpcy5qc2Yuc2V0T3B0aW9ucyh0aGlzLmZvcm0ub3B0aW9ucyk7XG4gICAgICBsb2FkRXh0ZXJuYWxBc3NldHMgPSB0aGlzLmZvcm0ub3B0aW9ucy5sb2FkRXh0ZXJuYWxBc3NldHMgfHwgbG9hZEV4dGVybmFsQXNzZXRzO1xuICAgICAgZnJhbWV3b3JrID0gdGhpcy5mb3JtLm9wdGlvbnMuZnJhbWV3b3JrIHx8IGZyYW1ld29yaztcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMud2lkZ2V0cykpIHtcbiAgICAgIHRoaXMuanNmLnNldE9wdGlvbnMoeyB3aWRnZXRzOiB0aGlzLndpZGdldHMgfSk7XG4gICAgfVxuICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeS5zZXRMb2FkRXh0ZXJuYWxBc3NldHMobG9hZEV4dGVybmFsQXNzZXRzKTtcbiAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkuc2V0RnJhbWV3b3JrKGZyYW1ld29yayk7XG4gICAgdGhpcy5qc2YuZnJhbWV3b3JrID0gdGhpcy5mcmFtZXdvcmtMaWJyYXJ5LmdldEZyYW1ld29yaygpO1xuICAgIGlmIChpc09iamVjdCh0aGlzLmpzZi5mb3JtT3B0aW9ucy53aWRnZXRzKSkge1xuICAgICAgZm9yIChjb25zdCB3aWRnZXQgb2YgT2JqZWN0LmtleXModGhpcy5qc2YuZm9ybU9wdGlvbnMud2lkZ2V0cykpIHtcbiAgICAgICAgdGhpcy53aWRnZXRMaWJyYXJ5LnJlZ2lzdGVyV2lkZ2V0KHdpZGdldCwgdGhpcy5qc2YuZm9ybU9wdGlvbnMud2lkZ2V0c1t3aWRnZXRdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkgJiYgaXNPYmplY3QodGhpcy5mb3JtLnRwbGRhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRUcGxkYXRhKHRoaXMuZm9ybS50cGxkYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVTY2hlbWEnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ3NjaGVtYSdcbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBpbnB1dDpcbiAgICogMS4gc2NoZW1hIC0gcmVjb21tZW5kZWQgLyBBbmd1bGFyIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDIuIGZvcm0uc2NoZW1hIC0gU2luZ2xlIGlucHV0IC8gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDMuIEpTT05TY2hlbWEgLSBSZWFjdCBKU09OIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0uSlNPTlNjaGVtYSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBpbnB1dCBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiA1LiBmb3JtIC0gRm9yIHRlc3Rpbmcgc2luZ2xlIHNjaGVtYS1vbmx5IGlucHV0c1xuICAgKlxuICAgKiAuLi4gaWYgbm8gc2NoZW1hIGlucHV0IGZvdW5kLCB0aGUgJ2FjdGl2YXRlRm9ybScgZnVuY3Rpb24sIGJlbG93LFxuICAgKiAgICAgd2lsbCBtYWtlIHR3byBhZGRpdGlvbmFsIGF0dGVtcHRzIHRvIGJ1aWxkIGEgc2NoZW1hXG4gICAqIDYuIElmIGxheW91dCBpbnB1dCAtIGJ1aWxkIHNjaGVtYSBmcm9tIGxheW91dFxuICAgKiA3LiBJZiBkYXRhIGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplU2NoZW1hKCkge1xuXG4gICAgLy8gVE9ETzogdXBkYXRlIHRvIGFsbG93IG5vbi1vYmplY3Qgc2NoZW1hc1xuXG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuc2NoZW1hKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLnNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnc2NoZW1hJykgJiYgaXNPYmplY3QodGhpcy5mb3JtLnNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLmZvcm0uc2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuSlNPTlNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLkpTT05TY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ0pTT05TY2hlbWEnKSAmJiBpc09iamVjdCh0aGlzLmZvcm0uSlNPTlNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLmZvcm0uSlNPTlNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAncHJvcGVydGllcycpICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5wcm9wZXJ0aWVzKSkge1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY2xvbmVEZWVwKHRoaXMuZm9ybSk7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLmZvcm0pKSB7XG4gICAgICAvLyBUT0RPOiBIYW5kbGUgb3RoZXIgdHlwZXMgb2YgZm9ybSBpbnB1dFxuICAgIH1cblxuICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5zY2hlbWEpKSB7XG5cbiAgICAgIC8vIElmIG90aGVyIHR5cGVzIGFsc28gYWxsb3dlZCwgcmVuZGVyIHNjaGVtYSBhcyBhbiBvYmplY3RcbiAgICAgIGlmIChpbkFycmF5KCdvYmplY3QnLCB0aGlzLmpzZi5zY2hlbWEudHlwZSkpIHtcbiAgICAgICAgdGhpcy5qc2Yuc2NoZW1hLnR5cGUgPSAnb2JqZWN0JztcbiAgICAgIH1cblxuICAgICAgLy8gV3JhcCBub24tb2JqZWN0IHNjaGVtYXMgaW4gb2JqZWN0LlxuICAgICAgaWYgKGhhc093bih0aGlzLmpzZi5zY2hlbWEsICd0eXBlJykgJiYgdGhpcy5qc2Yuc2NoZW1hLnR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuanNmLnNjaGVtYSA9IHtcbiAgICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxuICAgICAgICAgICdwcm9wZXJ0aWVzJzogeyAxOiB0aGlzLmpzZi5zY2hlbWEgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9iamVjdFdyYXAgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghaGFzT3duKHRoaXMuanNmLnNjaGVtYSwgJ3R5cGUnKSkge1xuXG4gICAgICAgIC8vIEFkZCB0eXBlID0gJ29iamVjdCcgaWYgbWlzc2luZ1xuICAgICAgICBpZiAoaXNPYmplY3QodGhpcy5qc2Yuc2NoZW1hLnByb3BlcnRpZXMpIHx8XG4gICAgICAgICAgaXNPYmplY3QodGhpcy5qc2Yuc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzKSB8fFxuICAgICAgICAgIGlzT2JqZWN0KHRoaXMuanNmLnNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcylcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5qc2Yuc2NoZW1hLnR5cGUgPSAnb2JqZWN0JztcblxuICAgICAgICAgIC8vIEZpeCBKU09OIHNjaGVtYSBzaG9ydGhhbmQgKEpTT04gRm9ybSBzdHlsZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmpzZi5Kc29uRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuanNmLnNjaGVtYSA9IHtcbiAgICAgICAgICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgICAgICAgICAncHJvcGVydGllcyc6IHRoaXMuanNmLnNjaGVtYVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbmVlZGVkLCB1cGRhdGUgSlNPTiBTY2hlbWEgdG8gZHJhZnQgNiBmb3JtYXQsIGluY2x1ZGluZ1xuICAgICAgLy8gZHJhZnQgMyAoSlNPTiBGb3JtIHN0eWxlKSBhbmQgZHJhZnQgNCAoQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZSlcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNvbnZlcnRTY2hlbWFUb0RyYWZ0Nih0aGlzLmpzZi5zY2hlbWEpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIGFqdiBhbmQgY29tcGlsZSBzY2hlbWFcbiAgICAgIHRoaXMuanNmLmNvbXBpbGVBanZTY2hlbWEoKTtcblxuICAgICAgLy8gQ3JlYXRlIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgZGF0YVJlY3Vyc2l2ZVJlZk1hcCwgJiBhcnJheU1hcFxuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMoXG4gICAgICAgIHRoaXMuanNmLnNjaGVtYSwgdGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSwgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLFxuICAgICAgICB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCB0aGlzLmpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGlmIChoYXNPd24odGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSwgJycpKSB7XG4gICAgICAgIHRoaXMuanNmLmhhc1Jvb3RSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiAoPykgUmVzb2x2ZSBleHRlcm5hbCAkcmVmIGxpbmtzXG4gICAgICAvLyAvLyBDcmVhdGUgc2NoZW1hUmVmTGlicmFyeSAmIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcFxuICAgICAgLy8gdGhpcy5wYXJzZXIuYnVuZGxlKHRoaXMuc2NoZW1hKVxuICAgICAgLy8gICAudGhlbihzY2hlbWEgPT4gdGhpcy5zY2hlbWEgPSByZXNvbHZlU2NoZW1hUmVmZXJlbmNlcyhcbiAgICAgIC8vICAgICBzY2hlbWEsIHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnksXG4gICAgICAvLyAgICAgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwXG4gICAgICAvLyAgICkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZURhdGEnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2Zvcm1WYWx1ZXMnXG4gICAqIGRlZnVsYXQgb3IgcHJldmlvdXNseSBzdWJtaXR0ZWQgdmFsdWVzIHVzZWQgdG8gcG9wdWxhdGUgZm9ybVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBkYXRhIC0gcmVjb21tZW5kZWRcbiAgICogMi4gbW9kZWwgLSBBbmd1bGFyIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDMuIGZvcm0udmFsdWUgLSBKU09OIEZvcm0gc3R5bGVcbiAgICogNC4gZm9ybS5kYXRhIC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIGZvcm1EYXRhIC0gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiA2LiBmb3JtLmZvcm1EYXRhIC0gRm9yIGVhc2llciB0ZXN0aW5nIG9mIFJlYWN0IEpTT04gU2NoZW1hIEZvcm1zXG4gICAqIDcuIChub25lKSBubyBkYXRhIC0gaW5pdGlhbGl6ZSBkYXRhIGZyb20gc2NoZW1hIGFuZCBsYXlvdXQgZGVmYXVsdHMgb25seVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplRGF0YSgpIHtcbiAgICBpZiAoaGFzVmFsdWUodGhpcy5kYXRhKSkge1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLmRhdGEpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZGF0YSc7XG4gICAgfSBlbHNlIGlmIChoYXNWYWx1ZSh0aGlzLm1vZGVsKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5tb2RlbCk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdtb2RlbCc7XG4gICAgfSBlbHNlIGlmIChoYXNWYWx1ZSh0aGlzLm5nTW9kZWwpKSB7XG4gICAgICB0aGlzLmpzZi5Bbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLm5nTW9kZWwpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbmdNb2RlbCc7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGhhc1ZhbHVlKHRoaXMuZm9ybS52YWx1ZSkpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMuZm9ybS52YWx1ZSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdmb3JtLnZhbHVlJztcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkgJiYgaGFzVmFsdWUodGhpcy5mb3JtLmRhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5kYXRhKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm0uZGF0YSc7XG4gICAgfSBlbHNlIGlmIChoYXNWYWx1ZSh0aGlzLmZvcm1EYXRhKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybURhdGEnO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ2Zvcm1EYXRhJykgJiYgaGFzVmFsdWUodGhpcy5mb3JtLmZvcm1EYXRhKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLmZvcm0uZm9ybURhdGEpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybS5mb3JtRGF0YSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVMYXlvdXQnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2xheW91dCdcbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBhcnJheSBpbnB1dDpcbiAgICogMS4gbGF5b3V0IC0gcmVjb21tZW5kZWRcbiAgICogMi4gZm9ybSAtIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMy4gZm9ybS5mb3JtIC0gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0ubGF5b3V0IC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIChub25lKSBubyBsYXlvdXQgLSBzZXQgZGVmYXVsdCBsYXlvdXQgaW5zdGVhZFxuICAgKiAgICAoZnVsbCBsYXlvdXQgd2lsbCBiZSBidWlsdCBsYXRlciBmcm9tIHRoZSBzY2hlbWEpXG4gICAqXG4gICAqIEFsc28sIGlmIGFsdGVybmF0ZSBsYXlvdXQgZm9ybWF0cyBhcmUgYXZhaWxhYmxlLFxuICAgKiBpbXBvcnQgZnJvbSAnVUlTY2hlbWEnIG9yICdjdXN0b21Gb3JtSXRlbXMnXG4gICAqIHVzZWQgZm9yIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gYW5kIEpTT04gRm9ybSBBUEkgY29tcGF0aWJpbGl0eVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBVSVNjaGVtYSAtIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMi4gZm9ybS5VSVNjaGVtYSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBpbnB1dCBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiAyLiBmb3JtLmN1c3RvbUZvcm1JdGVtcyAtIEpTT04gRm9ybSBzdHlsZVxuICAgKiAzLiAobm9uZSkgbm8gaW5wdXQgLSBkb24ndCBpbXBvcnRcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUxheW91dCgpIHtcblxuICAgIC8vIFJlbmFtZSBKU09OIEZvcm0tc3R5bGUgJ29wdGlvbnMnIGxpc3RzIHRvXG4gICAgLy8gQW5ndWxhciBTY2hlbWEgRm9ybS1zdHlsZSAndGl0bGVNYXAnIGxpc3RzLlxuICAgIGNvbnN0IGZpeEpzb25Gb3JtT3B0aW9ucyA9IChsYXlvdXQ6IGFueSk6IGFueSA9PiB7XG4gICAgICBpZiAoaXNPYmplY3QobGF5b3V0KSB8fCBpc0FycmF5KGxheW91dCkpIHtcbiAgICAgICAgZm9yRWFjaChsYXlvdXQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bih2YWx1ZSwgJ29wdGlvbnMnKSAmJiBpc09iamVjdCh2YWx1ZS5vcHRpb25zKSkge1xuICAgICAgICAgICAgdmFsdWUudGl0bGVNYXAgPSB2YWx1ZS5vcHRpb25zO1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlLm9wdGlvbnM7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAndG9wLWRvd24nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYXlvdXQ7XG4gICAgfTtcblxuICAgIC8vIENoZWNrIGZvciBsYXlvdXQgaW5wdXRzIGFuZCwgaWYgZm91bmQsIGluaXRpYWxpemUgZm9ybSBsYXlvdXRcbiAgICBpZiAoaXNBcnJheSh0aGlzLmxheW91dCkpIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGNsb25lRGVlcCh0aGlzLmxheW91dCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuZm9ybSkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5mb3JtKSkge1xuICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGZpeEpzb25Gb3JtT3B0aW9ucyhjbG9uZURlZXAodGhpcy5mb3JtLmZvcm0pKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5sYXlvdXQpKSB7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtLmxheW91dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IFsnKiddO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBhbHRlcm5hdGUgbGF5b3V0IGlucHV0c1xuICAgIGxldCBhbHRlcm5hdGVMYXlvdXQ6IGFueSA9IG51bGw7XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuVUlTY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBjbG9uZURlZXAodGhpcy5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnVUlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAndWlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMuZm9ybS51aVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnY3VzdG9tRm9ybUl0ZW1zJykpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBmaXhKc29uRm9ybU9wdGlvbnMoY2xvbmVEZWVwKHRoaXMuZm9ybS5jdXN0b21Gb3JtSXRlbXMpKTtcbiAgICB9XG5cbiAgICAvLyBpZiBhbHRlcm5hdGUgbGF5b3V0IGZvdW5kLCBjb3B5IGFsdGVybmF0ZSBsYXlvdXQgb3B0aW9ucyBpbnRvIHNjaGVtYVxuICAgIGlmIChhbHRlcm5hdGVMYXlvdXQpIHtcbiAgICAgIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKGFsdGVybmF0ZUxheW91dCwgKHZhbHVlLCBwb2ludGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjaGVtYVBvaW50ZXIgPSBwb2ludGVyXG4gICAgICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnL3Byb3BlcnRpZXMvJylcbiAgICAgICAgICAucmVwbGFjZSgvXFwvcHJvcGVydGllc1xcL2l0ZW1zXFwvcHJvcGVydGllc1xcLy9nLCAnL2l0ZW1zL3Byb3BlcnRpZXMvJylcbiAgICAgICAgICAucmVwbGFjZSgvXFwvcHJvcGVydGllc1xcL3RpdGxlTWFwXFwvcHJvcGVydGllc1xcLy9nLCAnL3RpdGxlTWFwL3Byb3BlcnRpZXMvJyk7XG4gICAgICAgIGlmIChoYXNWYWx1ZSh2YWx1ZSkgJiYgaGFzVmFsdWUocG9pbnRlcikpIHtcbiAgICAgICAgICBsZXQga2V5ID0gSnNvblBvaW50ZXIudG9LZXkocG9pbnRlcik7XG4gICAgICAgICAgY29uc3QgZ3JvdXBQb2ludGVyID0gKEpzb25Qb2ludGVyLnBhcnNlKHNjaGVtYVBvaW50ZXIpIHx8IFtdKS5zbGljZSgwLCAtMik7XG4gICAgICAgICAgbGV0IGl0ZW1Qb2ludGVyOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAgICAgICAgIC8vIElmICd1aTpvcmRlcicgb2JqZWN0IGZvdW5kLCBjb3B5IGludG8gb2JqZWN0IHNjaGVtYSByb290XG4gICAgICAgICAgaWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSAndWk6b3JkZXInKSB7XG4gICAgICAgICAgICBpdGVtUG9pbnRlciA9IFsuLi5ncm91cFBvaW50ZXIsICd1aTpvcmRlciddO1xuXG4gICAgICAgICAgICAvLyBDb3B5IG90aGVyIGFsdGVybmF0ZSBsYXlvdXQgb3B0aW9ucyB0byBzY2hlbWEgJ3gtc2NoZW1hLWZvcm0nLFxuICAgICAgICAgICAgLy8gKGxpa2UgQW5ndWxhciBTY2hlbWEgRm9ybSBvcHRpb25zKSBhbmQgcmVtb3ZlIGFueSAndWk6JyBwcmVmaXhlc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5LnNsaWNlKDAsIDMpLnRvTG93ZXJDYXNlKCkgPT09ICd1aTonKSB7IGtleSA9IGtleS5zbGljZSgzKTsgfVxuICAgICAgICAgICAgaXRlbVBvaW50ZXIgPSBbLi4uZ3JvdXBQb2ludGVyLCAneC1zY2hlbWEtZm9ybScsIGtleV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChKc29uUG9pbnRlci5oYXModGhpcy5qc2Yuc2NoZW1hLCBncm91cFBvaW50ZXIpICYmXG4gICAgICAgICAgICAhSnNvblBvaW50ZXIuaGFzKHRoaXMuanNmLnNjaGVtYSwgaXRlbVBvaW50ZXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQodGhpcy5qc2Yuc2NoZW1hLCBpdGVtUG9pbnRlciwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdhY3RpdmF0ZUZvcm0nIGZ1bmN0aW9uXG4gICAqXG4gICAqIC4uLmNvbnRpbnVlZCBmcm9tICdpbml0aWFsaXplU2NoZW1hJyBmdW5jdGlvbiwgYWJvdmVcbiAgICogSWYgJ3NjaGVtYScgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIChpLmUuIG5vIHNjaGVtYSBpbnB1dCBmb3VuZClcbiAgICogNi4gSWYgbGF5b3V0IGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0IGlucHV0XG4gICAqIDcuIElmIGRhdGEgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBkYXRhIGlucHV0XG4gICAqXG4gICAqIENyZWF0ZSBmaW5hbCBsYXlvdXQsXG4gICAqIGJ1aWxkIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGUgYW5kIHRoZSBBbmd1bGFyIEZvcm1Hcm91cCxcbiAgICogc3Vic2NyaWJlIHRvIGNoYW5nZXMsXG4gICAqIGFuZCBhY3RpdmF0ZSB0aGUgZm9ybS5cbiAgICovXG4gIHByaXZhdGUgYWN0aXZhdGVGb3JtKCkge1xuXG4gICAgLy8gSWYgJ3NjaGVtYScgbm90IGluaXRpYWxpemVkXG4gICAgaWYgKGlzRW1wdHkodGhpcy5qc2Yuc2NoZW1hKSkge1xuXG4gICAgICAvLyBUT0RPOiBJZiBmdWxsIGxheW91dCBpbnB1dCAod2l0aCBubyAnKicpLCBidWlsZCBzY2hlbWEgZnJvbSBsYXlvdXRcbiAgICAgIC8vIGlmICghdGhpcy5qc2YubGF5b3V0LmluY2x1ZGVzKCcqJykpIHtcbiAgICAgIC8vICAgdGhpcy5qc2YuYnVpbGRTY2hlbWFGcm9tTGF5b3V0KCk7XG4gICAgICAvLyB9IGVsc2VcblxuICAgICAgLy8gSWYgZGF0YSBpbnB1dCwgYnVpbGQgc2NoZW1hIGZyb20gZGF0YVxuICAgICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLmZvcm1WYWx1ZXMpKSB7XG4gICAgICAgIHRoaXMuanNmLmJ1aWxkU2NoZW1hRnJvbURhdGEoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzRW1wdHkodGhpcy5qc2Yuc2NoZW1hKSkge1xuXG4gICAgICAvLyBJZiBub3QgYWxyZWFkeSBpbml0aWFsaXplZCwgaW5pdGlhbGl6ZSBhanYgYW5kIGNvbXBpbGUgc2NoZW1hXG4gICAgICB0aGlzLmpzZi5jb21waWxlQWp2U2NoZW1hKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBhbGwgbGF5b3V0IGVsZW1lbnRzLCBhZGQgdmFsdWVzLCB3aWRnZXRzLCBhbmQgdmFsaWRhdG9ycyxcbiAgICAgIC8vIHJlcGxhY2UgYW55ICcqJyB3aXRoIGEgbGF5b3V0IGJ1aWx0IGZyb20gYWxsIHNjaGVtYSBlbGVtZW50cyxcbiAgICAgIC8vIGFuZCB1cGRhdGUgdGhlIEZvcm1Hcm91cCB0ZW1wbGF0ZSB3aXRoIGFueSBuZXcgdmFsaWRhdG9yc1xuICAgICAgdGhpcy5qc2YuYnVpbGRMYXlvdXQodGhpcy53aWRnZXRMaWJyYXJ5KTtcblxuICAgICAgLy8gQnVpbGQgdGhlIEFuZ3VsYXIgRm9ybUdyb3VwIHRlbXBsYXRlIGZyb20gdGhlIHNjaGVtYVxuICAgICAgdGhpcy5qc2YuYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZSh0aGlzLmpzZi5mb3JtVmFsdWVzKTtcblxuICAgICAgLy8gQnVpbGQgdGhlIHJlYWwgQW5ndWxhciBGb3JtR3JvdXAgZnJvbSB0aGUgRm9ybUdyb3VwIHRlbXBsYXRlXG4gICAgICB0aGlzLmpzZi5idWlsZEZvcm1Hcm91cCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmpzZi5mb3JtR3JvdXApIHtcblxuICAgICAgLy8gUmVzZXQgaW5pdGlhbCBmb3JtIHZhbHVlc1xuICAgICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLmZvcm1WYWx1ZXMpICYmXG4gICAgICAgIHRoaXMuanNmLmZvcm1PcHRpb25zLnNldFNjaGVtYURlZmF1bHRzICE9PSB0cnVlICYmXG4gICAgICAgIHRoaXMuanNmLmZvcm1PcHRpb25zLnNldExheW91dERlZmF1bHRzICE9PSB0cnVlXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IGhvdyB0byBkaXNwbGF5IGNhbGN1bGF0ZWQgdmFsdWVzIHdpdGhvdXQgY2hhbmdpbmcgb2JqZWN0IGRhdGFcbiAgICAgIC8vIFNlZSBodHRwOi8vdWxpb24uZ2l0aHViLmlvL2pzb25mb3JtL3BsYXlncm91bmQvP2V4YW1wbGU9dGVtcGxhdGluZy12YWx1ZXNcbiAgICAgIC8vIENhbGN1bGF0ZSByZWZlcmVuY2VzIHRvIG90aGVyIGZpZWxkc1xuICAgICAgLy8gaWYgKCFpc0VtcHR5KHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSkpIHtcbiAgICAgIC8vICAgZm9yRWFjaCh0aGlzLmpzZi5mb3JtR3JvdXAudmFsdWUsICh2YWx1ZSwga2V5LCBvYmplY3QsIHJvb3RPYmplY3QpID0+IHtcbiAgICAgIC8vICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gICAgICAgb2JqZWN0W2tleV0gPSB0aGlzLmpzZi5wYXJzZVRleHQodmFsdWUsIHZhbHVlLCByb290T2JqZWN0LCBrZXkpO1xuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSwgJ3RvcC1kb3duJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBmb3JtIGNoYW5nZXMgdG8gb3V0cHV0IGxpdmUgZGF0YSwgdmFsaWRhdGlvbiwgYW5kIGVycm9yc1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmpzZi5kYXRhQ2hhbmdlcy5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgIHRoaXMub25DaGFuZ2VzLmVtaXQodGhpcy5vYmplY3RXcmFwID8gZGF0YVsnMSddIDogZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZXNJbnB1dCAmJiB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpc1tgJHt0aGlzLmZvcm1WYWx1ZXNJbnB1dH1DaGFuZ2VgXS5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IGRhdGFbJzEnXSA6IGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG5cbiAgICAgIC8vIFRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbiBvbiBzdGF0dXNDaGFuZ2VzIHRvIHNob3cgdXBkYXRlZCBlcnJvcnNcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5qc2YuZm9ybUdyb3VwLnN0YXR1c0NoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCkpKTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5qc2YuaXNWYWxpZENoYW5nZXMuc3Vic2NyaWJlKGlzVmFsaWQgPT4gdGhpcy5pc1ZhbGlkLmVtaXQoaXNWYWxpZCkpKTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5qc2YudmFsaWRhdGlvbkVycm9yQ2hhbmdlcy5zdWJzY3JpYmUoZXJyID0+IHRoaXMudmFsaWRhdGlvbkVycm9ycy5lbWl0KGVycikpKTtcblxuICAgICAgLy8gT3V0cHV0IGZpbmFsIHNjaGVtYSwgZmluYWwgbGF5b3V0LCBhbmQgaW5pdGlhbCBkYXRhXG4gICAgICB0aGlzLmZvcm1TY2hlbWEuZW1pdCh0aGlzLmpzZi5zY2hlbWEpO1xuICAgICAgdGhpcy5mb3JtTGF5b3V0LmVtaXQodGhpcy5qc2YubGF5b3V0KTtcbiAgICAgIHRoaXMub25DaGFuZ2VzLmVtaXQodGhpcy5vYmplY3RXcmFwID8gdGhpcy5qc2YuZGF0YVsnMSddIDogdGhpcy5qc2YuZGF0YSk7XG5cbiAgICAgIC8vIElmIHZhbGlkYXRlT25SZW5kZXIsIG91dHB1dCBpbml0aWFsIHZhbGlkYXRpb24gYW5kIGFueSBlcnJvcnNcbiAgICAgIGNvbnN0IHZhbGlkYXRlT25SZW5kZXIgPVxuICAgICAgICBKc29uUG9pbnRlci5nZXQodGhpcy5qc2YsICcvZm9ybU9wdGlvbnMvdmFsaWRhdGVPblJlbmRlcicpO1xuICAgICAgaWYgKHZhbGlkYXRlT25SZW5kZXIpIHsgLy8gdmFsaWRhdGVPblJlbmRlciA9PT0gJ2F1dG8nIHx8IHRydWVcbiAgICAgICAgY29uc3QgdG91Y2hBbGwgPSAoY29udHJvbCkgPT4ge1xuICAgICAgICAgIGlmICh2YWxpZGF0ZU9uUmVuZGVyID09PSB0cnVlIHx8IGhhc1ZhbHVlKGNvbnRyb2wudmFsdWUpKSB7XG4gICAgICAgICAgICBjb250cm9sLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgT2JqZWN0LmtleXMoY29udHJvbC5jb250cm9scyB8fCB7fSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGtleSA9PiB0b3VjaEFsbChjb250cm9sLmNvbnRyb2xzW2tleV0pKTtcbiAgICAgICAgfTtcbiAgICAgICAgdG91Y2hBbGwodGhpcy5qc2YuZm9ybUdyb3VwKTtcbiAgICAgICAgdGhpcy5pc1ZhbGlkLmVtaXQodGhpcy5qc2YuaXNWYWxpZCk7XG4gICAgICAgIHRoaXMudmFsaWRhdGlvbkVycm9ycy5lbWl0KHRoaXMuanNmLmFqdkVycm9ycyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=