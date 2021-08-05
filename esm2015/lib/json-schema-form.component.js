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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL2hvbWUvZG5pbW9uL0RvY3VtZW50cy9naXQvY29udmVwYXkvYWpzZi9wcm9qZWN0cy9hanNmLWNvcmUvc3JjLyIsInNvdXJjZXMiOlsibGliL2pzb24tc2NoZW1hLWZvcm0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBRXJDLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osS0FBSyxFQUdMLE1BQU0sRUFFTixTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDbkYsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUN4RixPQUFPLEVBQ0wsUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDVCxNQUFNLDhCQUE4QixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM3RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN6RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBR3BDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQ0c7QUFPSCxNQUFNLE9BQU8sdUJBQXVCO0lBMkVsQyxZQUNVLGNB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TCxLQUFLO3VCQUNMLEtBQUs7c0JBRUwsS0FBSzt1QkFFTCxLQUFLO2lDQUdMLEtBQUs7b0JBQ0wsS0FBSztvQkFFTCxLQUFLO3dCQVNMLE1BQU07dUJBQ04sTUFBTTtzQkFDTixNQUFNOytCQUNOLE1BQU07eUJBQ04sTUFBTTt5QkFDTixNQUFNO3lCQU1OLE1BQU07MEJBQ04sTUFBTTs2QkFDTixNQUFNOzRCQUNOLE1BQU07eUJBS04sU0FBUyxTQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnO1xuaW1wb3J0IGlzRXF1YWwgZnJvbSAnbG9kYXNoL2lzRXF1YWwnO1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBjb252ZXJ0U2NoZW1hVG9EcmFmdDYgfSBmcm9tICcuL3NoYXJlZC9jb252ZXJ0LXNjaGVtYS10by1kcmFmdDYuZnVuY3Rpb24nO1xuaW1wb3J0IHsgZm9yRWFjaCwgaGFzT3duIH0gZnJvbSAnLi9zaGFyZWQvdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UgfSBmcm9tICcuL2ZyYW1ld29yay1saWJyYXJ5L2ZyYW1ld29yay1saWJyYXJ5LnNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgaGFzVmFsdWUsXG4gIGluQXJyYXksXG4gIGlzQXJyYXksXG4gIGlzRW1wdHksXG4gIGlzT2JqZWN0XG59IGZyb20gJy4vc2hhcmVkL3ZhbGlkYXRvci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSnNvblBvaW50ZXIgfSBmcm9tICcuL3NoYXJlZC9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuaW1wb3J0IHsgcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMgfSBmcm9tICcuL3NoYXJlZC9qc29uLXNjaGVtYS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgV2lkZ2V0TGlicmFyeVNlcnZpY2UgfSBmcm9tICcuL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cblxuLyoqXG4gKiBAbW9kdWxlICdKc29uU2NoZW1hRm9ybUNvbXBvbmVudCcgLSBBbmd1bGFyIEpTT04gU2NoZW1hIEZvcm1cbiAqXG4gKiBSb290IG1vZHVsZSBvZiB0aGUgQW5ndWxhciBKU09OIFNjaGVtYSBGb3JtIGNsaWVudC1zaWRlIGxpYnJhcnksXG4gKiBhbiBBbmd1bGFyIGxpYnJhcnkgd2hpY2ggZ2VuZXJhdGVzIGFuIEhUTUwgZm9ybSBmcm9tIGEgSlNPTiBzY2hlbWFcbiAqIHN0cnVjdHVyZWQgZGF0YSBtb2RlbCBhbmQvb3IgYSBKU09OIFNjaGVtYSBGb3JtIGxheW91dCBkZXNjcmlwdGlvbi5cbiAqXG4gKiBUaGlzIGxpYnJhcnkgYWxzbyB2YWxpZGF0ZXMgaW5wdXQgZGF0YSBieSB0aGUgdXNlciwgdXNpbmcgYm90aCB2YWxpZGF0b3JzIG9uXG4gKiBpbmRpdmlkdWFsIGNvbnRyb2xzIHRvIHByb3ZpZGUgcmVhbC10aW1lIGZlZWRiYWNrIHdoaWxlIHRoZSB1c2VyIGlzIGZpbGxpbmdcbiAqIG91dCB0aGUgZm9ybSwgYW5kIHRoZW4gdmFsaWRhdGluZyB0aGUgZW50aXJlIGlucHV0IGFnYWluc3QgdGhlIHNjaGVtYSB3aGVuXG4gKiB0aGUgZm9ybSBpcyBzdWJtaXR0ZWQgdG8gbWFrZSBzdXJlIHRoZSByZXR1cm5lZCBKU09OIGRhdGEgb2JqZWN0IGlzIHZhbGlkLlxuICpcbiAqIFRoaXMgbGlicmFyeSBpcyBzaW1pbGFyIHRvLCBhbmQgbW9zdGx5IEFQSSBjb21wYXRpYmxlIHdpdGg6XG4gKlxuICogLSBKU09OIFNjaGVtYSBGb3JtJ3MgQW5ndWxhciBTY2hlbWEgRm9ybSBsaWJyYXJ5IGZvciBBbmd1bGFySnNcbiAqICAgaHR0cDovL3NjaGVtYWZvcm0uaW9cbiAqICAgaHR0cDovL3NjaGVtYWZvcm0uaW8vZXhhbXBsZXMvYm9vdHN0cmFwLWV4YW1wbGUuaHRtbCAoZXhhbXBsZXMpXG4gKlxuICogLSBNb3ppbGxhJ3MgcmVhY3QtanNvbnNjaGVtYS1mb3JtIGxpYnJhcnkgZm9yIFJlYWN0XG4gKiAgIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhLXNlcnZpY2VzL3JlYWN0LWpzb25zY2hlbWEtZm9ybVxuICogICBodHRwczovL21vemlsbGEtc2VydmljZXMuZ2l0aHViLmlvL3JlYWN0LWpzb25zY2hlbWEtZm9ybSAoZXhhbXBsZXMpXG4gKlxuICogLSBKb3NoZmlyZSdzIEpTT04gRm9ybSBsaWJyYXJ5IGZvciBqUXVlcnlcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL2pvc2hmaXJlL2pzb25mb3JtXG4gKiAgIGh0dHA6Ly91bGlvbi5naXRodWIuaW8vanNvbmZvcm0vcGxheWdyb3VuZCAoZXhhbXBsZXMpXG4gKlxuICogVGhpcyBsaWJyYXJ5IGRlcGVuZHMgb246XG4gKiAgLSBBbmd1bGFyIChvYnZpb3VzbHkpICAgICAgICAgICAgICAgICAgaHR0cHM6Ly9hbmd1bGFyLmlvXG4gKiAgLSBsb2Rhc2gsIEphdmFTY3JpcHQgdXRpbGl0eSBsaWJyYXJ5ICAgaHR0cHM6Ly9naXRodWIuY29tL2xvZGFzaC9sb2Rhc2hcbiAqICAtIGFqdiwgQW5vdGhlciBKU09OIFNjaGVtYSB2YWxpZGF0b3IgICBodHRwczovL2dpdGh1Yi5jb20vZXBvYmVyZXpraW4vYWp2XG4gKlxuICogSW4gYWRkaXRpb24sIHRoZSBFeGFtcGxlIFBsYXlncm91bmQgYWxzbyBkZXBlbmRzIG9uOlxuICogIC0gYnJhY2UsIEJyb3dzZXJpZmllZCBBY2UgZWRpdG9yICAgICAgIGh0dHA6Ly90aGxvcmVuei5naXRodWIuaW8vYnJhY2VcbiAqL1xuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdqc29uLXNjaGVtYS1mb3JtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2pzb24tc2NoZW1hLWZvcm0uY29tcG9uZW50Lmh0bWwnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBKc29uU2NoZW1hRm9ybUNvbXBvbmVudCBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkNoYW5nZXMsIE9uSW5pdCB7XG4gIGRlYnVnT3V0cHV0OiBhbnk7IC8vIERlYnVnIGluZm9ybWF0aW9uLCBpZiByZXF1ZXN0ZWRcbiAgZm9ybVZhbHVlU3Vic2NyaXB0aW9uOiBhbnkgPSBudWxsO1xuICBmb3JtSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgb2JqZWN0V3JhcCA9IGZhbHNlOyAvLyBJcyBub24tb2JqZWN0IGlucHV0IHNjaGVtYSB3cmFwcGVkIGluIGFuIG9iamVjdD9cbiAgc3Vic2NyaXB0aW9uczogU3Vic2NyaXB0aW9uID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuXG4gIGZvcm1WYWx1ZXNJbnB1dDogc3RyaW5nOyAvLyBOYW1lIG9mIHRoZSBpbnB1dCBwcm92aWRpbmcgdGhlIGZvcm0gZGF0YVxuICBwcmV2aW91c0lucHV0czogeyAvLyBQcmV2aW91cyBpbnB1dCB2YWx1ZXMsIHRvIGRldGVjdCB3aGljaCBpbnB1dCB0cmlnZ2VycyBvbkNoYW5nZXNcbiAgICBzY2hlbWE6IGFueSwgbGF5b3V0OiBhbnlbXSwgZGF0YTogYW55LCBvcHRpb25zOiBhbnksIGZyYW1ld29yazogYW55IHwgc3RyaW5nLFxuICAgIHdpZGdldHM6IGFueSwgZm9ybTogYW55LCBtb2RlbDogYW55LCBKU09OU2NoZW1hOiBhbnksIFVJU2NoZW1hOiBhbnksXG4gICAgZm9ybURhdGE6IGFueSwgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuLCBkZWJ1ZzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICAgIHNjaGVtYTogbnVsbCwgbGF5b3V0OiBudWxsLCBkYXRhOiBudWxsLCBvcHRpb25zOiBudWxsLCBmcmFtZXdvcms6IG51bGwsXG4gICAgICB3aWRnZXRzOiBudWxsLCBmb3JtOiBudWxsLCBtb2RlbDogbnVsbCwgSlNPTlNjaGVtYTogbnVsbCwgVUlTY2hlbWE6IG51bGwsXG4gICAgICBmb3JtRGF0YTogbnVsbCwgbG9hZEV4dGVybmFsQXNzZXRzOiBudWxsLCBkZWJ1ZzogbnVsbCxcbiAgICB9O1xuXG4gIC8vIFJlY29tbWVuZGVkIGlucHV0c1xuICBASW5wdXQoKSBzY2hlbWE6IGFueTsgLy8gVGhlIEpTT04gU2NoZW1hXG4gIEBJbnB1dCgpIGxheW91dDogYW55W107IC8vIFRoZSBmb3JtIGxheW91dFxuICBASW5wdXQoKSBkYXRhOiBhbnk7IC8vIFRoZSBmb3JtIGRhdGFcbiAgQElucHV0KCkgb3B0aW9uczogYW55OyAvLyBUaGUgZ2xvYmFsIGZvcm0gb3B0aW9uc1xuICBASW5wdXQoKSBmcmFtZXdvcms6IGFueSB8IHN0cmluZzsgLy8gVGhlIGZyYW1ld29yayB0byBsb2FkXG4gIEBJbnB1dCgpIHdpZGdldHM6IGFueTsgLy8gQW55IGN1c3RvbSB3aWRnZXRzIHRvIGxvYWRcblxuICAvLyBBbHRlcm5hdGUgY29tYmluZWQgc2luZ2xlIGlucHV0XG4gIEBJbnB1dCgpIGZvcm06IGFueTsgLy8gRm9yIHRlc3RpbmcsIGFuZCBKU09OIFNjaGVtYSBGb3JtIEFQSSBjb21wYXRpYmlsaXR5XG5cbiAgLy8gQW5ndWxhciBTY2hlbWEgRm9ybSBBUEkgY29tcGF0aWJpbGl0eSBpbnB1dFxuICBASW5wdXQoKSBtb2RlbDogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIGZvcm0gZGF0YVxuXG4gIC8vIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gQVBJIGNvbXBhdGliaWxpdHkgaW5wdXRzXG4gIEBJbnB1dCgpIEpTT05TY2hlbWE6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBKU09OIFNjaGVtYVxuICBASW5wdXQoKSBVSVNjaGVtYTogYW55OyAvLyBVSSBzY2hlbWEgLSBhbHRlcm5hdGUgZm9ybSBsYXlvdXQgZm9ybWF0XG4gIEBJbnB1dCgpIGZvcm1EYXRhOiBhbnk7IC8vIEFsdGVybmF0ZSBpbnB1dCBmb3IgZm9ybSBkYXRhXG5cbiAgQElucHV0KCkgbmdNb2RlbDogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIEFuZ3VsYXIgZm9ybXNcblxuICBASW5wdXQoKSBsYW5ndWFnZTogc3RyaW5nOyAvLyBMYW5ndWFnZVxuXG4gIC8vIERldmVsb3BtZW50IGlucHV0cywgZm9yIHRlc3RpbmcgYW5kIGRlYnVnZ2luZ1xuICBASW5wdXQoKSBsb2FkRXh0ZXJuYWxBc3NldHM6IGJvb2xlYW47IC8vIExvYWQgZXh0ZXJuYWwgZnJhbWV3b3JrIGFzc2V0cz9cbiAgQElucHV0KCkgZGVidWc6IGJvb2xlYW47IC8vIFNob3cgZGVidWcgaW5mb3JtYXRpb24/XG5cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub2JqZWN0V3JhcCA/IHRoaXMuanNmLmRhdGFbJzEnXSA6IHRoaXMuanNmLmRhdGE7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLnNldEZvcm1WYWx1ZXModmFsdWUsIGZhbHNlKTtcbiAgfVxuXG4gIC8vIE91dHB1dHNcbiAgQE91dHB1dCgpIG9uQ2hhbmdlcyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBMaXZlIHVudmFsaWRhdGVkIGludGVybmFsIGZvcm0gZGF0YVxuICBAT3V0cHV0KCkgb25TdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gQ29tcGxldGUgdmFsaWRhdGVkIGZvcm0gZGF0YVxuICBAT3V0cHV0KCkgaXNWYWxpZCA9IG5ldyBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4oKTsgLy8gSXMgY3VycmVudCBkYXRhIHZhbGlkP1xuICBAT3V0cHV0KCkgdmFsaWRhdGlvbkVycm9ycyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBWYWxpZGF0aW9uIGVycm9ycyAoaWYgYW55KVxuICBAT3V0cHV0KCkgZm9ybVNjaGVtYSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBGaW5hbCBzY2hlbWEgdXNlZCB0byBjcmVhdGUgZm9ybVxuICBAT3V0cHV0KCkgZm9ybUxheW91dCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBGaW5hbCBsYXlvdXQgdXNlZCB0byBjcmVhdGUgZm9ybVxuXG4gIC8vIE91dHB1dHMgZm9yIHBvc3NpYmxlIDItd2F5IGRhdGEgYmluZGluZ1xuICAvLyBPbmx5IHRoZSBvbmUgaW5wdXQgcHJvdmlkaW5nIHRoZSBpbml0aWFsIGZvcm0gZGF0YSB3aWxsIGJlIGJvdW5kLlxuICAvLyBJZiB0aGVyZSBpcyBubyBpbml0YWwgZGF0YSwgaW5wdXQgJ3t9JyB0byBhY3RpdmF0ZSAyLXdheSBkYXRhIGJpbmRpbmcuXG4gIC8vIFRoZXJlIGlzIG5vIDItd2F5IGJpbmRpbmcgaWYgaW5pdGFsIGRhdGEgaXMgY29tYmluZWQgaW5zaWRlIHRoZSAnZm9ybScgaW5wdXQuXG4gIEBPdXRwdXQoKSBkYXRhQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBtb2RlbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgZm9ybURhdGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIG5nTW9kZWxDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBvbkNoYW5nZTogRnVuY3Rpb247XG4gIG9uVG91Y2hlZDogRnVuY3Rpb247XG5cbiAgQFZpZXdDaGlsZCgncm9vdFdpZGdldCcpIHJvb3RXaWRnZXQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBmcmFtZXdvcmtMaWJyYXJ5OiBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICBwcml2YXRlIHdpZGdldExpYnJhcnk6IFdpZGdldExpYnJhcnlTZXJ2aWNlLFxuICAgIHB1YmxpYyBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgKSB7IH1cblxuICBwcml2YXRlIHJlc2V0U2NyaXB0c0FuZFN0eWxlU2hlZXRzKCkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hanNmJykuZm9yRWFjaChlbGVtZW50ID0+IGVsZW1lbnQucmVtb3ZlKCkpO1xuICB9XG4gIHByaXZhdGUgbG9hZFNjcmlwdHMoKSB7XG4gICAgY29uc3Qgc2NyaXB0cyA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTY3JpcHRzKCk7XG4gICAgc2NyaXB0cy5tYXAoc2NyaXB0ID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdFRhZzogSFRNTFNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHNjcmlwdFRhZy5zcmMgPSBzY3JpcHQ7XG4gICAgICBzY3JpcHRUYWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0VGFnLmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdFRhZy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2Fqc2YnKTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0VGFnKTtcbiAgICB9KTtcbiAgfVxuICBwcml2YXRlIGxvYWRTdHlsZVNoZWV0cygpIHtcbiAgICBjb25zdCBzdHlsZXNoZWV0cyA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTdHlsZXNoZWV0cygpO1xuICAgIHN0eWxlc2hlZXRzLm1hcChzdHlsZXNoZWV0ID0+IHtcbiAgICAgIGNvbnN0IGxpbmtUYWc6IEhUTUxMaW5rRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgIGxpbmtUYWcucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgICAgbGlua1RhZy5ocmVmID0gc3R5bGVzaGVldDtcbiAgICAgIGxpbmtUYWcuc2V0QXR0cmlidXRlKCdjbGFzcycsICdhanNmJyk7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGxpbmtUYWcpO1xuICAgIH0pO1xuICB9XG4gIHByaXZhdGUgbG9hZEFzc2V0cygpIHtcbiAgICB0aGlzLnJlc2V0U2NyaXB0c0FuZFN0eWxlU2hlZXRzKCk7XG4gICAgdGhpcy5sb2FkU2NyaXB0cygpO1xuICAgIHRoaXMubG9hZFN0eWxlU2hlZXRzKCk7XG4gIH1cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy51cGRhdGVGb3JtKCk7XG4gICAgdGhpcy5sb2FkQXNzZXRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICB0aGlzLnVwZGF0ZUZvcm0oKTtcbiAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGNoYW5nZXMgaW4gRnJhbWV3b3JrIHRoZW4gbG9hZCBhc3NldHMgaWYgdGhhdCdzIHRoZVxuICAgIGlmIChjaGFuZ2VzLmZyYW1ld29yaykge1xuICAgICAgaWYgKCFjaGFuZ2VzLmZyYW1ld29yay5pc0ZpcnN0Q2hhbmdlKCkgJiZcbiAgICAgICAgKGNoYW5nZXMuZnJhbWV3b3JrLnByZXZpb3VzVmFsdWUgIT09IGNoYW5nZXMuZnJhbWV3b3JrLmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgdGhpcy5sb2FkQXNzZXRzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5zZXRGb3JtVmFsdWVzKHZhbHVlLCBmYWxzZSk7XG4gICAgaWYgKCF0aGlzLmZvcm1WYWx1ZXNJbnB1dCkgeyB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICduZ01vZGVsJzsgfVxuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuanNmLmZvcm1PcHRpb25zLmZvcm1EaXNhYmxlZCAhPT0gISFpc0Rpc2FibGVkKSB7XG4gICAgICB0aGlzLmpzZi5mb3JtT3B0aW9ucy5mb3JtRGlzYWJsZWQgPSAhIWlzRGlzYWJsZWQ7XG4gICAgICB0aGlzLmluaXRpYWxpemVGb3JtKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRm9ybSgpIHtcbiAgICBpZiAoIXRoaXMuZm9ybUluaXRpYWxpemVkIHx8ICF0aGlzLmZvcm1WYWx1ZXNJbnB1dCB8fFxuICAgICAgKHRoaXMubGFuZ3VhZ2UgJiYgdGhpcy5sYW5ndWFnZSAhPT0gdGhpcy5qc2YubGFuZ3VhZ2UpXG4gICAgKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVGb3JtKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmxhbmd1YWdlICYmIHRoaXMubGFuZ3VhZ2UgIT09IHRoaXMuanNmLmxhbmd1YWdlKSB7XG4gICAgICAgIHRoaXMuanNmLnNldExhbmd1YWdlKHRoaXMubGFuZ3VhZ2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgbmFtZXMgb2YgY2hhbmdlZCBpbnB1dHNcbiAgICAgIGxldCBjaGFuZ2VkSW5wdXQgPSBPYmplY3Qua2V5cyh0aGlzLnByZXZpb3VzSW5wdXRzKVxuICAgICAgICAuZmlsdGVyKGlucHV0ID0+IHRoaXMucHJldmlvdXNJbnB1dHNbaW5wdXRdICE9PSB0aGlzW2lucHV0XSk7XG4gICAgICBsZXQgcmVzZXRGaXJzdCA9IHRydWU7XG4gICAgICBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCA9PT0gMSAmJiBjaGFuZ2VkSW5wdXRbMF0gPT09ICdmb3JtJyAmJlxuICAgICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5zdGFydHNXaXRoKCdmb3JtLicpXG4gICAgICApIHtcbiAgICAgICAgLy8gSWYgb25seSAnZm9ybScgaW5wdXQgY2hhbmdlZCwgZ2V0IG5hbWVzIG9mIGNoYW5nZWQga2V5c1xuICAgICAgICBjaGFuZ2VkSW5wdXQgPSBPYmplY3Qua2V5cyh0aGlzLnByZXZpb3VzSW5wdXRzLmZvcm0gfHwge30pXG4gICAgICAgICAgLmZpbHRlcihrZXkgPT4gIWlzRXF1YWwodGhpcy5wcmV2aW91c0lucHV0cy5mb3JtW2tleV0sIHRoaXMuZm9ybVtrZXldKSlcbiAgICAgICAgICAubWFwKGtleSA9PiBgZm9ybS4ke2tleX1gKTtcbiAgICAgICAgcmVzZXRGaXJzdCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBvbmx5IGlucHV0IHZhbHVlcyBoYXZlIGNoYW5nZWQsIHVwZGF0ZSB0aGUgZm9ybSB2YWx1ZXNcbiAgICAgIGlmIChjaGFuZ2VkSW5wdXQubGVuZ3RoID09PSAxICYmIGNoYW5nZWRJbnB1dFswXSA9PT0gdGhpcy5mb3JtVmFsdWVzSW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuZm9ybVZhbHVlc0lucHV0LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNldEZvcm1WYWx1ZXModGhpc1t0aGlzLmZvcm1WYWx1ZXNJbnB1dF0sIHJlc2V0Rmlyc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IFtpbnB1dCwga2V5XSA9IHRoaXMuZm9ybVZhbHVlc0lucHV0LnNwbGl0KCcuJyk7XG4gICAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKHRoaXNbaW5wdXRdW2tleV0sIHJlc2V0Rmlyc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYW55dGhpbmcgZWxzZSBoYXMgY2hhbmdlZCwgcmUtcmVuZGVyIHRoZSBlbnRpcmUgZm9ybVxuICAgICAgfSBlbHNlIGlmIChjaGFuZ2VkSW5wdXQubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUZvcm0oKTtcbiAgICAgICAgaWYgKHRoaXMub25DaGFuZ2UpIHsgdGhpcy5vbkNoYW5nZSh0aGlzLmpzZi5mb3JtVmFsdWVzKTsgfVxuICAgICAgICBpZiAodGhpcy5vblRvdWNoZWQpIHsgdGhpcy5vblRvdWNoZWQodGhpcy5qc2YuZm9ybVZhbHVlcyk7IH1cbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHByZXZpb3VzIGlucHV0c1xuICAgICAgT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cylcbiAgICAgICAgLmZpbHRlcihpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSAhPT0gdGhpc1tpbnB1dF0pXG4gICAgICAgIC5mb3JFYWNoKGlucHV0ID0+IHRoaXMucHJldmlvdXNJbnB1dHNbaW5wdXRdID0gdGhpc1tpbnB1dF0pO1xuICAgIH1cbiAgfVxuXG4gIHNldEZvcm1WYWx1ZXMoZm9ybVZhbHVlczogYW55LCByZXNldEZpcnN0ID0gdHJ1ZSkge1xuICAgIGlmIChmb3JtVmFsdWVzKSB7XG4gICAgICBjb25zdCBuZXdGb3JtVmFsdWVzID0gdGhpcy5vYmplY3RXcmFwID8gZm9ybVZhbHVlc1snMSddIDogZm9ybVZhbHVlcztcbiAgICAgIGlmICghdGhpcy5qc2YuZm9ybUdyb3VwKSB7XG4gICAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBmb3JtVmFsdWVzO1xuICAgICAgICB0aGlzLmFjdGl2YXRlRm9ybSgpO1xuICAgICAgfSBlbHNlIGlmIChyZXNldEZpcnN0KSB7XG4gICAgICAgIHRoaXMuanNmLmZvcm1Hcm91cC5yZXNldCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuanNmLmZvcm1Hcm91cCkge1xuICAgICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucGF0Y2hWYWx1ZShuZXdGb3JtVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9uQ2hhbmdlKSB7IHRoaXMub25DaGFuZ2UobmV3Rm9ybVZhbHVlcyk7IH1cbiAgICAgIGlmICh0aGlzLm9uVG91Y2hlZCkgeyB0aGlzLm9uVG91Y2hlZChuZXdGb3JtVmFsdWVzKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBzdWJtaXRGb3JtKCkge1xuICAgIGNvbnN0IHZhbGlkRGF0YSA9IHRoaXMuanNmLnZhbGlkRGF0YTtcbiAgICB0aGlzLm9uU3VibWl0LmVtaXQodGhpcy5vYmplY3RXcmFwID8gdmFsaWREYXRhWycxJ10gOiB2YWxpZERhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplRm9ybScgZnVuY3Rpb25cbiAgICpcbiAgICogLSBVcGRhdGUgJ3NjaGVtYScsICdsYXlvdXQnLCBhbmQgJ2Zvcm1WYWx1ZXMnLCBmcm9tIGlucHV0cy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ3NjaGVtYVJlZkxpYnJhcnknIGFuZCAnc2NoZW1hUmVjdXJzaXZlUmVmTWFwJ1xuICAgKiAgIHRvIHJlc29sdmUgc2NoZW1hICRyZWYgbGlua3MsIGluY2x1ZGluZyByZWN1cnNpdmUgJHJlZiBsaW5rcy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2RhdGFSZWN1cnNpdmVSZWZNYXAnIHRvIHJlc29sdmUgcmVjdXJzaXZlIGxpbmtzIGluIGRhdGFcbiAgICogICBhbmQgY29yZWN0bHkgc2V0IG91dHB1dCBmb3JtYXRzIGZvciByZWN1cnNpdmVseSBuZXN0ZWQgdmFsdWVzLlxuICAgKlxuICAgKiAtIENyZWF0ZSAnbGF5b3V0UmVmTGlicmFyeScgYW5kICd0ZW1wbGF0ZVJlZkxpYnJhcnknIHRvIHN0b3JlXG4gICAqICAgbmV3IGxheW91dCBub2RlcyBhbmQgZm9ybUdyb3VwIGVsZW1lbnRzIHRvIHVzZSB3aGVuIGR5bmFtaWNhbGx5XG4gICAqICAgYWRkaW5nIGZvcm0gY29tcG9uZW50cyB0byBhcnJheXMgYW5kIHJlY3Vyc2l2ZSAkcmVmIHBvaW50cy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2RhdGFNYXAnIHRvIG1hcCB0aGUgZGF0YSB0byB0aGUgc2NoZW1hIGFuZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogLSBDcmVhdGUgdGhlIG1hc3RlciAnZm9ybUdyb3VwVGVtcGxhdGUnIHRoZW4gZnJvbSBpdCAnZm9ybUdyb3VwJ1xuICAgKiAgIHRoZSBBbmd1bGFyIGZvcm1Hcm91cCB1c2VkIHRvIGNvbnRyb2wgdGhlIHJlYWN0aXZlIGZvcm0uXG4gICAqL1xuICBpbml0aWFsaXplRm9ybSgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLnNjaGVtYSB8fCB0aGlzLmxheW91dCB8fCB0aGlzLmRhdGEgfHwgdGhpcy5mb3JtIHx8IHRoaXMubW9kZWwgfHxcbiAgICAgIHRoaXMuSlNPTlNjaGVtYSB8fCB0aGlzLlVJU2NoZW1hIHx8IHRoaXMuZm9ybURhdGEgfHwgdGhpcy5uZ01vZGVsIHx8XG4gICAgICB0aGlzLmpzZi5kYXRhXG4gICAgKSB7XG5cbiAgICAgIHRoaXMuanNmLnJlc2V0QWxsVmFsdWVzKCk7ICAvLyBSZXNldCBhbGwgZm9ybSB2YWx1ZXMgdG8gZGVmYXVsdHNcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZU9wdGlvbnMoKTsgICAvLyBVcGRhdGUgb3B0aW9uc1xuICAgICAgdGhpcy5pbml0aWFsaXplU2NoZW1hKCk7ICAgIC8vIFVwZGF0ZSBzY2hlbWEsIHNjaGVtYVJlZkxpYnJhcnksXG4gICAgICAvLyBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsICYgZGF0YVJlY3Vyc2l2ZVJlZk1hcFxuICAgICAgdGhpcy5pbml0aWFsaXplTGF5b3V0KCk7ICAgIC8vIFVwZGF0ZSBsYXlvdXQsIGxheW91dFJlZkxpYnJhcnksXG4gICAgICB0aGlzLmluaXRpYWxpemVEYXRhKCk7ICAgICAgLy8gVXBkYXRlIGZvcm1WYWx1ZXNcbiAgICAgIHRoaXMuYWN0aXZhdGVGb3JtKCk7ICAgICAgICAvLyBVcGRhdGUgZGF0YU1hcCwgdGVtcGxhdGVSZWZMaWJyYXJ5LFxuICAgICAgLy8gZm9ybUdyb3VwVGVtcGxhdGUsIGZvcm1Hcm91cFxuXG4gICAgICAvLyBVbmNvbW1lbnQgaW5kaXZpZHVhbCBsaW5lcyB0byBvdXRwdXQgZGVidWdnaW5nIGluZm9ybWF0aW9uIHRvIGNvbnNvbGU6XG4gICAgICAvLyAoVGhlc2UgYWx3YXlzIHdvcmsuKVxuICAgICAgLy8gY29uc29sZS5sb2coJ2xvYWRpbmcgZm9ybS4uLicpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3NjaGVtYScsIHRoaXMuanNmLnNjaGVtYSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnbGF5b3V0JywgdGhpcy5qc2YubGF5b3V0KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdvcHRpb25zJywgdGhpcy5vcHRpb25zKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb3JtVmFsdWVzJywgdGhpcy5qc2YuZm9ybVZhbHVlcyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZm9ybUdyb3VwVGVtcGxhdGUnLCB0aGlzLmpzZi5mb3JtR3JvdXBUZW1wbGF0ZSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZm9ybUdyb3VwJywgdGhpcy5qc2YuZm9ybUdyb3VwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb3JtR3JvdXAudmFsdWUnLCB0aGlzLmpzZi5mb3JtR3JvdXAudmFsdWUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3NjaGVtYVJlZkxpYnJhcnknLCB0aGlzLmpzZi5zY2hlbWFSZWZMaWJyYXJ5KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsYXlvdXRSZWZMaWJyYXJ5JywgdGhpcy5qc2YubGF5b3V0UmVmTGlicmFyeSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygndGVtcGxhdGVSZWZMaWJyYXJ5JywgdGhpcy5qc2YudGVtcGxhdGVSZWZMaWJyYXJ5KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdkYXRhTWFwJywgdGhpcy5qc2YuZGF0YU1hcCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnYXJyYXlNYXAnLCB0aGlzLmpzZi5hcnJheU1hcCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc2NoZW1hUmVjdXJzaXZlUmVmTWFwJywgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdkYXRhUmVjdXJzaXZlUmVmTWFwJywgdGhpcy5qc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCk7XG5cbiAgICAgIC8vIFVuY29tbWVudCBpbmRpdmlkdWFsIGxpbmVzIHRvIG91dHB1dCBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24gdG8gYnJvd3NlcjpcbiAgICAgIC8vIChUaGVzZSBvbmx5IHdvcmsgaWYgdGhlICdkZWJ1Zycgb3B0aW9uIGhhcyBhbHNvIGJlZW4gc2V0IHRvICd0cnVlJy4pXG4gICAgICBpZiAodGhpcy5kZWJ1ZyB8fCB0aGlzLmpzZi5mb3JtT3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICBjb25zdCB2YXJzOiBhbnlbXSA9IFtdO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2Yuc2NoZW1hKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmxheW91dCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLm9wdGlvbnMpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZm9ybVZhbHVlcyk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtR3JvdXAudmFsdWUpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZm9ybUdyb3VwVGVtcGxhdGUpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZm9ybUdyb3VwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnkpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YubGF5b3V0UmVmTGlicmFyeSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi50ZW1wbGF0ZVJlZkxpYnJhcnkpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZGF0YU1hcCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5hcnJheU1hcCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAgIHRoaXMuZGVidWdPdXRwdXQgPSB2YXJzLm1hcCh2ID0+IEpTT04uc3RyaW5naWZ5KHYsIG51bGwsIDIpKS5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9ybUluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVPcHRpb25zJyBmdW5jdGlvblxuICAgKlxuICAgKiBJbml0aWFsaXplICdvcHRpb25zJyAoZ2xvYmFsIGZvcm0gb3B0aW9ucykgYW5kIHNldCBmcmFtZXdvcmtcbiAgICogQ29tYmluZSBhdmFpbGFibGUgaW5wdXRzOlxuICAgKiAxLiBvcHRpb25zIC0gcmVjb21tZW5kZWRcbiAgICogMi4gZm9ybS5vcHRpb25zIC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqL1xuICBwcml2YXRlIGluaXRpYWxpemVPcHRpb25zKCkge1xuICAgIGlmICh0aGlzLmxhbmd1YWdlICYmIHRoaXMubGFuZ3VhZ2UgIT09IHRoaXMuanNmLmxhbmd1YWdlKSB7XG4gICAgICB0aGlzLmpzZi5zZXRMYW5ndWFnZSh0aGlzLmxhbmd1YWdlKTtcbiAgICB9XG4gICAgdGhpcy5qc2Yuc2V0T3B0aW9ucyh7IGRlYnVnOiAhIXRoaXMuZGVidWcgfSk7XG4gICAgbGV0IGxvYWRFeHRlcm5hbEFzc2V0czogYm9vbGVhbiA9IHRoaXMubG9hZEV4dGVybmFsQXNzZXRzIHx8IGZhbHNlO1xuICAgIGxldCBmcmFtZXdvcms6IGFueSA9IHRoaXMuZnJhbWV3b3JrIHx8ICdkZWZhdWx0JztcbiAgICBpZiAoaXNPYmplY3QodGhpcy5vcHRpb25zKSkge1xuICAgICAgdGhpcy5qc2Yuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgbG9hZEV4dGVybmFsQXNzZXRzID0gdGhpcy5vcHRpb25zLmxvYWRFeHRlcm5hbEFzc2V0cyB8fCBsb2FkRXh0ZXJuYWxBc3NldHM7XG4gICAgICBmcmFtZXdvcmsgPSB0aGlzLm9wdGlvbnMuZnJhbWV3b3JrIHx8IGZyYW1ld29yaztcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkgJiYgaXNPYmplY3QodGhpcy5mb3JtLm9wdGlvbnMpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHRoaXMuZm9ybS5vcHRpb25zKTtcbiAgICAgIGxvYWRFeHRlcm5hbEFzc2V0cyA9IHRoaXMuZm9ybS5vcHRpb25zLmxvYWRFeHRlcm5hbEFzc2V0cyB8fCBsb2FkRXh0ZXJuYWxBc3NldHM7XG4gICAgICBmcmFtZXdvcmsgPSB0aGlzLmZvcm0ub3B0aW9ucy5mcmFtZXdvcmsgfHwgZnJhbWV3b3JrO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3QodGhpcy53aWRnZXRzKSkge1xuICAgICAgdGhpcy5qc2Yuc2V0T3B0aW9ucyh7IHdpZGdldHM6IHRoaXMud2lkZ2V0cyB9KTtcbiAgICB9XG4gICAgdGhpcy5mcmFtZXdvcmtMaWJyYXJ5LnNldExvYWRFeHRlcm5hbEFzc2V0cyhsb2FkRXh0ZXJuYWxBc3NldHMpO1xuICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeS5zZXRGcmFtZXdvcmsoZnJhbWV3b3JrKTtcbiAgICB0aGlzLmpzZi5mcmFtZXdvcmsgPSB0aGlzLmZyYW1ld29ya0xpYnJhcnkuZ2V0RnJhbWV3b3JrKCk7XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuanNmLmZvcm1PcHRpb25zLndpZGdldHMpKSB7XG4gICAgICBmb3IgKGNvbnN0IHdpZGdldCBvZiBPYmplY3Qua2V5cyh0aGlzLmpzZi5mb3JtT3B0aW9ucy53aWRnZXRzKSkge1xuICAgICAgICB0aGlzLndpZGdldExpYnJhcnkucmVnaXN0ZXJXaWRnZXQod2lkZ2V0LCB0aGlzLmpzZi5mb3JtT3B0aW9ucy53aWRnZXRzW3dpZGdldF0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSAmJiBpc09iamVjdCh0aGlzLmZvcm0udHBsZGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLnNldFRwbGRhdGEodGhpcy5mb3JtLnRwbGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZVNjaGVtYScgZnVuY3Rpb25cbiAgICpcbiAgICogSW5pdGlhbGl6ZSAnc2NoZW1hJ1xuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBzY2hlbWEgLSByZWNvbW1lbmRlZCAvIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMi4gZm9ybS5zY2hlbWEgLSBTaW5nbGUgaW5wdXQgLyBKU09OIEZvcm0gc3R5bGVcbiAgICogMy4gSlNPTlNjaGVtYSAtIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogNC4gZm9ybS5KU09OU2NoZW1hIC0gRm9yIHRlc3Rpbmcgc2luZ2xlIGlucHV0IFJlYWN0IEpTT04gU2NoZW1hIEZvcm1zXG4gICAqIDUuIGZvcm0gLSBGb3IgdGVzdGluZyBzaW5nbGUgc2NoZW1hLW9ubHkgaW5wdXRzXG4gICAqXG4gICAqIC4uLiBpZiBubyBzY2hlbWEgaW5wdXQgZm91bmQsIHRoZSAnYWN0aXZhdGVGb3JtJyBmdW5jdGlvbiwgYmVsb3csXG4gICAqICAgICB3aWxsIG1ha2UgdHdvIGFkZGl0aW9uYWwgYXR0ZW1wdHMgdG8gYnVpbGQgYSBzY2hlbWFcbiAgICogNi4gSWYgbGF5b3V0IGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0XG4gICAqIDcuIElmIGRhdGEgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBkYXRhXG4gICAqL1xuICBwcml2YXRlIGluaXRpYWxpemVTY2hlbWEoKSB7XG5cbiAgICAvLyBUT0RPOiB1cGRhdGUgdG8gYWxsb3cgbm9uLW9iamVjdCBzY2hlbWFzXG5cbiAgICBpZiAoaXNPYmplY3QodGhpcy5zY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5Bbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY2xvbmVEZWVwKHRoaXMuc2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdzY2hlbWEnKSAmJiBpc09iamVjdCh0aGlzLmZvcm0uc2NoZW1hKSkge1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5zY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGhpcy5KU09OU2NoZW1hKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY2xvbmVEZWVwKHRoaXMuSlNPTlNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnSlNPTlNjaGVtYScpICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5KU09OU2NoZW1hKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5KU09OU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdwcm9wZXJ0aWVzJykgJiYgaXNPYmplY3QodGhpcy5mb3JtLnByb3BlcnRpZXMpKSB7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBjbG9uZURlZXAodGhpcy5mb3JtKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkpIHtcbiAgICAgIC8vIFRPRE86IEhhbmRsZSBvdGhlciB0eXBlcyBvZiBmb3JtIGlucHV0XG4gICAgfVxuXG4gICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLnNjaGVtYSkpIHtcblxuICAgICAgLy8gSWYgb3RoZXIgdHlwZXMgYWxzbyBhbGxvd2VkLCByZW5kZXIgc2NoZW1hIGFzIGFuIG9iamVjdFxuICAgICAgaWYgKGluQXJyYXkoJ29iamVjdCcsIHRoaXMuanNmLnNjaGVtYS50eXBlKSkge1xuICAgICAgICB0aGlzLmpzZi5zY2hlbWEudHlwZSA9ICdvYmplY3QnO1xuICAgICAgfVxuXG4gICAgICAvLyBXcmFwIG5vbi1vYmplY3Qgc2NoZW1hcyBpbiBvYmplY3QuXG4gICAgICBpZiAoaGFzT3duKHRoaXMuanNmLnNjaGVtYSwgJ3R5cGUnKSAmJiB0aGlzLmpzZi5zY2hlbWEudHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5qc2Yuc2NoZW1hID0ge1xuICAgICAgICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgICAgICAgJ3Byb3BlcnRpZXMnOiB7IDE6IHRoaXMuanNmLnNjaGVtYSB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub2JqZWN0V3JhcCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCFoYXNPd24odGhpcy5qc2Yuc2NoZW1hLCAndHlwZScpKSB7XG5cbiAgICAgICAgLy8gQWRkIHR5cGUgPSAnb2JqZWN0JyBpZiBtaXNzaW5nXG4gICAgICAgIGlmIChpc09iamVjdCh0aGlzLmpzZi5zY2hlbWEucHJvcGVydGllcykgfHxcbiAgICAgICAgICBpc09iamVjdCh0aGlzLmpzZi5zY2hlbWEucGF0dGVyblByb3BlcnRpZXMpIHx8XG4gICAgICAgICAgaXNPYmplY3QodGhpcy5qc2Yuc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmpzZi5zY2hlbWEudHlwZSA9ICdvYmplY3QnO1xuXG4gICAgICAgICAgLy8gRml4IEpTT04gc2NoZW1hIHNob3J0aGFuZCAoSlNPTiBGb3JtIHN0eWxlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICAgICAgdGhpcy5qc2Yuc2NoZW1hID0ge1xuICAgICAgICAgICAgJ3R5cGUnOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICdwcm9wZXJ0aWVzJzogdGhpcy5qc2Yuc2NoZW1hXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBuZWVkZWQsIHVwZGF0ZSBKU09OIFNjaGVtYSB0byBkcmFmdCA2IGZvcm1hdCwgaW5jbHVkaW5nXG4gICAgICAvLyBkcmFmdCAzIChKU09OIEZvcm0gc3R5bGUpIGFuZCBkcmFmdCA0IChBbmd1bGFyIFNjaGVtYSBGb3JtIHN0eWxlKVxuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY29udmVydFNjaGVtYVRvRHJhZnQ2KHRoaXMuanNmLnNjaGVtYSk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgYWp2IGFuZCBjb21waWxlIHNjaGVtYVxuICAgICAgdGhpcy5qc2YuY29tcGlsZUFqdlNjaGVtYSgpO1xuXG4gICAgICAvLyBDcmVhdGUgc2NoZW1hUmVmTGlicmFyeSwgc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCBkYXRhUmVjdXJzaXZlUmVmTWFwLCAmIGFycmF5TWFwXG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSByZXNvbHZlU2NoZW1hUmVmZXJlbmNlcyhcbiAgICAgICAgdGhpcy5qc2Yuc2NoZW1hLCB0aGlzLmpzZi5zY2hlbWFSZWZMaWJyYXJ5LCB0aGlzLmpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXAsXG4gICAgICAgIHRoaXMuanNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIHRoaXMuanNmLmFycmF5TWFwXG4gICAgICApO1xuICAgICAgaWYgKGhhc093bih0aGlzLmpzZi5zY2hlbWFSZWZMaWJyYXJ5LCAnJykpIHtcbiAgICAgICAgdGhpcy5qc2YuaGFzUm9vdFJlZmVyZW5jZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86ICg/KSBSZXNvbHZlIGV4dGVybmFsICRyZWYgbGlua3NcbiAgICAgIC8vIC8vIENyZWF0ZSBzY2hlbWFSZWZMaWJyYXJ5ICYgc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gICAgICAvLyB0aGlzLnBhcnNlci5idW5kbGUodGhpcy5zY2hlbWEpXG4gICAgICAvLyAgIC50aGVuKHNjaGVtYSA9PiB0aGlzLnNjaGVtYSA9IHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzKFxuICAgICAgLy8gICAgIHNjaGVtYSwgdGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSxcbiAgICAgIC8vICAgICB0aGlzLmpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXAsIHRoaXMuanNmLmRhdGFSZWN1cnNpdmVSZWZNYXBcbiAgICAgIC8vICAgKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplRGF0YScgZnVuY3Rpb25cbiAgICpcbiAgICogSW5pdGlhbGl6ZSAnZm9ybVZhbHVlcydcbiAgICogZGVmdWxhdCBvciBwcmV2aW91c2x5IHN1Ym1pdHRlZCB2YWx1ZXMgdXNlZCB0byBwb3B1bGF0ZSBmb3JtXG4gICAqIFVzZSBmaXJzdCBhdmFpbGFibGUgaW5wdXQ6XG4gICAqIDEuIGRhdGEgLSByZWNvbW1lbmRlZFxuICAgKiAyLiBtb2RlbCAtIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMy4gZm9ybS52YWx1ZSAtIEpTT04gRm9ybSBzdHlsZVxuICAgKiA0LiBmb3JtLmRhdGEgLSBTaW5nbGUgaW5wdXQgc3R5bGVcbiAgICogNS4gZm9ybURhdGEgLSBSZWFjdCBKU09OIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDYuIGZvcm0uZm9ybURhdGEgLSBGb3IgZWFzaWVyIHRlc3Rpbmcgb2YgUmVhY3QgSlNPTiBTY2hlbWEgRm9ybXNcbiAgICogNy4gKG5vbmUpIG5vIGRhdGEgLSBpbml0aWFsaXplIGRhdGEgZnJvbSBzY2hlbWEgYW5kIGxheW91dCBkZWZhdWx0cyBvbmx5XG4gICAqL1xuICBwcml2YXRlIGluaXRpYWxpemVEYXRhKCkge1xuICAgIGlmIChoYXNWYWx1ZSh0aGlzLmRhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMuZGF0YSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdkYXRhJztcbiAgICB9IGVsc2UgaWYgKGhhc1ZhbHVlKHRoaXMubW9kZWwpKSB7XG4gICAgICB0aGlzLmpzZi5Bbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLm1vZGVsKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ21vZGVsJztcbiAgICB9IGVsc2UgaWYgKGhhc1ZhbHVlKHRoaXMubmdNb2RlbCkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMubmdNb2RlbCk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICduZ01vZGVsJztcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkgJiYgaGFzVmFsdWUodGhpcy5mb3JtLnZhbHVlKSkge1xuICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5mb3JtLnZhbHVlKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm0udmFsdWUnO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSAmJiBoYXNWYWx1ZSh0aGlzLmZvcm0uZGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5mb3JtLmRhdGEpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybS5kYXRhJztcbiAgICB9IGVsc2UgaWYgKGhhc1ZhbHVlKHRoaXMuZm9ybURhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdmb3JtRGF0YSc7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnZm9ybURhdGEnKSAmJiBoYXNWYWx1ZSh0aGlzLmZvcm0uZm9ybURhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5mb3JtRGF0YSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdmb3JtLmZvcm1EYXRhJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZUxheW91dCcgZnVuY3Rpb25cbiAgICpcbiAgICogSW5pdGlhbGl6ZSAnbGF5b3V0J1xuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGFycmF5IGlucHV0OlxuICAgKiAxLiBsYXlvdXQgLSByZWNvbW1lbmRlZFxuICAgKiAyLiBmb3JtIC0gQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiAzLiBmb3JtLmZvcm0gLSBKU09OIEZvcm0gc3R5bGVcbiAgICogNC4gZm9ybS5sYXlvdXQgLSBTaW5nbGUgaW5wdXQgc3R5bGVcbiAgICogNS4gKG5vbmUpIG5vIGxheW91dCAtIHNldCBkZWZhdWx0IGxheW91dCBpbnN0ZWFkXG4gICAqICAgIChmdWxsIGxheW91dCB3aWxsIGJlIGJ1aWx0IGxhdGVyIGZyb20gdGhlIHNjaGVtYSlcbiAgICpcbiAgICogQWxzbywgaWYgYWx0ZXJuYXRlIGxheW91dCBmb3JtYXRzIGFyZSBhdmFpbGFibGUsXG4gICAqIGltcG9ydCBmcm9tICdVSVNjaGVtYScgb3IgJ2N1c3RvbUZvcm1JdGVtcydcbiAgICogdXNlZCBmb3IgUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBhbmQgSlNPTiBGb3JtIEFQSSBjb21wYXRpYmlsaXR5XG4gICAqIFVzZSBmaXJzdCBhdmFpbGFibGUgaW5wdXQ6XG4gICAqIDEuIFVJU2NoZW1hIC0gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiAyLiBmb3JtLlVJU2NoZW1hIC0gRm9yIHRlc3Rpbmcgc2luZ2xlIGlucHV0IFJlYWN0IEpTT04gU2NoZW1hIEZvcm1zXG4gICAqIDIuIGZvcm0uY3VzdG9tRm9ybUl0ZW1zIC0gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDMuIChub25lKSBubyBpbnB1dCAtIGRvbid0IGltcG9ydFxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplTGF5b3V0KCkge1xuXG4gICAgLy8gUmVuYW1lIEpTT04gRm9ybS1zdHlsZSAnb3B0aW9ucycgbGlzdHMgdG9cbiAgICAvLyBBbmd1bGFyIFNjaGVtYSBGb3JtLXN0eWxlICd0aXRsZU1hcCcgbGlzdHMuXG4gICAgY29uc3QgZml4SnNvbkZvcm1PcHRpb25zID0gKGxheW91dDogYW55KTogYW55ID0+IHtcbiAgICAgIGlmIChpc09iamVjdChsYXlvdXQpIHx8IGlzQXJyYXkobGF5b3V0KSkge1xuICAgICAgICBmb3JFYWNoKGxheW91dCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICBpZiAoaGFzT3duKHZhbHVlLCAnb3B0aW9ucycpICYmIGlzT2JqZWN0KHZhbHVlLm9wdGlvbnMpKSB7XG4gICAgICAgICAgICB2YWx1ZS50aXRsZU1hcCA9IHZhbHVlLm9wdGlvbnM7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWUub3B0aW9ucztcbiAgICAgICAgICB9XG4gICAgICAgIH0sICd0b3AtZG93bicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxheW91dDtcbiAgICB9O1xuXG4gICAgLy8gQ2hlY2sgZm9yIGxheW91dCBpbnB1dHMgYW5kLCBpZiBmb3VuZCwgaW5pdGlhbGl6ZSBmb3JtIGxheW91dFxuICAgIGlmIChpc0FycmF5KHRoaXMubGF5b3V0KSkge1xuICAgICAgdGhpcy5qc2YubGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMubGF5b3V0KTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodGhpcy5mb3JtKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGNsb25lRGVlcCh0aGlzLmZvcm0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5mb3JtICYmIGlzQXJyYXkodGhpcy5mb3JtLmZvcm0pKSB7XG4gICAgICB0aGlzLmpzZi5Kc29uRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YubGF5b3V0ID0gZml4SnNvbkZvcm1PcHRpb25zKGNsb25lRGVlcCh0aGlzLmZvcm0uZm9ybSkpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5mb3JtICYmIGlzQXJyYXkodGhpcy5mb3JtLmxheW91dCkpIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGNsb25lRGVlcCh0aGlzLmZvcm0ubGF5b3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5qc2YubGF5b3V0ID0gWycqJ107XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFsdGVybmF0ZSBsYXlvdXQgaW5wdXRzXG4gICAgbGV0IGFsdGVybmF0ZUxheW91dDogYW55ID0gbnVsbDtcbiAgICBpZiAoaXNPYmplY3QodGhpcy5VSVNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIGFsdGVybmF0ZUxheW91dCA9IGNsb25lRGVlcCh0aGlzLlVJU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdVSVNjaGVtYScpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtLlVJU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICd1aVNjaGVtYScpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtLnVpU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdjdXN0b21Gb3JtSXRlbXMnKSkge1xuICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIGFsdGVybmF0ZUxheW91dCA9IGZpeEpzb25Gb3JtT3B0aW9ucyhjbG9uZURlZXAodGhpcy5mb3JtLmN1c3RvbUZvcm1JdGVtcykpO1xuICAgIH1cblxuICAgIC8vIGlmIGFsdGVybmF0ZSBsYXlvdXQgZm91bmQsIGNvcHkgYWx0ZXJuYXRlIGxheW91dCBvcHRpb25zIGludG8gc2NoZW1hXG4gICAgaWYgKGFsdGVybmF0ZUxheW91dCkge1xuICAgICAgSnNvblBvaW50ZXIuZm9yRWFjaERlZXAoYWx0ZXJuYXRlTGF5b3V0LCAodmFsdWUsIHBvaW50ZXIpID0+IHtcbiAgICAgICAgY29uc3Qgc2NoZW1hUG9pbnRlciA9IHBvaW50ZXJcbiAgICAgICAgICAucmVwbGFjZSgvXFwvL2csICcvcHJvcGVydGllcy8nKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXC9wcm9wZXJ0aWVzXFwvaXRlbXNcXC9wcm9wZXJ0aWVzXFwvL2csICcvaXRlbXMvcHJvcGVydGllcy8nKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXC9wcm9wZXJ0aWVzXFwvdGl0bGVNYXBcXC9wcm9wZXJ0aWVzXFwvL2csICcvdGl0bGVNYXAvcHJvcGVydGllcy8nKTtcbiAgICAgICAgaWYgKGhhc1ZhbHVlKHZhbHVlKSAmJiBoYXNWYWx1ZShwb2ludGVyKSkge1xuICAgICAgICAgIGxldCBrZXkgPSBKc29uUG9pbnRlci50b0tleShwb2ludGVyKTtcbiAgICAgICAgICBjb25zdCBncm91cFBvaW50ZXIgPSAoSnNvblBvaW50ZXIucGFyc2Uoc2NoZW1hUG9pbnRlcikgfHwgW10pLnNsaWNlKDAsIC0yKTtcbiAgICAgICAgICBsZXQgaXRlbVBvaW50ZXI6IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gICAgICAgICAgLy8gSWYgJ3VpOm9yZGVyJyBvYmplY3QgZm91bmQsIGNvcHkgaW50byBvYmplY3Qgc2NoZW1hIHJvb3RcbiAgICAgICAgICBpZiAoa2V5LnRvTG93ZXJDYXNlKCkgPT09ICd1aTpvcmRlcicpIHtcbiAgICAgICAgICAgIGl0ZW1Qb2ludGVyID0gWy4uLmdyb3VwUG9pbnRlciwgJ3VpOm9yZGVyJ107XG5cbiAgICAgICAgICAgIC8vIENvcHkgb3RoZXIgYWx0ZXJuYXRlIGxheW91dCBvcHRpb25zIHRvIHNjaGVtYSAneC1zY2hlbWEtZm9ybScsXG4gICAgICAgICAgICAvLyAobGlrZSBBbmd1bGFyIFNjaGVtYSBGb3JtIG9wdGlvbnMpIGFuZCByZW1vdmUgYW55ICd1aTonIHByZWZpeGVzXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrZXkuc2xpY2UoMCwgMykudG9Mb3dlckNhc2UoKSA9PT0gJ3VpOicpIHsga2V5ID0ga2V5LnNsaWNlKDMpOyB9XG4gICAgICAgICAgICBpdGVtUG9pbnRlciA9IFsuLi5ncm91cFBvaW50ZXIsICd4LXNjaGVtYS1mb3JtJywga2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKEpzb25Qb2ludGVyLmhhcyh0aGlzLmpzZi5zY2hlbWEsIGdyb3VwUG9pbnRlcikgJiZcbiAgICAgICAgICAgICFKc29uUG9pbnRlci5oYXModGhpcy5qc2Yuc2NoZW1hLCBpdGVtUG9pbnRlcilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIEpzb25Qb2ludGVyLnNldCh0aGlzLmpzZi5zY2hlbWEsIGl0ZW1Qb2ludGVyLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2FjdGl2YXRlRm9ybScgZnVuY3Rpb25cbiAgICpcbiAgICogLi4uY29udGludWVkIGZyb20gJ2luaXRpYWxpemVTY2hlbWEnIGZ1bmN0aW9uLCBhYm92ZVxuICAgKiBJZiAnc2NoZW1hJyBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQgKGkuZS4gbm8gc2NoZW1hIGlucHV0IGZvdW5kKVxuICAgKiA2LiBJZiBsYXlvdXQgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBsYXlvdXQgaW5wdXRcbiAgICogNy4gSWYgZGF0YSBpbnB1dCAtIGJ1aWxkIHNjaGVtYSBmcm9tIGRhdGEgaW5wdXRcbiAgICpcbiAgICogQ3JlYXRlIGZpbmFsIGxheW91dCxcbiAgICogYnVpbGQgdGhlIEZvcm1Hcm91cCB0ZW1wbGF0ZSBhbmQgdGhlIEFuZ3VsYXIgRm9ybUdyb3VwLFxuICAgKiBzdWJzY3JpYmUgdG8gY2hhbmdlcyxcbiAgICogYW5kIGFjdGl2YXRlIHRoZSBmb3JtLlxuICAgKi9cbiAgcHJpdmF0ZSBhY3RpdmF0ZUZvcm0oKSB7XG5cbiAgICAvLyBJZiAnc2NoZW1hJyBub3QgaW5pdGlhbGl6ZWRcbiAgICBpZiAoaXNFbXB0eSh0aGlzLmpzZi5zY2hlbWEpKSB7XG5cbiAgICAgIC8vIFRPRE86IElmIGZ1bGwgbGF5b3V0IGlucHV0ICh3aXRoIG5vICcqJyksIGJ1aWxkIHNjaGVtYSBmcm9tIGxheW91dFxuICAgICAgLy8gaWYgKCF0aGlzLmpzZi5sYXlvdXQuaW5jbHVkZXMoJyonKSkge1xuICAgICAgLy8gICB0aGlzLmpzZi5idWlsZFNjaGVtYUZyb21MYXlvdXQoKTtcbiAgICAgIC8vIH0gZWxzZVxuXG4gICAgICAvLyBJZiBkYXRhIGlucHV0LCBidWlsZCBzY2hlbWEgZnJvbSBkYXRhXG4gICAgICBpZiAoIWlzRW1wdHkodGhpcy5qc2YuZm9ybVZhbHVlcykpIHtcbiAgICAgICAgdGhpcy5qc2YuYnVpbGRTY2hlbWFGcm9tRGF0YSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5zY2hlbWEpKSB7XG5cbiAgICAgIC8vIElmIG5vdCBhbHJlYWR5IGluaXRpYWxpemVkLCBpbml0aWFsaXplIGFqdiBhbmQgY29tcGlsZSBzY2hlbWFcbiAgICAgIHRoaXMuanNmLmNvbXBpbGVBanZTY2hlbWEoKTtcblxuICAgICAgLy8gVXBkYXRlIGFsbCBsYXlvdXQgZWxlbWVudHMsIGFkZCB2YWx1ZXMsIHdpZGdldHMsIGFuZCB2YWxpZGF0b3JzLFxuICAgICAgLy8gcmVwbGFjZSBhbnkgJyonIHdpdGggYSBsYXlvdXQgYnVpbHQgZnJvbSBhbGwgc2NoZW1hIGVsZW1lbnRzLFxuICAgICAgLy8gYW5kIHVwZGF0ZSB0aGUgRm9ybUdyb3VwIHRlbXBsYXRlIHdpdGggYW55IG5ldyB2YWxpZGF0b3JzXG4gICAgICB0aGlzLmpzZi5idWlsZExheW91dCh0aGlzLndpZGdldExpYnJhcnkpO1xuXG4gICAgICAvLyBCdWlsZCB0aGUgQW5ndWxhciBGb3JtR3JvdXAgdGVtcGxhdGUgZnJvbSB0aGUgc2NoZW1hXG4gICAgICB0aGlzLmpzZi5idWlsZEZvcm1Hcm91cFRlbXBsYXRlKHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuXG4gICAgICAvLyBCdWlsZCB0aGUgcmVhbCBBbmd1bGFyIEZvcm1Hcm91cCBmcm9tIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGVcbiAgICAgIHRoaXMuanNmLmJ1aWxkRm9ybUdyb3VwKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuanNmLmZvcm1Hcm91cCkge1xuXG4gICAgICAvLyBSZXNldCBpbml0aWFsIGZvcm0gdmFsdWVzXG4gICAgICBpZiAoIWlzRW1wdHkodGhpcy5qc2YuZm9ybVZhbHVlcykgJiZcbiAgICAgICAgdGhpcy5qc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgIT09IHRydWUgJiZcbiAgICAgICAgdGhpcy5qc2YuZm9ybU9wdGlvbnMuc2V0TGF5b3V0RGVmYXVsdHMgIT09IHRydWVcbiAgICAgICkge1xuICAgICAgICB0aGlzLnNldEZvcm1WYWx1ZXModGhpcy5qc2YuZm9ybVZhbHVlcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IEZpZ3VyZSBvdXQgaG93IHRvIGRpc3BsYXkgY2FsY3VsYXRlZCB2YWx1ZXMgd2l0aG91dCBjaGFuZ2luZyBvYmplY3QgZGF0YVxuICAgICAgLy8gU2VlIGh0dHA6Ly91bGlvbi5naXRodWIuaW8vanNvbmZvcm0vcGxheWdyb3VuZC8/ZXhhbXBsZT10ZW1wbGF0aW5nLXZhbHVlc1xuICAgICAgLy8gQ2FsY3VsYXRlIHJlZmVyZW5jZXMgdG8gb3RoZXIgZmllbGRzXG4gICAgICAvLyBpZiAoIWlzRW1wdHkodGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlKSkge1xuICAgICAgLy8gICBmb3JFYWNoKHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSwgKHZhbHVlLCBrZXksIG9iamVjdCwgcm9vdE9iamVjdCkgPT4ge1xuICAgICAgLy8gICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyAgICAgICBvYmplY3Rba2V5XSA9IHRoaXMuanNmLnBhcnNlVGV4dCh2YWx1ZSwgdmFsdWUsIHJvb3RPYmplY3QsIGtleSk7XG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9LCAndG9wLWRvd24nKTtcbiAgICAgIC8vIH1cblxuICAgICAgLy8gU3Vic2NyaWJlIHRvIGZvcm0gY2hhbmdlcyB0byBvdXRwdXQgbGl2ZSBkYXRhLCB2YWxpZGF0aW9uLCBhbmQgZXJyb3JzXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuanNmLmRhdGFDaGFuZ2VzLnN1YnNjcmliZShkYXRhID0+IHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZXMuZW1pdCh0aGlzLm9iamVjdFdyYXAgPyBkYXRhWycxJ10gOiBkYXRhKTtcbiAgICAgICAgaWYgKHRoaXMuZm9ybVZhbHVlc0lucHV0ICYmIHRoaXMuZm9ybVZhbHVlc0lucHV0LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzW2Ake3RoaXMuZm9ybVZhbHVlc0lucHV0fUNoYW5nZWBdLmVtaXQodGhpcy5vYmplY3RXcmFwID8gZGF0YVsnMSddIDogZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcblxuICAgICAgLy8gVHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIG9uIHN0YXR1c0NoYW5nZXMgdG8gc2hvdyB1cGRhdGVkIGVycm9yc1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmpzZi5mb3JtR3JvdXAuc3RhdHVzQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKSkpO1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmpzZi5pc1ZhbGlkQ2hhbmdlcy5zdWJzY3JpYmUoaXNWYWxpZCA9PiB0aGlzLmlzVmFsaWQuZW1pdChpc1ZhbGlkKSkpO1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmpzZi52YWxpZGF0aW9uRXJyb3JDaGFuZ2VzLnN1YnNjcmliZShlcnIgPT4gdGhpcy52YWxpZGF0aW9uRXJyb3JzLmVtaXQoZXJyKSkpO1xuXG4gICAgICAvLyBPdXRwdXQgZmluYWwgc2NoZW1hLCBmaW5hbCBsYXlvdXQsIGFuZCBpbml0aWFsIGRhdGFcbiAgICAgIHRoaXMuZm9ybVNjaGVtYS5lbWl0KHRoaXMuanNmLnNjaGVtYSk7XG4gICAgICB0aGlzLmZvcm1MYXlvdXQuZW1pdCh0aGlzLmpzZi5sYXlvdXQpO1xuICAgICAgdGhpcy5vbkNoYW5nZXMuZW1pdCh0aGlzLm9iamVjdFdyYXAgPyB0aGlzLmpzZi5kYXRhWycxJ10gOiB0aGlzLmpzZi5kYXRhKTtcblxuICAgICAgLy8gSWYgdmFsaWRhdGVPblJlbmRlciwgb3V0cHV0IGluaXRpYWwgdmFsaWRhdGlvbiBhbmQgYW55IGVycm9yc1xuICAgICAgY29uc3QgdmFsaWRhdGVPblJlbmRlciA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldCh0aGlzLmpzZiwgJy9mb3JtT3B0aW9ucy92YWxpZGF0ZU9uUmVuZGVyJyk7XG4gICAgICBpZiAodmFsaWRhdGVPblJlbmRlcikgeyAvLyB2YWxpZGF0ZU9uUmVuZGVyID09PSAnYXV0bycgfHwgdHJ1ZVxuICAgICAgICBjb25zdCB0b3VjaEFsbCA9IChjb250cm9sKSA9PiB7XG4gICAgICAgICAgaWYgKHZhbGlkYXRlT25SZW5kZXIgPT09IHRydWUgfHwgaGFzVmFsdWUoY29udHJvbC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnRyb2wubWFya0FzVG91Y2hlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBPYmplY3Qua2V5cyhjb250cm9sLmNvbnRyb2xzIHx8IHt9KVxuICAgICAgICAgICAgLmZvckVhY2goa2V5ID0+IHRvdWNoQWxsKGNvbnRyb2wuY29udHJvbHNba2V5XSkpO1xuICAgICAgICB9O1xuICAgICAgICB0b3VjaEFsbCh0aGlzLmpzZi5mb3JtR3JvdXApO1xuICAgICAgICB0aGlzLmlzVmFsaWQuZW1pdCh0aGlzLmpzZi5pc1ZhbGlkKTtcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzLmVtaXQodGhpcy5qc2YuYWp2RXJyb3JzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==