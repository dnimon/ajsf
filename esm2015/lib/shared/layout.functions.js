import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';
import { checkInlineType, getFromSchema, getInputType, isInputRequired, removeRecursiveReferences, updateInputOptions } from './json-schema.functions';
import { copy, fixTitle, forEach, hasOwn } from './utility.functions';
import { inArray, isArray, isDefined, isEmpty, isNumber, isObject, isString } from './validator.functions';
import { JsonPointer } from './jsonpointer.functions';
/**
 * Layout function library:
 *
 * buildLayout:            Builds a complete layout from an input layout and schema
 *
 * buildLayoutFromSchema:  Builds a complete layout entirely from an input schema
 *
 * mapLayout:
 *
 * getLayoutNode:
 *
 * buildTitleMap:
 */
/**
 * 'buildLayout' function
 *
 * //   jsf
 * //   widgetLibrary
 * //
 */
export function buildLayout(jsf, widgetLibrary) {
    let hasSubmitButton = !JsonPointer.get(jsf, '/formOptions/addSubmit');
    const formLayout = mapLayout(jsf.layout, (layoutItem, index, layoutPointer) => {
        const newNode = {
            _id: uniqueId(),
            options: {},
        };
        if (isObject(layoutItem)) {
            Object.assign(newNode, layoutItem);
            Object.keys(newNode)
                .filter(option => !inArray(option, [
                '_id', '$ref', 'arrayItem', 'arrayItemType', 'dataPointer', 'dataType',
                'items', 'key', 'name', 'options', 'recursiveReference', 'type', 'widget'
            ]))
                .forEach(option => {
                newNode.options[option] = newNode[option];
                delete newNode[option];
            });
            if (!hasOwn(newNode, 'type') && isString(newNode.widget)) {
                newNode.type = newNode.widget;
                delete newNode.widget;
            }
            if (!hasOwn(newNode.options, 'title')) {
                if (hasOwn(newNode.options, 'legend')) {
                    newNode.options.title = newNode.options.legend;
                    delete newNode.options.legend;
                }
            }
            if (!hasOwn(newNode.options, 'validationMessages')) {
                if (hasOwn(newNode.options, 'errorMessages')) {
                    newNode.options.validationMessages = newNode.options.errorMessages;
                    delete newNode.options.errorMessages;
                    // Convert Angular Schema Form (AngularJS) 'validationMessage' to
                    // Angular JSON Schema Form 'validationMessages'
                    // TV4 codes from https://github.com/geraintluff/tv4/blob/master/source/api.js
                }
                else if (hasOwn(newNode.options, 'validationMessage')) {
                    if (typeof newNode.options.validationMessage === 'string') {
                        newNode.options.validationMessages = newNode.options.validationMessage;
                    }
                    else {
                        newNode.options.validationMessages = {};
                        Object.keys(newNode.options.validationMessage).forEach(key => {
                            const code = key + '';
                            const newKey = code === '0' ? 'type' :
                                code === '1' ? 'enum' :
                                    code === '100' ? 'multipleOf' :
                                        code === '101' ? 'minimum' :
                                            code === '102' ? 'exclusiveMinimum' :
                                                code === '103' ? 'maximum' :
                                                    code === '104' ? 'exclusiveMaximum' :
                                                        code === '200' ? 'minLength' :
                                                            code === '201' ? 'maxLength' :
                                                                code === '202' ? 'pattern' :
                                                                    code === '300' ? 'minProperties' :
                                                                        code === '301' ? 'maxProperties' :
                                                                            code === '302' ? 'required' :
                                                                                code === '304' ? 'dependencies' :
                                                                                    code === '400' ? 'minItems' :
                                                                                        code === '401' ? 'maxItems' :
                                                                                            code === '402' ? 'uniqueItems' :
                                                                                                code === '500' ? 'format' : code + '';
                            newNode.options.validationMessages[newKey] = newNode.options.validationMessage[key];
                        });
                    }
                    delete newNode.options.validationMessage;
                }
            }
        }
        else if (JsonPointer.isJsonPointer(layoutItem)) {
            newNode.dataPointer = layoutItem;
        }
        else if (isString(layoutItem)) {
            newNode.key = layoutItem;
        }
        else {
            console.error('buildLayout error: Form layout element not recognized:');
            console.error(layoutItem);
            return null;
        }
        let nodeSchema = null;
        // If newNode does not have a dataPointer, try to find an equivalent
        if (!hasOwn(newNode, 'dataPointer')) {
            // If newNode has a key, change it to a dataPointer
            if (hasOwn(newNode, 'key')) {
                newNode.dataPointer = newNode.key === '*' ? newNode.key :
                    JsonPointer.compile(JsonPointer.parseObjectPath(newNode.key), '-');
                delete newNode.key;
                // If newNode is an array, search for dataPointer in child nodes
            }
            else if (hasOwn(newNode, 'type') && newNode.type.slice(-5) === 'array') {
                const findDataPointer = (items) => {
                    if (items === null || typeof items !== 'object') {
                        return;
                    }
                    if (hasOwn(items, 'dataPointer')) {
                        return items.dataPointer;
                    }
                    if (isArray(items.items)) {
                        for (const item of items.items) {
                            if (hasOwn(item, 'dataPointer') && item.dataPointer.indexOf('/-') !== -1) {
                                return item.dataPointer;
                            }
                            if (hasOwn(item, 'items')) {
                                const searchItem = findDataPointer(item);
                                if (searchItem) {
                                    return searchItem;
                                }
                            }
                        }
                    }
                };
                const childDataPointer = findDataPointer(newNode);
                if (childDataPointer) {
                    newNode.dataPointer =
                        childDataPointer.slice(0, childDataPointer.lastIndexOf('/-'));
                }
            }
        }
        if (hasOwn(newNode, 'dataPointer')) {
            if (newNode.dataPointer === '*') {
                return buildLayoutFromSchema(jsf, widgetLibrary, jsf.formValues);
            }
            const nodeValue = JsonPointer.get(jsf.formValues, newNode.dataPointer.replace(/\/-/g, '/1'));
            // TODO: Create function getFormValues(jsf, dataPointer, forRefLibrary)
            // check formOptions.setSchemaDefaults and formOptions.setLayoutDefaults
            // then set apropriate values from initialVaues, schema, or layout
            newNode.dataPointer =
                JsonPointer.toGenericPointer(newNode.dataPointer, jsf.arrayMap);
            const LastKey = JsonPointer.toKey(newNode.dataPointer);
            if (!newNode.name && isString(LastKey) && LastKey !== '-') {
                newNode.name = LastKey;
            }
            const shortDataPointer = removeRecursiveReferences(newNode.dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
            const recursive = !shortDataPointer.length ||
                shortDataPointer !== newNode.dataPointer;
            let schemaPointer;
            if (!jsf.dataMap.has(shortDataPointer)) {
                jsf.dataMap.set(shortDataPointer, new Map());
            }
            const nodeDataMap = jsf.dataMap.get(shortDataPointer);
            if (nodeDataMap.has('schemaPointer')) {
                schemaPointer = nodeDataMap.get('schemaPointer');
            }
            else {
                schemaPointer = JsonPointer.toSchemaPointer(shortDataPointer, jsf.schema);
                nodeDataMap.set('schemaPointer', schemaPointer);
            }
            nodeDataMap.set('disabled', !!newNode.options.disabled);
            nodeSchema = JsonPointer.get(jsf.schema, schemaPointer);
            if (nodeSchema) {
                if (!hasOwn(newNode, 'type')) {
                    newNode.type = getInputType(nodeSchema, newNode);
                }
                else if (!widgetLibrary.hasWidget(newNode.type)) {
                    const oldWidgetType = newNode.type;
                    newNode.type = getInputType(nodeSchema, newNode);
                    console.error(`error: widget type "${oldWidgetType}" ` +
                        `not found in library. Replacing with "${newNode.type}".`);
                }
                else {
                    newNode.type = checkInlineType(newNode.type, nodeSchema, newNode);
                }
                if (nodeSchema.type === 'object' && isArray(nodeSchema.required)) {
                    nodeDataMap.set('required', nodeSchema.required);
                }
                newNode.dataType =
                    nodeSchema.type || (hasOwn(nodeSchema, '$ref') ? '$ref' : null);
                updateInputOptions(newNode, nodeSchema, jsf);
                // Present checkboxes as single control, rather than array
                if (newNode.type === 'checkboxes' && hasOwn(nodeSchema, 'items')) {
                    updateInputOptions(newNode, nodeSchema.items, jsf);
                }
                else if (newNode.dataType === 'array') {
                    newNode.options.maxItems = Math.min(nodeSchema.maxItems || 1000, newNode.options.maxItems || 1000);
                    newNode.options.minItems = Math.max(nodeSchema.minItems || 0, newNode.options.minItems || 0);
                    newNode.options.listItems = Math.max(newNode.options.listItems || 0, isArray(nodeValue) ? nodeValue.length : 0);
                    newNode.options.tupleItems =
                        isArray(nodeSchema.items) ? nodeSchema.items.length : 0;
                    if (newNode.options.maxItems < newNode.options.tupleItems) {
                        newNode.options.tupleItems = newNode.options.maxItems;
                        newNode.options.listItems = 0;
                    }
                    else if (newNode.options.maxItems <
                        newNode.options.tupleItems + newNode.options.listItems) {
                        newNode.options.listItems =
                            newNode.options.maxItems - newNode.options.tupleItems;
                    }
                    else if (newNode.options.minItems >
                        newNode.options.tupleItems + newNode.options.listItems) {
                        newNode.options.listItems =
                            newNode.options.minItems - newNode.options.tupleItems;
                    }
                    if (!nodeDataMap.has('maxItems')) {
                        nodeDataMap.set('maxItems', newNode.options.maxItems);
                        nodeDataMap.set('minItems', newNode.options.minItems);
                        nodeDataMap.set('tupleItems', newNode.options.tupleItems);
                        nodeDataMap.set('listItems', newNode.options.listItems);
                    }
                    if (!jsf.arrayMap.has(shortDataPointer)) {
                        jsf.arrayMap.set(shortDataPointer, newNode.options.tupleItems);
                    }
                }
                if (isInputRequired(jsf.schema, schemaPointer)) {
                    newNode.options.required = true;
                    jsf.fieldsRequired = true;
                }
            }
            else {
                // TODO: create item in FormGroup model from layout key (?)
                updateInputOptions(newNode, {}, jsf);
            }
            if (!newNode.options.title && !/^\d+$/.test(newNode.name)) {
                newNode.options.title = fixTitle(newNode.name);
            }
            if (hasOwn(newNode.options, 'copyValueTo')) {
                if (typeof newNode.options.copyValueTo === 'string') {
                    newNode.options.copyValueTo = [newNode.options.copyValueTo];
                }
                if (isArray(newNode.options.copyValueTo)) {
                    newNode.options.copyValueTo = newNode.options.copyValueTo.map(item => JsonPointer.compile(JsonPointer.parseObjectPath(item), '-'));
                }
            }
            newNode.widget = widgetLibrary.getWidget(newNode.type);
            nodeDataMap.set('inputType', newNode.type);
            nodeDataMap.set('widget', newNode.widget);
            if (newNode.dataType === 'array' &&
                (hasOwn(newNode, 'items') || hasOwn(newNode, 'additionalItems'))) {
                const itemRefPointer = removeRecursiveReferences(newNode.dataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                if (!jsf.dataMap.has(itemRefPointer)) {
                    jsf.dataMap.set(itemRefPointer, new Map());
                }
                jsf.dataMap.get(itemRefPointer).set('inputType', 'section');
                // Fix insufficiently nested array item groups
                if (newNode.items.length > 1) {
                    const arrayItemGroup = [];
                    for (let i = newNode.items.length - 1; i >= 0; i--) {
                        const subItem = newNode.items[i];
                        if (hasOwn(subItem, 'dataPointer') &&
                            subItem.dataPointer.slice(0, itemRefPointer.length) === itemRefPointer) {
                            const arrayItem = newNode.items.splice(i, 1)[0];
                            arrayItem.dataPointer = newNode.dataPointer + '/-' +
                                arrayItem.dataPointer.slice(itemRefPointer.length);
                            arrayItemGroup.unshift(arrayItem);
                        }
                        else {
                            subItem.arrayItem = true;
                            // TODO: Check schema to get arrayItemType and removable
                            subItem.arrayItemType = 'list';
                            subItem.removable = newNode.options.removable !== false;
                        }
                    }
                    if (arrayItemGroup.length) {
                        newNode.items.push({
                            _id: uniqueId(),
                            arrayItem: true,
                            arrayItemType: newNode.options.tupleItems > newNode.items.length ?
                                'tuple' : 'list',
                            items: arrayItemGroup,
                            options: { removable: newNode.options.removable !== false, },
                            dataPointer: newNode.dataPointer + '/-',
                            type: 'section',
                            widget: widgetLibrary.getWidget('section'),
                        });
                    }
                }
                else {
                    // TODO: Fix to hndle multiple items
                    newNode.items[0].arrayItem = true;
                    if (!newNode.items[0].dataPointer) {
                        newNode.items[0].dataPointer =
                            JsonPointer.toGenericPointer(itemRefPointer, jsf.arrayMap);
                    }
                    if (!JsonPointer.has(newNode, '/items/0/options/removable')) {
                        newNode.items[0].options.removable = true;
                    }
                    if (newNode.options.orderable === false) {
                        newNode.items[0].options.orderable = false;
                    }
                    newNode.items[0].arrayItemType =
                        newNode.options.tupleItems ? 'tuple' : 'list';
                }
                if (isArray(newNode.items)) {
                    const arrayListItems = newNode.items.filter(item => item.type !== '$ref').length -
                        newNode.options.tupleItems;
                    if (arrayListItems > newNode.options.listItems) {
                        newNode.options.listItems = arrayListItems;
                        nodeDataMap.set('listItems', arrayListItems);
                    }
                }
                if (!hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                    jsf.layoutRefLibrary[itemRefPointer] =
                        cloneDeep(newNode.items[newNode.items.length - 1]);
                    if (recursive) {
                        jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                    }
                    forEach(jsf.layoutRefLibrary[itemRefPointer], (item, key) => {
                        if (hasOwn(item, '_id')) {
                            item._id = null;
                        }
                        if (recursive) {
                            if (hasOwn(item, 'dataPointer')) {
                                item.dataPointer = item.dataPointer.slice(itemRefPointer.length);
                            }
                        }
                    }, 'top-down');
                }
                // Add any additional default items
                if (!newNode.recursiveReference || newNode.options.required) {
                    const arrayLength = Math.min(Math.max(newNode.options.tupleItems + newNode.options.listItems, isArray(nodeValue) ? nodeValue.length : 0), newNode.options.maxItems);
                    for (let i = newNode.items.length; i < arrayLength; i++) {
                        newNode.items.push(getLayoutNode({
                            $ref: itemRefPointer,
                            dataPointer: newNode.dataPointer,
                            recursiveReference: newNode.recursiveReference,
                        }, jsf, widgetLibrary));
                    }
                }
                // If needed, add button to add items to array
                if (newNode.options.addable !== false &&
                    newNode.options.minItems < newNode.options.maxItems &&
                    (newNode.items[newNode.items.length - 1] || {}).type !== '$ref') {
                    let buttonText = 'Add';
                    if (newNode.options.title) {
                        if (/^add\b/i.test(newNode.options.title)) {
                            buttonText = newNode.options.title;
                        }
                        else {
                            buttonText += ' ' + newNode.options.title;
                        }
                    }
                    else if (newNode.name && !/^\d+$/.test(newNode.name)) {
                        if (/^add\b/i.test(newNode.name)) {
                            buttonText += ' ' + fixTitle(newNode.name);
                        }
                        else {
                            buttonText = fixTitle(newNode.name);
                        }
                        // If newNode doesn't have a title, look for title of parent array item
                    }
                    else {
                        const parentSchema = getFromSchema(jsf.schema, newNode.dataPointer, 'parentSchema');
                        if (hasOwn(parentSchema, 'title')) {
                            buttonText += ' to ' + parentSchema.title;
                        }
                        else {
                            const pointerArray = JsonPointer.parse(newNode.dataPointer);
                            buttonText += ' to ' + fixTitle(pointerArray[pointerArray.length - 2]);
                        }
                    }
                    newNode.items.push({
                        _id: uniqueId(),
                        arrayItem: true,
                        arrayItemType: 'list',
                        dataPointer: newNode.dataPointer + '/-',
                        options: {
                            listItems: newNode.options.listItems,
                            maxItems: newNode.options.maxItems,
                            minItems: newNode.options.minItems,
                            removable: false,
                            title: buttonText,
                            tupleItems: newNode.options.tupleItems,
                        },
                        recursiveReference: recursive,
                        type: '$ref',
                        widget: widgetLibrary.getWidget('$ref'),
                        $ref: itemRefPointer,
                    });
                    if (isString(JsonPointer.get(newNode, '/style/add'))) {
                        newNode.items[newNode.items.length - 1].options.fieldStyle =
                            newNode.style.add;
                        delete newNode.style.add;
                        if (isEmpty(newNode.style)) {
                            delete newNode.style;
                        }
                    }
                }
            }
            else {
                newNode.arrayItem = false;
            }
        }
        else if (hasOwn(newNode, 'type') || hasOwn(newNode, 'items')) {
            const parentType = JsonPointer.get(jsf.layout, layoutPointer, 0, -2).type;
            if (!hasOwn(newNode, 'type')) {
                newNode.type =
                    inArray(parentType, ['tabs', 'tabarray']) ? 'tab' : 'array';
            }
            newNode.arrayItem = parentType === 'array';
            newNode.widget = widgetLibrary.getWidget(newNode.type);
            updateInputOptions(newNode, {}, jsf);
        }
        if (newNode.type === 'submit') {
            hasSubmitButton = true;
        }
        return newNode;
    });
    if (jsf.hasRootReference) {
        const fullLayout = cloneDeep(formLayout);
        if (fullLayout[fullLayout.length - 1].type === 'submit') {
            fullLayout.pop();
        }
        jsf.layoutRefLibrary[''] = {
            _id: null,
            dataPointer: '',
            dataType: 'object',
            items: fullLayout,
            name: '',
            options: cloneDeep(jsf.formOptions.defautWidgetOptions),
            recursiveReference: true,
            required: false,
            type: 'section',
            widget: widgetLibrary.getWidget('section'),
        };
    }
    if (!hasSubmitButton) {
        formLayout.push({
            _id: uniqueId(),
            options: { title: 'Submit' },
            type: 'submit',
            widget: widgetLibrary.getWidget('submit'),
        });
    }
    return formLayout;
}
/**
 * 'buildLayoutFromSchema' function
 *
 * //   jsf -
 * //   widgetLibrary -
 * //   nodeValue -
 * //  { string = '' } schemaPointer -
 * //  { string = '' } dataPointer -
 * //  { boolean = false } arrayItem -
 * //  { string = null } arrayItemType -
 * //  { boolean = null } removable -
 * //  { boolean = false } forRefLibrary -
 * //  { string = '' } dataPointerPrefix -
 * //
 */
export function buildLayoutFromSchema(jsf, widgetLibrary, nodeValue = null, schemaPointer = '', dataPointer = '', arrayItem = false, arrayItemType = null, removable = null, forRefLibrary = false, dataPointerPrefix = '') {
    const schema = JsonPointer.get(jsf.schema, schemaPointer);
    if (!hasOwn(schema, 'type') && !hasOwn(schema, '$ref') &&
        !hasOwn(schema, 'x-schema-form')) {
        return null;
    }
    const newNodeType = getInputType(schema);
    if (!isDefined(nodeValue) && (jsf.formOptions.setSchemaDefaults === true ||
        (jsf.formOptions.setSchemaDefaults === 'auto' && isEmpty(jsf.formValues)))) {
        nodeValue = JsonPointer.get(jsf.schema, schemaPointer + '/default');
    }
    let newNode = {
        _id: forRefLibrary ? null : uniqueId(),
        arrayItem: arrayItem,
        dataPointer: JsonPointer.toGenericPointer(dataPointer, jsf.arrayMap),
        dataType: schema.type || (hasOwn(schema, '$ref') ? '$ref' : null),
        options: {},
        required: isInputRequired(jsf.schema, schemaPointer),
        type: newNodeType,
        widget: widgetLibrary.getWidget(newNodeType),
    };
    const lastDataKey = JsonPointer.toKey(newNode.dataPointer);
    if (lastDataKey !== '-') {
        newNode.name = lastDataKey;
    }
    if (newNode.arrayItem) {
        newNode.arrayItemType = arrayItemType;
        newNode.options.removable = removable !== false;
    }
    const shortDataPointer = removeRecursiveReferences(dataPointerPrefix + dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    const recursive = !shortDataPointer.length ||
        shortDataPointer !== dataPointerPrefix + dataPointer;
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    const nodeDataMap = jsf.dataMap.get(shortDataPointer);
    if (!nodeDataMap.has('inputType')) {
        nodeDataMap.set('schemaPointer', schemaPointer);
        nodeDataMap.set('inputType', newNode.type);
        nodeDataMap.set('widget', newNode.widget);
        nodeDataMap.set('disabled', !!newNode.options.disabled);
    }
    updateInputOptions(newNode, schema, jsf);
    if (!newNode.options.title && newNode.name && !/^\d+$/.test(newNode.name)) {
        newNode.options.title = fixTitle(newNode.name);
    }
    if (newNode.dataType === 'object') {
        if (isArray(schema.required) && !nodeDataMap.has('required')) {
            nodeDataMap.set('required', schema.required);
        }
        if (isObject(schema.properties)) {
            const newSection = [];
            const propertyKeys = schema['ui:order'] || Object.keys(schema.properties);
            if (propertyKeys.includes('*') && !hasOwn(schema.properties, '*')) {
                const unnamedKeys = Object.keys(schema.properties)
                    .filter(key => !propertyKeys.includes(key));
                for (let i = propertyKeys.length - 1; i >= 0; i--) {
                    if (propertyKeys[i] === '*') {
                        propertyKeys.splice(i, 1, ...unnamedKeys);
                    }
                }
            }
            propertyKeys
                .filter(key => hasOwn(schema.properties, key) ||
                hasOwn(schema, 'additionalProperties'))
                .forEach(key => {
                const keySchemaPointer = hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties';
                const innerItem = buildLayoutFromSchema(jsf, widgetLibrary, isObject(nodeValue) ? nodeValue[key] : null, schemaPointer + keySchemaPointer, dataPointer + '/' + key, false, null, null, forRefLibrary, dataPointerPrefix);
                if (innerItem) {
                    if (isInputRequired(schema, '/' + key)) {
                        innerItem.options.required = true;
                        jsf.fieldsRequired = true;
                    }
                    newSection.push(innerItem);
                }
            });
            if (dataPointer === '' && !forRefLibrary) {
                newNode = newSection;
            }
            else {
                newNode.items = newSection;
            }
        }
        // TODO: Add patternProperties and additionalProperties inputs?
        // ... possibly provide a way to enter both key names and values?
        // if (isObject(schema.patternProperties)) { }
        // if (isObject(schema.additionalProperties)) { }
    }
    else if (newNode.dataType === 'array') {
        newNode.items = [];
        newNode.options.maxItems = Math.min(schema.maxItems || 1000, newNode.options.maxItems || 1000);
        newNode.options.minItems = Math.max(schema.minItems || 0, newNode.options.minItems || 0);
        if (!newNode.options.minItems && isInputRequired(jsf.schema, schemaPointer)) {
            newNode.options.minItems = 1;
        }
        if (!hasOwn(newNode.options, 'listItems')) {
            newNode.options.listItems = 1;
        }
        newNode.options.tupleItems = isArray(schema.items) ? schema.items.length : 0;
        if (newNode.options.maxItems <= newNode.options.tupleItems) {
            newNode.options.tupleItems = newNode.options.maxItems;
            newNode.options.listItems = 0;
        }
        else if (newNode.options.maxItems <
            newNode.options.tupleItems + newNode.options.listItems) {
            newNode.options.listItems = newNode.options.maxItems - newNode.options.tupleItems;
        }
        else if (newNode.options.minItems >
            newNode.options.tupleItems + newNode.options.listItems) {
            newNode.options.listItems = newNode.options.minItems - newNode.options.tupleItems;
        }
        if (!nodeDataMap.has('maxItems')) {
            nodeDataMap.set('maxItems', newNode.options.maxItems);
            nodeDataMap.set('minItems', newNode.options.minItems);
            nodeDataMap.set('tupleItems', newNode.options.tupleItems);
            nodeDataMap.set('listItems', newNode.options.listItems);
        }
        if (!jsf.arrayMap.has(shortDataPointer)) {
            jsf.arrayMap.set(shortDataPointer, newNode.options.tupleItems);
        }
        removable = newNode.options.removable !== false;
        let additionalItemsSchemaPointer = null;
        // If 'items' is an array = tuple items
        if (isArray(schema.items)) {
            newNode.items = [];
            for (let i = 0; i < newNode.options.tupleItems; i++) {
                let newItem;
                const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                const itemRecursive = !itemRefPointer.length ||
                    itemRefPointer !== shortDataPointer + '/' + i;
                // If removable, add tuple item layout to layoutRefLibrary
                if (removable && i >= newNode.options.minItems) {
                    if (!hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                        // Set to null first to prevent recursive reference from causing endless loop
                        jsf.layoutRefLibrary[itemRefPointer] = null;
                        jsf.layoutRefLibrary[itemRefPointer] = buildLayoutFromSchema(jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null, schemaPointer + '/items/' + i, itemRecursive ? '' : dataPointer + '/' + i, true, 'tuple', true, true, itemRecursive ? dataPointer + '/' + i : '');
                        if (itemRecursive) {
                            jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                        }
                    }
                    newItem = getLayoutNode({
                        $ref: itemRefPointer,
                        dataPointer: dataPointer + '/' + i,
                        recursiveReference: itemRecursive,
                    }, jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null);
                }
                else {
                    newItem = buildLayoutFromSchema(jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null, schemaPointer + '/items/' + i, dataPointer + '/' + i, true, 'tuple', false, forRefLibrary, dataPointerPrefix);
                }
                if (newItem) {
                    newNode.items.push(newItem);
                }
            }
            // If 'additionalItems' is an object = additional list items, after tuple items
            if (isObject(schema.additionalItems)) {
                additionalItemsSchemaPointer = schemaPointer + '/additionalItems';
            }
            // If 'items' is an object = list items only (no tuple items)
        }
        else if (isObject(schema.items)) {
            additionalItemsSchemaPointer = schemaPointer + '/items';
        }
        if (additionalItemsSchemaPointer) {
            const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
            const itemRecursive = !itemRefPointer.length ||
                itemRefPointer !== shortDataPointer + '/-';
            const itemSchemaPointer = removeRecursiveReferences(additionalItemsSchemaPointer, jsf.schemaRecursiveRefMap, jsf.arrayMap);
            // Add list item layout to layoutRefLibrary
            if (itemRefPointer.length && !hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.layoutRefLibrary[itemRefPointer] = null;
                jsf.layoutRefLibrary[itemRefPointer] = buildLayoutFromSchema(jsf, widgetLibrary, null, itemSchemaPointer, itemRecursive ? '' : dataPointer + '/-', true, 'list', removable, true, itemRecursive ? dataPointer + '/-' : '');
                if (itemRecursive) {
                    jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                }
            }
            // Add any additional default items
            if (!itemRecursive || newNode.options.required) {
                const arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                    newNode.options.tupleItems + newNode.options.listItems, isArray(nodeValue) ? nodeValue.length : 0), newNode.options.maxItems);
                if (newNode.items.length < arrayLength) {
                    for (let i = newNode.items.length; i < arrayLength; i++) {
                        newNode.items.push(getLayoutNode({
                            $ref: itemRefPointer,
                            dataPointer: dataPointer + '/-',
                            recursiveReference: itemRecursive,
                        }, jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null));
                    }
                }
            }
            // If needed, add button to add items to array
            if (newNode.options.addable !== false &&
                newNode.options.minItems < newNode.options.maxItems &&
                (newNode.items[newNode.items.length - 1] || {}).type !== '$ref') {
                let buttonText = ((jsf.layoutRefLibrary[itemRefPointer] || {}).options || {}).title;
                const prefix = buttonText ? 'Add ' : 'Add to ';
                if (!buttonText) {
                    buttonText = schema.title || fixTitle(JsonPointer.toKey(dataPointer));
                }
                if (!/^add\b/i.test(buttonText)) {
                    buttonText = prefix + buttonText;
                }
                newNode.items.push({
                    _id: uniqueId(),
                    arrayItem: true,
                    arrayItemType: 'list',
                    dataPointer: newNode.dataPointer + '/-',
                    options: {
                        listItems: newNode.options.listItems,
                        maxItems: newNode.options.maxItems,
                        minItems: newNode.options.minItems,
                        removable: false,
                        title: buttonText,
                        tupleItems: newNode.options.tupleItems,
                    },
                    recursiveReference: itemRecursive,
                    type: '$ref',
                    widget: widgetLibrary.getWidget('$ref'),
                    $ref: itemRefPointer,
                });
            }
        }
    }
    else if (newNode.dataType === '$ref') {
        const schemaRef = JsonPointer.compile(schema.$ref);
        const dataRef = JsonPointer.toDataPointer(schemaRef, jsf.schema);
        let buttonText = '';
        // Get newNode title
        if (newNode.options.add) {
            buttonText = newNode.options.add;
        }
        else if (newNode.name && !/^\d+$/.test(newNode.name)) {
            buttonText =
                (/^add\b/i.test(newNode.name) ? '' : 'Add ') + fixTitle(newNode.name);
            // If newNode doesn't have a title, look for title of parent array item
        }
        else {
            const parentSchema = JsonPointer.get(jsf.schema, schemaPointer, 0, -1);
            if (hasOwn(parentSchema, 'title')) {
                buttonText = 'Add to ' + parentSchema.title;
            }
            else {
                const pointerArray = JsonPointer.parse(newNode.dataPointer);
                buttonText = 'Add to ' + fixTitle(pointerArray[pointerArray.length - 2]);
            }
        }
        Object.assign(newNode, {
            recursiveReference: true,
            widget: widgetLibrary.getWidget('$ref'),
            $ref: dataRef,
        });
        Object.assign(newNode.options, {
            removable: false,
            title: buttonText,
        });
        if (isNumber(JsonPointer.get(jsf.schema, schemaPointer, 0, -1).maxItems)) {
            newNode.options.maxItems =
                JsonPointer.get(jsf.schema, schemaPointer, 0, -1).maxItems;
        }
        // Add layout template to layoutRefLibrary
        if (dataRef.length) {
            if (!hasOwn(jsf.layoutRefLibrary, dataRef)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.layoutRefLibrary[dataRef] = null;
                const newLayout = buildLayoutFromSchema(jsf, widgetLibrary, null, schemaRef, '', newNode.arrayItem, newNode.arrayItemType, true, true, dataPointer);
                if (newLayout) {
                    newLayout.recursiveReference = true;
                    jsf.layoutRefLibrary[dataRef] = newLayout;
                }
                else {
                    delete jsf.layoutRefLibrary[dataRef];
                }
            }
            else if (!jsf.layoutRefLibrary[dataRef].recursiveReference) {
                jsf.layoutRefLibrary[dataRef].recursiveReference = true;
            }
        }
    }
    return newNode;
}
/**
 * 'mapLayout' function
 *
 * Creates a new layout by running each element in an existing layout through
 * an iteratee. Recursively maps within array elements 'items' and 'tabs'.
 * The iteratee is invoked with four arguments: (value, index, layout, path)
 *
 * The returned layout may be longer (or shorter) then the source layout.
 *
 * If an item from the source layout returns multiple items (as '*' usually will),
 * this function will keep all returned items in-line with the surrounding items.
 *
 * If an item from the source layout causes an error and returns null, it is
 * skipped without error, and the function will still return all non-null items.
 *
 * //   layout - the layout to map
 * //  { (v: any, i?: number, l?: any, p?: string) => any }
 *   function - the funciton to invoke on each element
 * //  { string|string[] = '' } layoutPointer - the layoutPointer to layout, inside rootLayout
 * //  { any[] = layout } rootLayout - the root layout, which conatins layout
 * //
 */
export function mapLayout(layout, fn, layoutPointer = '', rootLayout = layout) {
    let indexPad = 0;
    let newLayout = [];
    forEach(layout, (item, index) => {
        const realIndex = +index + indexPad;
        const newLayoutPointer = layoutPointer + '/' + realIndex;
        let newNode = copy(item);
        let itemsArray = [];
        if (isObject(item)) {
            if (hasOwn(item, 'tabs')) {
                item.items = item.tabs;
                delete item.tabs;
            }
            if (hasOwn(item, 'items')) {
                itemsArray = isArray(item.items) ? item.items : [item.items];
            }
        }
        if (itemsArray.length) {
            newNode.items = mapLayout(itemsArray, fn, newLayoutPointer + '/items', rootLayout);
        }
        newNode = fn(newNode, realIndex, newLayoutPointer, rootLayout);
        if (!isDefined(newNode)) {
            indexPad--;
        }
        else {
            if (isArray(newNode)) {
                indexPad += newNode.length - 1;
            }
            newLayout = newLayout.concat(newNode);
        }
    });
    return newLayout;
}
/**
 * 'getLayoutNode' function
 * Copy a new layoutNode from layoutRefLibrary
 *
 * //   refNode -
 * //   layoutRefLibrary -
 * //  { any = null } widgetLibrary -
 * //  { any = null } nodeValue -
 * //  copied layoutNode
 */
export function getLayoutNode(refNode, jsf, widgetLibrary = null, nodeValue = null) {
    // If recursive reference and building initial layout, return Add button
    if (refNode.recursiveReference && widgetLibrary) {
        const newLayoutNode = cloneDeep(refNode);
        if (!newLayoutNode.options) {
            newLayoutNode.options = {};
        }
        Object.assign(newLayoutNode, {
            recursiveReference: true,
            widget: widgetLibrary.getWidget('$ref'),
        });
        Object.assign(newLayoutNode.options, {
            removable: false,
            title: 'Add ' + newLayoutNode.$ref,
        });
        return newLayoutNode;
        // Otherwise, return referenced layout
    }
    else {
        let newLayoutNode = jsf.layoutRefLibrary[refNode.$ref];
        // If value defined, build new node from schema (to set array lengths)
        if (isDefined(nodeValue)) {
            newLayoutNode = buildLayoutFromSchema(jsf, widgetLibrary, nodeValue, JsonPointer.toSchemaPointer(refNode.$ref, jsf.schema), refNode.$ref, newLayoutNode.arrayItem, newLayoutNode.arrayItemType, newLayoutNode.options.removable, false);
        }
        else {
            // If value not defined, copy node from layoutRefLibrary
            newLayoutNode = cloneDeep(newLayoutNode);
            JsonPointer.forEachDeep(newLayoutNode, (subNode, pointer) => {
                // Reset all _id's in newLayoutNode to unique values
                if (hasOwn(subNode, '_id')) {
                    subNode._id = uniqueId();
                }
                // If adding a recursive item, prefix current dataPointer
                // to all dataPointers in new layoutNode
                if (refNode.recursiveReference && hasOwn(subNode, 'dataPointer')) {
                    subNode.dataPointer = refNode.dataPointer + subNode.dataPointer;
                }
            });
        }
        return newLayoutNode;
    }
}
/**
 * 'buildTitleMap' function
 *
 * //   titleMap -
 * //   enumList -
 * //  { boolean = true } fieldRequired -
 * //  { boolean = true } flatList -
 * // { TitleMapItem[] }
 */
export function buildTitleMap(titleMap, enumList, fieldRequired = true, flatList = true) {
    let newTitleMap = [];
    let hasEmptyValue = false;
    if (titleMap) {
        if (isArray(titleMap)) {
            if (enumList) {
                for (const i of Object.keys(titleMap)) {
                    if (isObject(titleMap[i])) { // JSON Form style
                        const value = titleMap[i].value;
                        if (enumList.includes(value)) {
                            const name = titleMap[i].name;
                            newTitleMap.push({ name, value });
                            if (value === undefined || value === null) {
                                hasEmptyValue = true;
                            }
                        }
                    }
                    else if (isString(titleMap[i])) { // React Jsonschema Form style
                        if (i < enumList.length) {
                            const name = titleMap[i];
                            const value = enumList[i];
                            newTitleMap.push({ name, value });
                            if (value === undefined || value === null) {
                                hasEmptyValue = true;
                            }
                        }
                    }
                }
            }
            else { // If array titleMap and no enum list, just return the titleMap - Angular Schema Form style
                newTitleMap = titleMap;
                if (!fieldRequired) {
                    hasEmptyValue = !!newTitleMap
                        .filter(i => i.value === undefined || i.value === null)
                        .length;
                }
            }
        }
        else if (enumList) { // Alternate JSON Form style, with enum list
            for (const i of Object.keys(enumList)) {
                const value = enumList[i];
                if (hasOwn(titleMap, value)) {
                    const name = titleMap[value];
                    newTitleMap.push({ name, value });
                    if (value === undefined || value === null) {
                        hasEmptyValue = true;
                    }
                }
            }
        }
        else { // Alternate JSON Form style, without enum list
            for (const value of Object.keys(titleMap)) {
                const name = titleMap[value];
                newTitleMap.push({ name, value });
                if (value === undefined || value === null) {
                    hasEmptyValue = true;
                }
            }
        }
    }
    else if (enumList) { // Build map from enum list alone
        for (const i of Object.keys(enumList)) {
            const name = enumList[i];
            const value = enumList[i];
            newTitleMap.push({ name, value });
            if (value === undefined || value === null) {
                hasEmptyValue = true;
            }
        }
    }
    else { // If no titleMap and no enum list, return default map of boolean values
        newTitleMap = [{ name: 'True', value: true }, { name: 'False', value: false }];
    }
    // Does titleMap have groups?
    if (newTitleMap.some(title => hasOwn(title, 'group'))) {
        hasEmptyValue = false;
        // If flatList = true, flatten items & update name to group: name
        if (flatList) {
            newTitleMap = newTitleMap.reduce((groupTitleMap, title) => {
                if (hasOwn(title, 'group')) {
                    if (isArray(title.items)) {
                        groupTitleMap = [
                            ...groupTitleMap,
                            ...title.items.map(item => (Object.assign(Object.assign({}, item), { name: `${title.group}: ${item.name}` })))
                        ];
                        if (title.items.some(item => item.value === undefined || item.value === null)) {
                            hasEmptyValue = true;
                        }
                    }
                    if (hasOwn(title, 'name') && hasOwn(title, 'value')) {
                        title.name = `${title.group}: ${title.name}`;
                        delete title.group;
                        groupTitleMap.push(title);
                        if (title.value === undefined || title.value === null) {
                            hasEmptyValue = true;
                        }
                    }
                }
                else {
                    groupTitleMap.push(title);
                    if (title.value === undefined || title.value === null) {
                        hasEmptyValue = true;
                    }
                }
                return groupTitleMap;
            }, []);
            // If flatList = false, combine items from matching groups
        }
        else {
            newTitleMap = newTitleMap.reduce((groupTitleMap, title) => {
                if (hasOwn(title, 'group')) {
                    if (title.group !== (groupTitleMap[groupTitleMap.length - 1] || {}).group) {
                        groupTitleMap.push({ group: title.group, items: title.items || [] });
                    }
                    if (hasOwn(title, 'name') && hasOwn(title, 'value')) {
                        groupTitleMap[groupTitleMap.length - 1].items
                            .push({ name: title.name, value: title.value });
                        if (title.value === undefined || title.value === null) {
                            hasEmptyValue = true;
                        }
                    }
                }
                else {
                    groupTitleMap.push(title);
                    if (title.value === undefined || title.value === null) {
                        hasEmptyValue = true;
                    }
                }
                return groupTitleMap;
            }, []);
        }
    }
    if (!fieldRequired && !hasEmptyValue) {
        newTitleMap.unshift({ name: '<em>None</em>', value: null });
    }
    return newTitleMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIvaG9tZS9kbmltb24vRG9jdW1lbnRzL2dpdC9jb252ZXBheS9hanNmL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvIiwic291cmNlcyI6WyJsaWIvc2hhcmVkL2xheW91dC5mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxFQUNMLGVBQWUsRUFDZixhQUFhLEVBQ2IsWUFBWSxFQUNaLGVBQWUsRUFDZix5QkFBeUIsRUFDekIsa0JBQWtCLEVBQ2pCLE1BQU0seUJBQXlCLENBQUM7QUFDbkMsT0FBTyxFQUNMLElBQUksRUFDSixRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTCxNQUFNLHFCQUFxQixDQUFDO0FBQy9CLE9BQU8sRUFDTCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFNBQVMsRUFDVCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1AsTUFBTSx1QkFBdUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFLdEQ7Ozs7Ozs7Ozs7OztHQVlHO0FBRUg7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFdBQVcsQ0FBQyxHQUFHLEVBQUUsYUFBYTtJQUM1QyxJQUFJLGVBQWUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDdEUsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFO1FBQzVFLE1BQU0sT0FBTyxHQUFRO1lBQ25CLEdBQUcsRUFBRSxRQUFRLEVBQUU7WUFDZixPQUFPLEVBQUUsRUFBRTtTQUNaLENBQUM7UUFDRixJQUFJ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LENBQUM7b0JBQzFCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7d0JBQ3JELGFBQWEsR0FBRyxJQUFJLENBQUM7cUJBQ3RCO2lCQUNGO2dCQUNELE9BQU8sYUFBYSxDQUFDO1lBQ3ZCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNSO0tBQ0Y7SUFDRCxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQ3BDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzdEO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1bmlxdWVJZCBmcm9tICdsb2Rhc2gvdW5pcXVlSWQnO1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJztcbmltcG9ydCB7XG4gIGNoZWNrSW5saW5lVHlwZSxcbiAgZ2V0RnJvbVNjaGVtYSxcbiAgZ2V0SW5wdXRUeXBlLFxuICBpc0lucHV0UmVxdWlyZWQsXG4gIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMsXG4gIHVwZGF0ZUlucHV0T3B0aW9uc1xuICB9IGZyb20gJy4vanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGNvcHksXG4gIGZpeFRpdGxlLFxuICBmb3JFYWNoLFxuICBoYXNPd25cbiAgfSBmcm9tICcuL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGluQXJyYXksXG4gIGlzQXJyYXksXG4gIGlzRGVmaW5lZCxcbiAgaXNFbXB0eSxcbiAgaXNOdW1iZXIsXG4gIGlzT2JqZWN0LFxuICBpc1N0cmluZ1xuICB9IGZyb20gJy4vdmFsaWRhdG9yLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBKc29uUG9pbnRlciB9IGZyb20gJy4vanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IFRpdGxlTWFwSXRlbSB9IGZyb20gJy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5cblxuXG4vKipcbiAqIExheW91dCBmdW5jdGlvbiBsaWJyYXJ5OlxuICpcbiAqIGJ1aWxkTGF5b3V0OiAgICAgICAgICAgIEJ1aWxkcyBhIGNvbXBsZXRlIGxheW91dCBmcm9tIGFuIGlucHV0IGxheW91dCBhbmQgc2NoZW1hXG4gKlxuICogYnVpbGRMYXlvdXRGcm9tU2NoZW1hOiAgQnVpbGRzIGEgY29tcGxldGUgbGF5b3V0IGVudGlyZWx5IGZyb20gYW4gaW5wdXQgc2NoZW1hXG4gKlxuICogbWFwTGF5b3V0OlxuICpcbiAqIGdldExheW91dE5vZGU6XG4gKlxuICogYnVpbGRUaXRsZU1hcDpcbiAqL1xuXG4vKipcbiAqICdidWlsZExheW91dCcgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIGpzZlxuICogLy8gICB3aWRnZXRMaWJyYXJ5XG4gKiAvL1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRMYXlvdXQoanNmLCB3aWRnZXRMaWJyYXJ5KSB7XG4gIGxldCBoYXNTdWJtaXRCdXR0b24gPSAhSnNvblBvaW50ZXIuZ2V0KGpzZiwgJy9mb3JtT3B0aW9ucy9hZGRTdWJtaXQnKTtcbiAgY29uc3QgZm9ybUxheW91dCA9IG1hcExheW91dChqc2YubGF5b3V0LCAobGF5b3V0SXRlbSwgaW5kZXgsIGxheW91dFBvaW50ZXIpID0+IHtcbiAgICBjb25zdCBuZXdOb2RlOiBhbnkgPSB7XG4gICAgICBfaWQ6IHVuaXF1ZUlkKCksXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICB9O1xuICAgIGlmIChpc09iamVjdChsYXlvdXRJdGVtKSkge1xuICAgICAgT2JqZWN0LmFzc2lnbihuZXdOb2RlLCBsYXlvdXRJdGVtKTtcbiAgICAgIE9iamVjdC5rZXlzKG5ld05vZGUpXG4gICAgICAgIC5maWx0ZXIob3B0aW9uID0+ICFpbkFycmF5KG9wdGlvbiwgW1xuICAgICAgICAgICdfaWQnLCAnJHJlZicsICdhcnJheUl0ZW0nLCAnYXJyYXlJdGVtVHlwZScsICdkYXRhUG9pbnRlcicsICdkYXRhVHlwZScsXG4gICAgICAgICAgJ2l0ZW1zJywgJ2tleScsICduYW1lJywgJ29wdGlvbnMnLCAncmVjdXJzaXZlUmVmZXJlbmNlJywgJ3R5cGUnLCAnd2lkZ2V0J1xuICAgICAgICBdKSlcbiAgICAgICAgLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnNbb3B0aW9uXSA9IG5ld05vZGVbb3B0aW9uXTtcbiAgICAgICAgICBkZWxldGUgbmV3Tm9kZVtvcHRpb25dO1xuICAgICAgICB9KTtcbiAgICAgIGlmICghaGFzT3duKG5ld05vZGUsICd0eXBlJykgJiYgaXNTdHJpbmcobmV3Tm9kZS53aWRnZXQpKSB7XG4gICAgICAgIG5ld05vZGUudHlwZSA9IG5ld05vZGUud2lkZ2V0O1xuICAgICAgICBkZWxldGUgbmV3Tm9kZS53aWRnZXQ7XG4gICAgICB9XG4gICAgICBpZiAoIWhhc093bihuZXdOb2RlLm9wdGlvbnMsICd0aXRsZScpKSB7XG4gICAgICAgIGlmIChoYXNPd24obmV3Tm9kZS5vcHRpb25zLCAnbGVnZW5kJykpIHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudGl0bGUgPSBuZXdOb2RlLm9wdGlvbnMubGVnZW5kO1xuICAgICAgICAgIGRlbGV0ZSBuZXdOb2RlLm9wdGlvbnMubGVnZW5kO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhhc093bihuZXdOb2RlLm9wdGlvbnMsICd2YWxpZGF0aW9uTWVzc2FnZXMnKSkge1xuICAgICAgICBpZiAoaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ2Vycm9yTWVzc2FnZXMnKSkge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXMgPSBuZXdOb2RlLm9wdGlvbnMuZXJyb3JNZXNzYWdlcztcbiAgICAgICAgICBkZWxldGUgbmV3Tm9kZS5vcHRpb25zLmVycm9yTWVzc2FnZXM7XG5cbiAgICAgICAgICAvLyBDb252ZXJ0IEFuZ3VsYXIgU2NoZW1hIEZvcm0gKEFuZ3VsYXJKUykgJ3ZhbGlkYXRpb25NZXNzYWdlJyB0b1xuICAgICAgICAgIC8vIEFuZ3VsYXIgSlNPTiBTY2hlbWEgRm9ybSAndmFsaWRhdGlvbk1lc3NhZ2VzJ1xuICAgICAgICAgIC8vIFRWNCBjb2RlcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhaW50bHVmZi90djQvYmxvYi9tYXN0ZXIvc291cmNlL2FwaS5qc1xuICAgICAgICB9IGVsc2UgaWYgKGhhc093bihuZXdOb2RlLm9wdGlvbnMsICd2YWxpZGF0aW9uTWVzc2FnZScpKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2VzID0gbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2VzID0ge307XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2UpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgY29kZSA9IGtleSArICcnO1xuICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPVxuICAgICAgICAgICAgICAgIGNvZGUgPT09ICcwJyA/ICd0eXBlJyA6XG4gICAgICAgICAgICAgICAgICBjb2RlID09PSAnMScgPyAnZW51bScgOlxuICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMTAwJyA/ICdtdWx0aXBsZU9mJyA6XG4gICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzEwMScgPyAnbWluaW11bScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzEwMicgPyAnZXhjbHVzaXZlTWluaW11bScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMTAzJyA/ICdtYXhpbXVtJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzEwNCcgPyAnZXhjbHVzaXZlTWF4aW11bScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzIwMCcgPyAnbWluTGVuZ3RoJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcyMDEnID8gJ21heExlbmd0aCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcyMDInID8gJ3BhdHRlcm4nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICczMDAnID8gJ21pblByb3BlcnRpZXMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzMwMScgPyAnbWF4UHJvcGVydGllcycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICczMDInID8gJ3JlcXVpcmVkJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMzA0JyA/ICdkZXBlbmRlbmNpZXMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzQwMCcgPyAnbWluSXRlbXMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnNDAxJyA/ICdtYXhJdGVtcycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzQwMicgPyAndW5pcXVlSXRlbXMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzUwMCcgPyAnZm9ybWF0JyA6IGNvZGUgKyAnJztcbiAgICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlc1tuZXdLZXldID0gbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlW2tleV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoSnNvblBvaW50ZXIuaXNKc29uUG9pbnRlcihsYXlvdXRJdGVtKSkge1xuICAgICAgbmV3Tm9kZS5kYXRhUG9pbnRlciA9IGxheW91dEl0ZW07XG4gICAgfSBlbHNlIGlmIChpc1N0cmluZyhsYXlvdXRJdGVtKSkge1xuICAgICAgbmV3Tm9kZS5rZXkgPSBsYXlvdXRJdGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdidWlsZExheW91dCBlcnJvcjogRm9ybSBsYXlvdXQgZWxlbWVudCBub3QgcmVjb2duaXplZDonKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IobGF5b3V0SXRlbSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IG5vZGVTY2hlbWE6IGFueSA9IG51bGw7XG5cbiAgICAvLyBJZiBuZXdOb2RlIGRvZXMgbm90IGhhdmUgYSBkYXRhUG9pbnRlciwgdHJ5IHRvIGZpbmQgYW4gZXF1aXZhbGVudFxuICAgIGlmICghaGFzT3duKG5ld05vZGUsICdkYXRhUG9pbnRlcicpKSB7XG5cbiAgICAgIC8vIElmIG5ld05vZGUgaGFzIGEga2V5LCBjaGFuZ2UgaXQgdG8gYSBkYXRhUG9pbnRlclxuICAgICAgaWYgKGhhc093bihuZXdOb2RlLCAna2V5JykpIHtcbiAgICAgICAgbmV3Tm9kZS5kYXRhUG9pbnRlciA9IG5ld05vZGUua2V5ID09PSAnKicgPyBuZXdOb2RlLmtleSA6XG4gICAgICAgICAgSnNvblBvaW50ZXIuY29tcGlsZShKc29uUG9pbnRlci5wYXJzZU9iamVjdFBhdGgobmV3Tm9kZS5rZXkpLCAnLScpO1xuICAgICAgICBkZWxldGUgbmV3Tm9kZS5rZXk7XG5cbiAgICAgICAgLy8gSWYgbmV3Tm9kZSBpcyBhbiBhcnJheSwgc2VhcmNoIGZvciBkYXRhUG9pbnRlciBpbiBjaGlsZCBub2Rlc1xuICAgICAgfSBlbHNlIGlmIChoYXNPd24obmV3Tm9kZSwgJ3R5cGUnKSAmJiBuZXdOb2RlLnR5cGUuc2xpY2UoLTUpID09PSAnYXJyYXknKSB7XG4gICAgICAgIGNvbnN0IGZpbmREYXRhUG9pbnRlciA9IChpdGVtcykgPT4ge1xuICAgICAgICAgIGlmIChpdGVtcyA9PT0gbnVsbCB8fCB0eXBlb2YgaXRlbXMgIT09ICdvYmplY3QnKSB7IHJldHVybjsgfVxuICAgICAgICAgIGlmIChoYXNPd24oaXRlbXMsICdkYXRhUG9pbnRlcicpKSB7IHJldHVybiBpdGVtcy5kYXRhUG9pbnRlcjsgfVxuICAgICAgICAgIGlmIChpc0FycmF5KGl0ZW1zLml0ZW1zKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zLml0ZW1zKSB7XG4gICAgICAgICAgICAgIGlmIChoYXNPd24oaXRlbSwgJ2RhdGFQb2ludGVyJykgJiYgaXRlbS5kYXRhUG9pbnRlci5pbmRleE9mKCcvLScpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmRhdGFQb2ludGVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoYXNPd24oaXRlbSwgJ2l0ZW1zJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2hJdGVtID0gZmluZERhdGFQb2ludGVyKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChzZWFyY2hJdGVtKSB7IHJldHVybiBzZWFyY2hJdGVtOyB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNoaWxkRGF0YVBvaW50ZXIgPSBmaW5kRGF0YVBvaW50ZXIobmV3Tm9kZSk7XG4gICAgICAgIGlmIChjaGlsZERhdGFQb2ludGVyKSB7XG4gICAgICAgICAgbmV3Tm9kZS5kYXRhUG9pbnRlciA9XG4gICAgICAgICAgICBjaGlsZERhdGFQb2ludGVyLnNsaWNlKDAsIGNoaWxkRGF0YVBvaW50ZXIubGFzdEluZGV4T2YoJy8tJykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc093bihuZXdOb2RlLCAnZGF0YVBvaW50ZXInKSkge1xuICAgICAgaWYgKG5ld05vZGUuZGF0YVBvaW50ZXIgPT09ICcqJykge1xuICAgICAgICByZXR1cm4gYnVpbGRMYXlvdXRGcm9tU2NoZW1hKGpzZiwgd2lkZ2V0TGlicmFyeSwganNmLmZvcm1WYWx1ZXMpO1xuICAgICAgfVxuICAgICAgY29uc3Qgbm9kZVZhbHVlID1cbiAgICAgICAgSnNvblBvaW50ZXIuZ2V0KGpzZi5mb3JtVmFsdWVzLCBuZXdOb2RlLmRhdGFQb2ludGVyLnJlcGxhY2UoL1xcLy0vZywgJy8xJykpO1xuXG4gICAgICAvLyBUT0RPOiBDcmVhdGUgZnVuY3Rpb24gZ2V0Rm9ybVZhbHVlcyhqc2YsIGRhdGFQb2ludGVyLCBmb3JSZWZMaWJyYXJ5KVxuICAgICAgLy8gY2hlY2sgZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgYW5kIGZvcm1PcHRpb25zLnNldExheW91dERlZmF1bHRzXG4gICAgICAvLyB0aGVuIHNldCBhcHJvcHJpYXRlIHZhbHVlcyBmcm9tIGluaXRpYWxWYXVlcywgc2NoZW1hLCBvciBsYXlvdXRcblxuICAgICAgbmV3Tm9kZS5kYXRhUG9pbnRlciA9XG4gICAgICAgIEpzb25Qb2ludGVyLnRvR2VuZXJpY1BvaW50ZXIobmV3Tm9kZS5kYXRhUG9pbnRlciwganNmLmFycmF5TWFwKTtcbiAgICAgIGNvbnN0IExhc3RLZXkgPSBKc29uUG9pbnRlci50b0tleShuZXdOb2RlLmRhdGFQb2ludGVyKTtcbiAgICAgIGlmICghbmV3Tm9kZS5uYW1lICYmIGlzU3RyaW5nKExhc3RLZXkpICYmIExhc3RLZXkgIT09ICctJykge1xuICAgICAgICBuZXdOb2RlLm5hbWUgPSBMYXN0S2V5O1xuICAgICAgfVxuICAgICAgY29uc3Qgc2hvcnREYXRhUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgIG5ld05vZGUuZGF0YVBvaW50ZXIsIGpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICk7XG4gICAgICBjb25zdCByZWN1cnNpdmUgPSAhc2hvcnREYXRhUG9pbnRlci5sZW5ndGggfHxcbiAgICAgICAgc2hvcnREYXRhUG9pbnRlciAhPT0gbmV3Tm9kZS5kYXRhUG9pbnRlcjtcbiAgICAgIGxldCBzY2hlbWFQb2ludGVyOiBzdHJpbmc7XG4gICAgICBpZiAoIWpzZi5kYXRhTWFwLmhhcyhzaG9ydERhdGFQb2ludGVyKSkge1xuICAgICAgICBqc2YuZGF0YU1hcC5zZXQoc2hvcnREYXRhUG9pbnRlciwgbmV3IE1hcCgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5vZGVEYXRhTWFwID0ganNmLmRhdGFNYXAuZ2V0KHNob3J0RGF0YVBvaW50ZXIpO1xuICAgICAgaWYgKG5vZGVEYXRhTWFwLmhhcygnc2NoZW1hUG9pbnRlcicpKSB7XG4gICAgICAgIHNjaGVtYVBvaW50ZXIgPSBub2RlRGF0YU1hcC5nZXQoJ3NjaGVtYVBvaW50ZXInKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjaGVtYVBvaW50ZXIgPSBKc29uUG9pbnRlci50b1NjaGVtYVBvaW50ZXIoc2hvcnREYXRhUG9pbnRlciwganNmLnNjaGVtYSk7XG4gICAgICAgIG5vZGVEYXRhTWFwLnNldCgnc2NoZW1hUG9pbnRlcicsIHNjaGVtYVBvaW50ZXIpO1xuICAgICAgfVxuICAgICAgbm9kZURhdGFNYXAuc2V0KCdkaXNhYmxlZCcsICEhbmV3Tm9kZS5vcHRpb25zLmRpc2FibGVkKTtcbiAgICAgIG5vZGVTY2hlbWEgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlcik7XG4gICAgICBpZiAobm9kZVNjaGVtYSkge1xuICAgICAgICBpZiAoIWhhc093bihuZXdOb2RlLCAndHlwZScpKSB7XG4gICAgICAgICAgbmV3Tm9kZS50eXBlID0gZ2V0SW5wdXRUeXBlKG5vZGVTY2hlbWEsIG5ld05vZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCF3aWRnZXRMaWJyYXJ5Lmhhc1dpZGdldChuZXdOb2RlLnR5cGUpKSB7XG4gICAgICAgICAgY29uc3Qgb2xkV2lkZ2V0VHlwZSA9IG5ld05vZGUudHlwZTtcbiAgICAgICAgICBuZXdOb2RlLnR5cGUgPSBnZXRJbnB1dFR5cGUobm9kZVNjaGVtYSwgbmV3Tm9kZSk7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgZXJyb3I6IHdpZGdldCB0eXBlIFwiJHtvbGRXaWRnZXRUeXBlfVwiIGAgK1xuICAgICAgICAgICAgYG5vdCBmb3VuZCBpbiBsaWJyYXJ5LiBSZXBsYWNpbmcgd2l0aCBcIiR7bmV3Tm9kZS50eXBlfVwiLmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld05vZGUudHlwZSA9IGNoZWNrSW5saW5lVHlwZShuZXdOb2RlLnR5cGUsIG5vZGVTY2hlbWEsIG5ld05vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlU2NoZW1hLnR5cGUgPT09ICdvYmplY3QnICYmIGlzQXJyYXkobm9kZVNjaGVtYS5yZXF1aXJlZCkpIHtcbiAgICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ3JlcXVpcmVkJywgbm9kZVNjaGVtYS5yZXF1aXJlZCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV3Tm9kZS5kYXRhVHlwZSA9XG4gICAgICAgICAgbm9kZVNjaGVtYS50eXBlIHx8IChoYXNPd24obm9kZVNjaGVtYSwgJyRyZWYnKSA/ICckcmVmJyA6IG51bGwpO1xuICAgICAgICB1cGRhdGVJbnB1dE9wdGlvbnMobmV3Tm9kZSwgbm9kZVNjaGVtYSwganNmKTtcblxuICAgICAgICAvLyBQcmVzZW50IGNoZWNrYm94ZXMgYXMgc2luZ2xlIGNvbnRyb2wsIHJhdGhlciB0aGFuIGFycmF5XG4gICAgICAgIGlmIChuZXdOb2RlLnR5cGUgPT09ICdjaGVja2JveGVzJyAmJiBoYXNPd24obm9kZVNjaGVtYSwgJ2l0ZW1zJykpIHtcbiAgICAgICAgICB1cGRhdGVJbnB1dE9wdGlvbnMobmV3Tm9kZSwgbm9kZVNjaGVtYS5pdGVtcywganNmKTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXdOb2RlLmRhdGFUeXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zID0gTWF0aC5taW4oXG4gICAgICAgICAgICBub2RlU2NoZW1hLm1heEl0ZW1zIHx8IDEwMDAsIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyB8fCAxMDAwXG4gICAgICAgICAgKTtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPSBNYXRoLm1heChcbiAgICAgICAgICAgIG5vZGVTY2hlbWEubWluSXRlbXMgfHwgMCwgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zIHx8IDBcbiAgICAgICAgICApO1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSBNYXRoLm1heChcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgfHwgMCwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlLmxlbmd0aCA6IDBcbiAgICAgICAgICApO1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zID1cbiAgICAgICAgICAgIGlzQXJyYXkobm9kZVNjaGVtYS5pdGVtcykgPyBub2RlU2NoZW1hLml0ZW1zLmxlbmd0aCA6IDA7XG4gICAgICAgICAgaWYgKG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA8IG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKSB7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcztcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSAwO1xuICAgICAgICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIDxcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtc1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9XG4gICAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyAtIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgICAgICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zID5cbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtc1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9XG4gICAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyAtIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIW5vZGVEYXRhTWFwLmhhcygnbWF4SXRlbXMnKSkge1xuICAgICAgICAgICAgbm9kZURhdGFNYXAuc2V0KCdtYXhJdGVtcycsIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyk7XG4gICAgICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ21pbkl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zKTtcbiAgICAgICAgICAgIG5vZGVEYXRhTWFwLnNldCgndHVwbGVJdGVtcycsIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKTtcbiAgICAgICAgICAgIG5vZGVEYXRhTWFwLnNldCgnbGlzdEl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghanNmLmFycmF5TWFwLmhhcyhzaG9ydERhdGFQb2ludGVyKSkge1xuICAgICAgICAgICAganNmLmFycmF5TWFwLnNldChzaG9ydERhdGFQb2ludGVyLCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc0lucHV0UmVxdWlyZWQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlcikpIHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMucmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAgIGpzZi5maWVsZHNSZXF1aXJlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRPRE86IGNyZWF0ZSBpdGVtIGluIEZvcm1Hcm91cCBtb2RlbCBmcm9tIGxheW91dCBrZXkgKD8pXG4gICAgICAgIHVwZGF0ZUlucHV0T3B0aW9ucyhuZXdOb2RlLCB7fSwganNmKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFuZXdOb2RlLm9wdGlvbnMudGl0bGUgJiYgIS9eXFxkKyQvLnRlc3QobmV3Tm9kZS5uYW1lKSkge1xuICAgICAgICBuZXdOb2RlLm9wdGlvbnMudGl0bGUgPSBmaXhUaXRsZShuZXdOb2RlLm5hbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ2NvcHlWYWx1ZVRvJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdOb2RlLm9wdGlvbnMuY29weVZhbHVlVG8gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmNvcHlWYWx1ZVRvID0gW25ld05vZGUub3B0aW9ucy5jb3B5VmFsdWVUb107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkobmV3Tm9kZS5vcHRpb25zLmNvcHlWYWx1ZVRvKSkge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5jb3B5VmFsdWVUbyA9IG5ld05vZGUub3B0aW9ucy5jb3B5VmFsdWVUby5tYXAoaXRlbSA9PlxuICAgICAgICAgICAgSnNvblBvaW50ZXIuY29tcGlsZShKc29uUG9pbnRlci5wYXJzZU9iamVjdFBhdGgoaXRlbSksICctJylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5ld05vZGUud2lkZ2V0ID0gd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQobmV3Tm9kZS50eXBlKTtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgnaW5wdXRUeXBlJywgbmV3Tm9kZS50eXBlKTtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgnd2lkZ2V0JywgbmV3Tm9kZS53aWRnZXQpO1xuXG4gICAgICBpZiAobmV3Tm9kZS5kYXRhVHlwZSA9PT0gJ2FycmF5JyAmJlxuICAgICAgICAoaGFzT3duKG5ld05vZGUsICdpdGVtcycpIHx8IGhhc093bihuZXdOb2RlLCAnYWRkaXRpb25hbEl0ZW1zJykpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgaXRlbVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgIG5ld05vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICAgICk7XG4gICAgICAgIGlmICghanNmLmRhdGFNYXAuaGFzKGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAgIGpzZi5kYXRhTWFwLnNldChpdGVtUmVmUG9pbnRlciwgbmV3IE1hcCgpKTtcbiAgICAgICAgfVxuICAgICAgICBqc2YuZGF0YU1hcC5nZXQoaXRlbVJlZlBvaW50ZXIpLnNldCgnaW5wdXRUeXBlJywgJ3NlY3Rpb24nKTtcblxuICAgICAgICAvLyBGaXggaW5zdWZmaWNpZW50bHkgbmVzdGVkIGFycmF5IGl0ZW0gZ3JvdXBzXG4gICAgICAgIGlmIChuZXdOb2RlLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUl0ZW1Hcm91cCA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSBuZXdOb2RlLml0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBzdWJJdGVtID0gbmV3Tm9kZS5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChoYXNPd24oc3ViSXRlbSwgJ2RhdGFQb2ludGVyJykgJiZcbiAgICAgICAgICAgICAgc3ViSXRlbS5kYXRhUG9pbnRlci5zbGljZSgwLCBpdGVtUmVmUG9pbnRlci5sZW5ndGgpID09PSBpdGVtUmVmUG9pbnRlclxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGFycmF5SXRlbSA9IG5ld05vZGUuaXRlbXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICAgICAgICBhcnJheUl0ZW0uZGF0YVBvaW50ZXIgPSBuZXdOb2RlLmRhdGFQb2ludGVyICsgJy8tJyArXG4gICAgICAgICAgICAgICAgYXJyYXlJdGVtLmRhdGFQb2ludGVyLnNsaWNlKGl0ZW1SZWZQb2ludGVyLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGFycmF5SXRlbUdyb3VwLnVuc2hpZnQoYXJyYXlJdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN1Ykl0ZW0uYXJyYXlJdGVtID0gdHJ1ZTtcbiAgICAgICAgICAgICAgLy8gVE9ETzogQ2hlY2sgc2NoZW1hIHRvIGdldCBhcnJheUl0ZW1UeXBlIGFuZCByZW1vdmFibGVcbiAgICAgICAgICAgICAgc3ViSXRlbS5hcnJheUl0ZW1UeXBlID0gJ2xpc3QnO1xuICAgICAgICAgICAgICBzdWJJdGVtLnJlbW92YWJsZSA9IG5ld05vZGUub3B0aW9ucy5yZW1vdmFibGUgIT09IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJyYXlJdGVtR3JvdXAubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICBfaWQ6IHVuaXF1ZUlkKCksXG4gICAgICAgICAgICAgIGFycmF5SXRlbTogdHJ1ZSxcbiAgICAgICAgICAgICAgYXJyYXlJdGVtVHlwZTogbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPiBuZXdOb2RlLml0ZW1zLmxlbmd0aCA/XG4gICAgICAgICAgICAgICAgJ3R1cGxlJyA6ICdsaXN0JyxcbiAgICAgICAgICAgICAgaXRlbXM6IGFycmF5SXRlbUdyb3VwLFxuICAgICAgICAgICAgICBvcHRpb25zOiB7IHJlbW92YWJsZTogbmV3Tm9kZS5vcHRpb25zLnJlbW92YWJsZSAhPT0gZmFsc2UsIH0sXG4gICAgICAgICAgICAgIGRhdGFQb2ludGVyOiBuZXdOb2RlLmRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICAgICAgdHlwZTogJ3NlY3Rpb24nLFxuICAgICAgICAgICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCdzZWN0aW9uJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVE9ETzogRml4IHRvIGhuZGxlIG11bHRpcGxlIGl0ZW1zXG4gICAgICAgICAgbmV3Tm9kZS5pdGVtc1swXS5hcnJheUl0ZW0gPSB0cnVlO1xuICAgICAgICAgIGlmICghbmV3Tm9kZS5pdGVtc1swXS5kYXRhUG9pbnRlcikge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtc1swXS5kYXRhUG9pbnRlciA9XG4gICAgICAgICAgICAgIEpzb25Qb2ludGVyLnRvR2VuZXJpY1BvaW50ZXIoaXRlbVJlZlBvaW50ZXIsIGpzZi5hcnJheU1hcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghSnNvblBvaW50ZXIuaGFzKG5ld05vZGUsICcvaXRlbXMvMC9vcHRpb25zL3JlbW92YWJsZScpKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zWzBdLm9wdGlvbnMucmVtb3ZhYmxlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5ld05vZGUub3B0aW9ucy5vcmRlcmFibGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zWzBdLm9wdGlvbnMub3JkZXJhYmxlID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld05vZGUuaXRlbXNbMF0uYXJyYXlJdGVtVHlwZSA9XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyA/ICd0dXBsZScgOiAnbGlzdCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNBcnJheShuZXdOb2RlLml0ZW1zKSkge1xuICAgICAgICAgIGNvbnN0IGFycmF5TGlzdEl0ZW1zID1cbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlICE9PSAnJHJlZicpLmxlbmd0aCAtXG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcztcbiAgICAgICAgICBpZiAoYXJyYXlMaXN0SXRlbXMgPiBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zKSB7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID0gYXJyYXlMaXN0SXRlbXM7XG4gICAgICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ2xpc3RJdGVtcycsIGFycmF5TGlzdEl0ZW1zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc093bihqc2YubGF5b3V0UmVmTGlicmFyeSwgaXRlbVJlZlBvaW50ZXIpKSB7XG4gICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID1cbiAgICAgICAgICAgIGNsb25lRGVlcChuZXdOb2RlLml0ZW1zW25ld05vZGUuaXRlbXMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXS5yZWN1cnNpdmVSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3JFYWNoKGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSwgKGl0ZW0sIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKGhhc093bihpdGVtLCAnX2lkJykpIHsgaXRlbS5faWQgPSBudWxsOyB9XG4gICAgICAgICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgICAgICAgIGlmIChoYXNPd24oaXRlbSwgJ2RhdGFQb2ludGVyJykpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmRhdGFQb2ludGVyID0gaXRlbS5kYXRhUG9pbnRlci5zbGljZShpdGVtUmVmUG9pbnRlci5sZW5ndGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgJ3RvcC1kb3duJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgYW55IGFkZGl0aW9uYWwgZGVmYXVsdCBpdGVtc1xuICAgICAgICBpZiAoIW5ld05vZGUucmVjdXJzaXZlUmVmZXJlbmNlIHx8IG5ld05vZGUub3B0aW9ucy5yZXF1aXJlZCkge1xuICAgICAgICAgIGNvbnN0IGFycmF5TGVuZ3RoID0gTWF0aC5taW4oTWF0aC5tYXgoXG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMsXG4gICAgICAgICAgICBpc0FycmF5KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWUubGVuZ3RoIDogMFxuICAgICAgICAgICksIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IG5ld05vZGUuaXRlbXMubGVuZ3RoOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtcy5wdXNoKGdldExheW91dE5vZGUoe1xuICAgICAgICAgICAgICAkcmVmOiBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgZGF0YVBvaW50ZXI6IG5ld05vZGUuZGF0YVBvaW50ZXIsXG4gICAgICAgICAgICAgIHJlY3Vyc2l2ZVJlZmVyZW5jZTogbmV3Tm9kZS5yZWN1cnNpdmVSZWZlcmVuY2UsXG4gICAgICAgICAgICB9LCBqc2YsIHdpZGdldExpYnJhcnkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBuZWVkZWQsIGFkZCBidXR0b24gdG8gYWRkIGl0ZW1zIHRvIGFycmF5XG4gICAgICAgIGlmIChuZXdOb2RlLm9wdGlvbnMuYWRkYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgJiZcbiAgICAgICAgICAobmV3Tm9kZS5pdGVtc1tuZXdOb2RlLml0ZW1zLmxlbmd0aCAtIDFdIHx8IHt9KS50eXBlICE9PSAnJHJlZidcbiAgICAgICAgKSB7XG4gICAgICAgICAgbGV0IGJ1dHRvblRleHQgPSAnQWRkJztcbiAgICAgICAgICBpZiAobmV3Tm9kZS5vcHRpb25zLnRpdGxlKSB7XG4gICAgICAgICAgICBpZiAoL15hZGRcXGIvaS50ZXN0KG5ld05vZGUub3B0aW9ucy50aXRsZSkpIHtcbiAgICAgICAgICAgICAgYnV0dG9uVGV4dCA9IG5ld05vZGUub3B0aW9ucy50aXRsZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJ1dHRvblRleHQgKz0gJyAnICsgbmV3Tm9kZS5vcHRpb25zLnRpdGxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5uYW1lICYmICEvXlxcZCskLy50ZXN0KG5ld05vZGUubmFtZSkpIHtcbiAgICAgICAgICAgIGlmICgvXmFkZFxcYi9pLnRlc3QobmV3Tm9kZS5uYW1lKSkge1xuICAgICAgICAgICAgICBidXR0b25UZXh0ICs9ICcgJyArIGZpeFRpdGxlKG5ld05vZGUubmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBidXR0b25UZXh0ID0gZml4VGl0bGUobmV3Tm9kZS5uYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgbmV3Tm9kZSBkb2Vzbid0IGhhdmUgYSB0aXRsZSwgbG9vayBmb3IgdGl0bGUgb2YgcGFyZW50IGFycmF5IGl0ZW1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50U2NoZW1hID1cbiAgICAgICAgICAgICAgZ2V0RnJvbVNjaGVtYShqc2Yuc2NoZW1hLCBuZXdOb2RlLmRhdGFQb2ludGVyLCAncGFyZW50U2NoZW1hJyk7XG4gICAgICAgICAgICBpZiAoaGFzT3duKHBhcmVudFNjaGVtYSwgJ3RpdGxlJykpIHtcbiAgICAgICAgICAgICAgYnV0dG9uVGV4dCArPSAnIHRvICcgKyBwYXJlbnRTY2hlbWEudGl0bGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBwb2ludGVyQXJyYXkgPSBKc29uUG9pbnRlci5wYXJzZShuZXdOb2RlLmRhdGFQb2ludGVyKTtcbiAgICAgICAgICAgICAgYnV0dG9uVGV4dCArPSAnIHRvICcgKyBmaXhUaXRsZShwb2ludGVyQXJyYXlbcG9pbnRlckFycmF5Lmxlbmd0aCAtIDJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3Tm9kZS5pdGVtcy5wdXNoKHtcbiAgICAgICAgICAgIF9pZDogdW5pcXVlSWQoKSxcbiAgICAgICAgICAgIGFycmF5SXRlbTogdHJ1ZSxcbiAgICAgICAgICAgIGFycmF5SXRlbVR5cGU6ICdsaXN0JyxcbiAgICAgICAgICAgIGRhdGFQb2ludGVyOiBuZXdOb2RlLmRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgbGlzdEl0ZW1zOiBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zLFxuICAgICAgICAgICAgICBtYXhJdGVtczogbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zLFxuICAgICAgICAgICAgICBtaW5JdGVtczogbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zLFxuICAgICAgICAgICAgICByZW1vdmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICB0aXRsZTogYnV0dG9uVGV4dCxcbiAgICAgICAgICAgICAgdHVwbGVJdGVtczogbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiByZWN1cnNpdmUsXG4gICAgICAgICAgICB0eXBlOiAnJHJlZicsXG4gICAgICAgICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCckcmVmJyksXG4gICAgICAgICAgICAkcmVmOiBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoaXNTdHJpbmcoSnNvblBvaW50ZXIuZ2V0KG5ld05vZGUsICcvc3R5bGUvYWRkJykpKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zW25ld05vZGUuaXRlbXMubGVuZ3RoIC0gMV0ub3B0aW9ucy5maWVsZFN0eWxlID1cbiAgICAgICAgICAgICAgbmV3Tm9kZS5zdHlsZS5hZGQ7XG4gICAgICAgICAgICBkZWxldGUgbmV3Tm9kZS5zdHlsZS5hZGQ7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eShuZXdOb2RlLnN0eWxlKSkgeyBkZWxldGUgbmV3Tm9kZS5zdHlsZTsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Tm9kZS5hcnJheUl0ZW0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGhhc093bihuZXdOb2RlLCAndHlwZScpIHx8IGhhc093bihuZXdOb2RlLCAnaXRlbXMnKSkge1xuICAgICAgY29uc3QgcGFyZW50VHlwZTogc3RyaW5nID1cbiAgICAgICAgSnNvblBvaW50ZXIuZ2V0KGpzZi5sYXlvdXQsIGxheW91dFBvaW50ZXIsIDAsIC0yKS50eXBlO1xuICAgICAgaWYgKCFoYXNPd24obmV3Tm9kZSwgJ3R5cGUnKSkge1xuICAgICAgICBuZXdOb2RlLnR5cGUgPVxuICAgICAgICAgIGluQXJyYXkocGFyZW50VHlwZSwgWyd0YWJzJywgJ3RhYmFycmF5J10pID8gJ3RhYicgOiAnYXJyYXknO1xuICAgICAgfVxuICAgICAgbmV3Tm9kZS5hcnJheUl0ZW0gPSBwYXJlbnRUeXBlID09PSAnYXJyYXknO1xuICAgICAgbmV3Tm9kZS53aWRnZXQgPSB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldChuZXdOb2RlLnR5cGUpO1xuICAgICAgdXBkYXRlSW5wdXRPcHRpb25zKG5ld05vZGUsIHt9LCBqc2YpO1xuICAgIH1cbiAgICBpZiAobmV3Tm9kZS50eXBlID09PSAnc3VibWl0JykgeyBoYXNTdWJtaXRCdXR0b24gPSB0cnVlOyB9XG4gICAgcmV0dXJuIG5ld05vZGU7XG4gIH0pO1xuICBpZiAoanNmLmhhc1Jvb3RSZWZlcmVuY2UpIHtcbiAgICBjb25zdCBmdWxsTGF5b3V0ID0gY2xvbmVEZWVwKGZvcm1MYXlvdXQpO1xuICAgIGlmIChmdWxsTGF5b3V0W2Z1bGxMYXlvdXQubGVuZ3RoIC0gMV0udHlwZSA9PT0gJ3N1Ym1pdCcpIHsgZnVsbExheW91dC5wb3AoKTsgfVxuICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5WycnXSA9IHtcbiAgICAgIF9pZDogbnVsbCxcbiAgICAgIGRhdGFQb2ludGVyOiAnJyxcbiAgICAgIGRhdGFUeXBlOiAnb2JqZWN0JyxcbiAgICAgIGl0ZW1zOiBmdWxsTGF5b3V0LFxuICAgICAgbmFtZTogJycsXG4gICAgICBvcHRpb25zOiBjbG9uZURlZXAoanNmLmZvcm1PcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnMpLFxuICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiB0cnVlLFxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgdHlwZTogJ3NlY3Rpb24nLFxuICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnc2VjdGlvbicpLFxuICAgIH07XG4gIH1cbiAgaWYgKCFoYXNTdWJtaXRCdXR0b24pIHtcbiAgICBmb3JtTGF5b3V0LnB1c2goe1xuICAgICAgX2lkOiB1bmlxdWVJZCgpLFxuICAgICAgb3B0aW9uczogeyB0aXRsZTogJ1N1Ym1pdCcgfSxcbiAgICAgIHR5cGU6ICdzdWJtaXQnLFxuICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnc3VibWl0JyksXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGZvcm1MYXlvdXQ7XG59XG5cbi8qKlxuICogJ2J1aWxkTGF5b3V0RnJvbVNjaGVtYScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIGpzZiAtXG4gKiAvLyAgIHdpZGdldExpYnJhcnkgLVxuICogLy8gICBub2RlVmFsdWUgLVxuICogLy8gIHsgc3RyaW5nID0gJycgfSBzY2hlbWFQb2ludGVyIC1cbiAqIC8vICB7IHN0cmluZyA9ICcnIH0gZGF0YVBvaW50ZXIgLVxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gYXJyYXlJdGVtIC1cbiAqIC8vICB7IHN0cmluZyA9IG51bGwgfSBhcnJheUl0ZW1UeXBlIC1cbiAqIC8vICB7IGJvb2xlYW4gPSBudWxsIH0gcmVtb3ZhYmxlIC1cbiAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGZvclJlZkxpYnJhcnkgLVxuICogLy8gIHsgc3RyaW5nID0gJycgfSBkYXRhUG9pbnRlclByZWZpeCAtXG4gKiAvL1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRMYXlvdXRGcm9tU2NoZW1hKFxuICBqc2YsIHdpZGdldExpYnJhcnksIG5vZGVWYWx1ZSA9IG51bGwsIHNjaGVtYVBvaW50ZXIgPSAnJyxcbiAgZGF0YVBvaW50ZXIgPSAnJywgYXJyYXlJdGVtID0gZmFsc2UsIGFycmF5SXRlbVR5cGU6IHN0cmluZyA9IG51bGwsXG4gIHJlbW92YWJsZTogYm9vbGVhbiA9IG51bGwsIGZvclJlZkxpYnJhcnkgPSBmYWxzZSwgZGF0YVBvaW50ZXJQcmVmaXggPSAnJ1xuKSB7XG4gIGNvbnN0IHNjaGVtYSA9IEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyKTtcbiAgaWYgKCFoYXNPd24oc2NoZW1hLCAndHlwZScpICYmICFoYXNPd24oc2NoZW1hLCAnJHJlZicpICYmXG4gICAgIWhhc093bihzY2hlbWEsICd4LXNjaGVtYS1mb3JtJylcbiAgKSB7IHJldHVybiBudWxsOyB9XG4gIGNvbnN0IG5ld05vZGVUeXBlOiBzdHJpbmcgPSBnZXRJbnB1dFR5cGUoc2NoZW1hKTtcbiAgaWYgKCFpc0RlZmluZWQobm9kZVZhbHVlKSAmJiAoXG4gICAganNmLmZvcm1PcHRpb25zLnNldFNjaGVtYURlZmF1bHRzID09PSB0cnVlIHx8XG4gICAgKGpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyA9PT0gJ2F1dG8nICYmIGlzRW1wdHkoanNmLmZvcm1WYWx1ZXMpKVxuICApKSB7XG4gICAgbm9kZVZhbHVlID0gSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIgKyAnL2RlZmF1bHQnKTtcbiAgfVxuICBsZXQgbmV3Tm9kZTogYW55ID0ge1xuICAgIF9pZDogZm9yUmVmTGlicmFyeSA/IG51bGwgOiB1bmlxdWVJZCgpLFxuICAgIGFycmF5SXRlbTogYXJyYXlJdGVtLFxuICAgIGRhdGFQb2ludGVyOiBKc29uUG9pbnRlci50b0dlbmVyaWNQb2ludGVyKGRhdGFQb2ludGVyLCBqc2YuYXJyYXlNYXApLFxuICAgIGRhdGFUeXBlOiBzY2hlbWEudHlwZSB8fCAoaGFzT3duKHNjaGVtYSwgJyRyZWYnKSA/ICckcmVmJyA6IG51bGwpLFxuICAgIG9wdGlvbnM6IHt9LFxuICAgIHJlcXVpcmVkOiBpc0lucHV0UmVxdWlyZWQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciksXG4gICAgdHlwZTogbmV3Tm9kZVR5cGUsXG4gICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldChuZXdOb2RlVHlwZSksXG4gIH07XG4gIGNvbnN0IGxhc3REYXRhS2V5ID0gSnNvblBvaW50ZXIudG9LZXkobmV3Tm9kZS5kYXRhUG9pbnRlcik7XG4gIGlmIChsYXN0RGF0YUtleSAhPT0gJy0nKSB7IG5ld05vZGUubmFtZSA9IGxhc3REYXRhS2V5OyB9XG4gIGlmIChuZXdOb2RlLmFycmF5SXRlbSkge1xuICAgIG5ld05vZGUuYXJyYXlJdGVtVHlwZSA9IGFycmF5SXRlbVR5cGU7XG4gICAgbmV3Tm9kZS5vcHRpb25zLnJlbW92YWJsZSA9IHJlbW92YWJsZSAhPT0gZmFsc2U7XG4gIH1cbiAgY29uc3Qgc2hvcnREYXRhUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgZGF0YVBvaW50ZXJQcmVmaXggKyBkYXRhUG9pbnRlciwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICApO1xuICBjb25zdCByZWN1cnNpdmUgPSAhc2hvcnREYXRhUG9pbnRlci5sZW5ndGggfHxcbiAgICBzaG9ydERhdGFQb2ludGVyICE9PSBkYXRhUG9pbnRlclByZWZpeCArIGRhdGFQb2ludGVyO1xuICBpZiAoIWpzZi5kYXRhTWFwLmhhcyhzaG9ydERhdGFQb2ludGVyKSkge1xuICAgIGpzZi5kYXRhTWFwLnNldChzaG9ydERhdGFQb2ludGVyLCBuZXcgTWFwKCkpO1xuICB9XG4gIGNvbnN0IG5vZGVEYXRhTWFwID0ganNmLmRhdGFNYXAuZ2V0KHNob3J0RGF0YVBvaW50ZXIpO1xuICBpZiAoIW5vZGVEYXRhTWFwLmhhcygnaW5wdXRUeXBlJykpIHtcbiAgICBub2RlRGF0YU1hcC5zZXQoJ3NjaGVtYVBvaW50ZXInLCBzY2hlbWFQb2ludGVyKTtcbiAgICBub2RlRGF0YU1hcC5zZXQoJ2lucHV0VHlwZScsIG5ld05vZGUudHlwZSk7XG4gICAgbm9kZURhdGFNYXAuc2V0KCd3aWRnZXQnLCBuZXdOb2RlLndpZGdldCk7XG4gICAgbm9kZURhdGFNYXAuc2V0KCdkaXNhYmxlZCcsICEhbmV3Tm9kZS5vcHRpb25zLmRpc2FibGVkKTtcbiAgfVxuICB1cGRhdGVJbnB1dE9wdGlvbnMobmV3Tm9kZSwgc2NoZW1hLCBqc2YpO1xuICBpZiAoIW5ld05vZGUub3B0aW9ucy50aXRsZSAmJiBuZXdOb2RlLm5hbWUgJiYgIS9eXFxkKyQvLnRlc3QobmV3Tm9kZS5uYW1lKSkge1xuICAgIG5ld05vZGUub3B0aW9ucy50aXRsZSA9IGZpeFRpdGxlKG5ld05vZGUubmFtZSk7XG4gIH1cblxuICBpZiAobmV3Tm9kZS5kYXRhVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAoaXNBcnJheShzY2hlbWEucmVxdWlyZWQpICYmICFub2RlRGF0YU1hcC5oYXMoJ3JlcXVpcmVkJykpIHtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgncmVxdWlyZWQnLCBzY2hlbWEucmVxdWlyZWQpO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3Qoc2NoZW1hLnByb3BlcnRpZXMpKSB7XG4gICAgICBjb25zdCBuZXdTZWN0aW9uOiBhbnlbXSA9IFtdO1xuICAgICAgY29uc3QgcHJvcGVydHlLZXlzID0gc2NoZW1hWyd1aTpvcmRlciddIHx8IE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKTtcbiAgICAgIGlmIChwcm9wZXJ0eUtleXMuaW5jbHVkZXMoJyonKSAmJiAhaGFzT3duKHNjaGVtYS5wcm9wZXJ0aWVzLCAnKicpKSB7XG4gICAgICAgIGNvbnN0IHVubmFtZWRLZXlzID0gT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpXG4gICAgICAgICAgLmZpbHRlcihrZXkgPT4gIXByb3BlcnR5S2V5cy5pbmNsdWRlcyhrZXkpKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHByb3BlcnR5S2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChwcm9wZXJ0eUtleXNbaV0gPT09ICcqJykge1xuICAgICAgICAgICAgcHJvcGVydHlLZXlzLnNwbGljZShpLCAxLCAuLi51bm5hbWVkS2V5cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcm9wZXJ0eUtleXNcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gaGFzT3duKHNjaGVtYS5wcm9wZXJ0aWVzLCBrZXkpIHx8XG4gICAgICAgICAgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJylcbiAgICAgICAgKVxuICAgICAgICAuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIGNvbnN0IGtleVNjaGVtYVBvaW50ZXIgPSBoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsIGtleSkgP1xuICAgICAgICAgICAgJy9wcm9wZXJ0aWVzLycgKyBrZXkgOiAnL2FkZGl0aW9uYWxQcm9wZXJ0aWVzJztcbiAgICAgICAgICBjb25zdCBpbm5lckl0ZW0gPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgICAgICBqc2YsIHdpZGdldExpYnJhcnksIGlzT2JqZWN0KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWVba2V5XSA6IG51bGwsXG4gICAgICAgICAgICBzY2hlbWFQb2ludGVyICsga2V5U2NoZW1hUG9pbnRlcixcbiAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8nICsga2V5LFxuICAgICAgICAgICAgZmFsc2UsIG51bGwsIG51bGwsIGZvclJlZkxpYnJhcnksIGRhdGFQb2ludGVyUHJlZml4XG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoaW5uZXJJdGVtKSB7XG4gICAgICAgICAgICBpZiAoaXNJbnB1dFJlcXVpcmVkKHNjaGVtYSwgJy8nICsga2V5KSkge1xuICAgICAgICAgICAgICBpbm5lckl0ZW0ub3B0aW9ucy5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGpzZi5maWVsZHNSZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdTZWN0aW9uLnB1c2goaW5uZXJJdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgaWYgKGRhdGFQb2ludGVyID09PSAnJyAmJiAhZm9yUmVmTGlicmFyeSkge1xuICAgICAgICBuZXdOb2RlID0gbmV3U2VjdGlvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld05vZGUuaXRlbXMgPSBuZXdTZWN0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBUT0RPOiBBZGQgcGF0dGVyblByb3BlcnRpZXMgYW5kIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIGlucHV0cz9cbiAgICAvLyAuLi4gcG9zc2libHkgcHJvdmlkZSBhIHdheSB0byBlbnRlciBib3RoIGtleSBuYW1lcyBhbmQgdmFsdWVzP1xuICAgIC8vIGlmIChpc09iamVjdChzY2hlbWEucGF0dGVyblByb3BlcnRpZXMpKSB7IH1cbiAgICAvLyBpZiAoaXNPYmplY3Qoc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSkgeyB9XG5cbiAgfSBlbHNlIGlmIChuZXdOb2RlLmRhdGFUeXBlID09PSAnYXJyYXknKSB7XG4gICAgbmV3Tm9kZS5pdGVtcyA9IFtdO1xuICAgIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA9IE1hdGgubWluKFxuICAgICAgc2NoZW1hLm1heEl0ZW1zIHx8IDEwMDAsIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyB8fCAxMDAwXG4gICAgKTtcbiAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPSBNYXRoLm1heChcbiAgICAgIHNjaGVtYS5taW5JdGVtcyB8fCAwLCBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgfHwgMFxuICAgICk7XG4gICAgaWYgKCFuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgJiYgaXNJbnB1dFJlcXVpcmVkKGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpKSB7XG4gICAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPSAxO1xuICAgIH1cbiAgICBpZiAoIWhhc093bihuZXdOb2RlLm9wdGlvbnMsICdsaXN0SXRlbXMnKSkgeyBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID0gMTsgfVxuICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zID0gaXNBcnJheShzY2hlbWEuaXRlbXMpID8gc2NoZW1hLml0ZW1zLmxlbmd0aCA6IDA7XG4gICAgaWYgKG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA8PSBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcykge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPSBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXM7XG4gICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID0gMDtcbiAgICB9IGVsc2UgaWYgKG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA8XG4gICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXNcbiAgICApIHtcbiAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgLSBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcztcbiAgICB9IGVsc2UgaWYgKG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA+XG4gICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXNcbiAgICApIHtcbiAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgLSBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcztcbiAgICB9XG4gICAgaWYgKCFub2RlRGF0YU1hcC5oYXMoJ21heEl0ZW1zJykpIHtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgnbWF4SXRlbXMnLCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMpO1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCdtaW5JdGVtcycsIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyk7XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ3R1cGxlSXRlbXMnLCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyk7XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ2xpc3RJdGVtcycsIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMpO1xuICAgIH1cbiAgICBpZiAoIWpzZi5hcnJheU1hcC5oYXMoc2hvcnREYXRhUG9pbnRlcikpIHtcbiAgICAgIGpzZi5hcnJheU1hcC5zZXQoc2hvcnREYXRhUG9pbnRlciwgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMpO1xuICAgIH1cbiAgICByZW1vdmFibGUgPSBuZXdOb2RlLm9wdGlvbnMucmVtb3ZhYmxlICE9PSBmYWxzZTtcbiAgICBsZXQgYWRkaXRpb25hbEl0ZW1zU2NoZW1hUG9pbnRlcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8vIElmICdpdGVtcycgaXMgYW4gYXJyYXkgPSB0dXBsZSBpdGVtc1xuICAgIGlmIChpc0FycmF5KHNjaGVtYS5pdGVtcykpIHtcbiAgICAgIG5ld05vZGUuaXRlbXMgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXM7IGkrKykge1xuICAgICAgICBsZXQgbmV3SXRlbTogYW55O1xuICAgICAgICBjb25zdCBpdGVtUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgICAgc2hvcnREYXRhUG9pbnRlciArICcvJyArIGksIGpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXRlbVJlY3Vyc2l2ZSA9ICFpdGVtUmVmUG9pbnRlci5sZW5ndGggfHxcbiAgICAgICAgICBpdGVtUmVmUG9pbnRlciAhPT0gc2hvcnREYXRhUG9pbnRlciArICcvJyArIGk7XG5cbiAgICAgICAgLy8gSWYgcmVtb3ZhYmxlLCBhZGQgdHVwbGUgaXRlbSBsYXlvdXQgdG8gbGF5b3V0UmVmTGlicmFyeVxuICAgICAgICBpZiAocmVtb3ZhYmxlICYmIGkgPj0gbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zKSB7XG4gICAgICAgICAgaWYgKCFoYXNPd24oanNmLmxheW91dFJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAgICAgLy8gU2V0IHRvIG51bGwgZmlyc3QgdG8gcHJldmVudCByZWN1cnNpdmUgcmVmZXJlbmNlIGZyb20gY2F1c2luZyBlbmRsZXNzIGxvb3BcbiAgICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IG51bGw7XG4gICAgICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlW2ldIDogbnVsbCxcbiAgICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArICcvaXRlbXMvJyArIGksXG4gICAgICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgPyAnJyA6IGRhdGFQb2ludGVyICsgJy8nICsgaSxcbiAgICAgICAgICAgICAgdHJ1ZSwgJ3R1cGxlJywgdHJ1ZSwgdHJ1ZSwgaXRlbVJlY3Vyc2l2ZSA/IGRhdGFQb2ludGVyICsgJy8nICsgaSA6ICcnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGl0ZW1SZWN1cnNpdmUpIHtcbiAgICAgICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdLnJlY3Vyc2l2ZVJlZmVyZW5jZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld0l0ZW0gPSBnZXRMYXlvdXROb2RlKHtcbiAgICAgICAgICAgICRyZWY6IGl0ZW1SZWZQb2ludGVyLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXI6IGRhdGFQb2ludGVyICsgJy8nICsgaSxcbiAgICAgICAgICAgIHJlY3Vyc2l2ZVJlZmVyZW5jZTogaXRlbVJlY3Vyc2l2ZSxcbiAgICAgICAgICB9LCBqc2YsIHdpZGdldExpYnJhcnksIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtpXSA6IG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld0l0ZW0gPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgICAgICBqc2YsIHdpZGdldExpYnJhcnksIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtpXSA6IG51bGwsXG4gICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSxcbiAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8nICsgaSxcbiAgICAgICAgICAgIHRydWUsICd0dXBsZScsIGZhbHNlLCBmb3JSZWZMaWJyYXJ5LCBkYXRhUG9pbnRlclByZWZpeFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld0l0ZW0pIHsgbmV3Tm9kZS5pdGVtcy5wdXNoKG5ld0l0ZW0pOyB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmICdhZGRpdGlvbmFsSXRlbXMnIGlzIGFuIG9iamVjdCA9IGFkZGl0aW9uYWwgbGlzdCBpdGVtcywgYWZ0ZXIgdHVwbGUgaXRlbXNcbiAgICAgIGlmIChpc09iamVjdChzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSkge1xuICAgICAgICBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvYWRkaXRpb25hbEl0ZW1zJztcbiAgICAgIH1cblxuICAgICAgLy8gSWYgJ2l0ZW1zJyBpcyBhbiBvYmplY3QgPSBsaXN0IGl0ZW1zIG9ubHkgKG5vIHR1cGxlIGl0ZW1zKVxuICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoc2NoZW1hLml0ZW1zKSkge1xuICAgICAgYWRkaXRpb25hbEl0ZW1zU2NoZW1hUG9pbnRlciA9IHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zJztcbiAgICB9XG5cbiAgICBpZiAoYWRkaXRpb25hbEl0ZW1zU2NoZW1hUG9pbnRlcikge1xuICAgICAgY29uc3QgaXRlbVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8tJywganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGl0ZW1SZWN1cnNpdmUgPSAhaXRlbVJlZlBvaW50ZXIubGVuZ3RoIHx8XG4gICAgICAgIGl0ZW1SZWZQb2ludGVyICE9PSBzaG9ydERhdGFQb2ludGVyICsgJy8tJztcbiAgICAgIGNvbnN0IGl0ZW1TY2hlbWFQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgYWRkaXRpb25hbEl0ZW1zU2NoZW1hUG9pbnRlciwganNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICApO1xuICAgICAgLy8gQWRkIGxpc3QgaXRlbSBsYXlvdXQgdG8gbGF5b3V0UmVmTGlicmFyeVxuICAgICAgaWYgKGl0ZW1SZWZQb2ludGVyLmxlbmd0aCAmJiAhaGFzT3duKGpzZi5sYXlvdXRSZWZMaWJyYXJ5LCBpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgLy8gU2V0IHRvIG51bGwgZmlyc3QgdG8gcHJldmVudCByZWN1cnNpdmUgcmVmZXJlbmNlIGZyb20gY2F1c2luZyBlbmRsZXNzIGxvb3BcbiAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gYnVpbGRMYXlvdXRGcm9tU2NoZW1hKFxuICAgICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgbnVsbCxcbiAgICAgICAgICBpdGVtU2NoZW1hUG9pbnRlcixcbiAgICAgICAgICBpdGVtUmVjdXJzaXZlID8gJycgOiBkYXRhUG9pbnRlciArICcvLScsXG4gICAgICAgICAgdHJ1ZSwgJ2xpc3QnLCByZW1vdmFibGUsIHRydWUsIGl0ZW1SZWN1cnNpdmUgPyBkYXRhUG9pbnRlciArICcvLScgOiAnJ1xuICAgICAgICApO1xuICAgICAgICBpZiAoaXRlbVJlY3Vyc2l2ZSkge1xuICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXS5yZWN1cnNpdmVSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbnkgYWRkaXRpb25hbCBkZWZhdWx0IGl0ZW1zXG4gICAgICBpZiAoIWl0ZW1SZWN1cnNpdmUgfHwgbmV3Tm9kZS5vcHRpb25zLnJlcXVpcmVkKSB7XG4gICAgICAgIGNvbnN0IGFycmF5TGVuZ3RoID0gTWF0aC5taW4oTWF0aC5tYXgoXG4gICAgICAgICAgaXRlbVJlY3Vyc2l2ZSA/IDAgOlxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgKyBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zLFxuICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZS5sZW5ndGggOiAwXG4gICAgICAgICksIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyk7XG4gICAgICAgIGlmIChuZXdOb2RlLml0ZW1zLmxlbmd0aCA8IGFycmF5TGVuZ3RoKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IG5ld05vZGUuaXRlbXMubGVuZ3RoOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtcy5wdXNoKGdldExheW91dE5vZGUoe1xuICAgICAgICAgICAgICAkcmVmOiBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgZGF0YVBvaW50ZXI6IGRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiBpdGVtUmVjdXJzaXZlLFxuICAgICAgICAgICAgfSwganNmLCB3aWRnZXRMaWJyYXJ5LCBpc0FycmF5KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWVbaV0gOiBudWxsKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5lZWRlZCwgYWRkIGJ1dHRvbiB0byBhZGQgaXRlbXMgdG8gYXJyYXlcbiAgICAgIGlmIChuZXdOb2RlLm9wdGlvbnMuYWRkYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAgICAgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zIDwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zICYmXG4gICAgICAgIChuZXdOb2RlLml0ZW1zW25ld05vZGUuaXRlbXMubGVuZ3RoIC0gMV0gfHwge30pLnR5cGUgIT09ICckcmVmJ1xuICAgICAgKSB7XG4gICAgICAgIGxldCBidXR0b25UZXh0ID1cbiAgICAgICAgICAoKGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSB8fCB7fSkub3B0aW9ucyB8fCB7fSkudGl0bGU7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGJ1dHRvblRleHQgPyAnQWRkICcgOiAnQWRkIHRvICc7XG4gICAgICAgIGlmICghYnV0dG9uVGV4dCkge1xuICAgICAgICAgIGJ1dHRvblRleHQgPSBzY2hlbWEudGl0bGUgfHwgZml4VGl0bGUoSnNvblBvaW50ZXIudG9LZXkoZGF0YVBvaW50ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIS9eYWRkXFxiL2kudGVzdChidXR0b25UZXh0KSkgeyBidXR0b25UZXh0ID0gcHJlZml4ICsgYnV0dG9uVGV4dDsgfVxuICAgICAgICBuZXdOb2RlLml0ZW1zLnB1c2goe1xuICAgICAgICAgIF9pZDogdW5pcXVlSWQoKSxcbiAgICAgICAgICBhcnJheUl0ZW06IHRydWUsXG4gICAgICAgICAgYXJyYXlJdGVtVHlwZTogJ2xpc3QnLFxuICAgICAgICAgIGRhdGFQb2ludGVyOiBuZXdOb2RlLmRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBsaXN0SXRlbXM6IG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMsXG4gICAgICAgICAgICBtYXhJdGVtczogbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zLFxuICAgICAgICAgICAgbWluSXRlbXM6IG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyxcbiAgICAgICAgICAgIHJlbW92YWJsZTogZmFsc2UsXG4gICAgICAgICAgICB0aXRsZTogYnV0dG9uVGV4dCxcbiAgICAgICAgICAgIHR1cGxlSXRlbXM6IG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiBpdGVtUmVjdXJzaXZlLFxuICAgICAgICAgIHR5cGU6ICckcmVmJyxcbiAgICAgICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCckcmVmJyksXG4gICAgICAgICAgJHJlZjogaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9IGVsc2UgaWYgKG5ld05vZGUuZGF0YVR5cGUgPT09ICckcmVmJykge1xuICAgIGNvbnN0IHNjaGVtYVJlZiA9IEpzb25Qb2ludGVyLmNvbXBpbGUoc2NoZW1hLiRyZWYpO1xuICAgIGNvbnN0IGRhdGFSZWYgPSBKc29uUG9pbnRlci50b0RhdGFQb2ludGVyKHNjaGVtYVJlZiwganNmLnNjaGVtYSk7XG4gICAgbGV0IGJ1dHRvblRleHQgPSAnJztcblxuICAgIC8vIEdldCBuZXdOb2RlIHRpdGxlXG4gICAgaWYgKG5ld05vZGUub3B0aW9ucy5hZGQpIHtcbiAgICAgIGJ1dHRvblRleHQgPSBuZXdOb2RlLm9wdGlvbnMuYWRkO1xuICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5uYW1lICYmICEvXlxcZCskLy50ZXN0KG5ld05vZGUubmFtZSkpIHtcbiAgICAgIGJ1dHRvblRleHQgPVxuICAgICAgICAoL15hZGRcXGIvaS50ZXN0KG5ld05vZGUubmFtZSkgPyAnJyA6ICdBZGQgJykgKyBmaXhUaXRsZShuZXdOb2RlLm5hbWUpO1xuXG4gICAgICAvLyBJZiBuZXdOb2RlIGRvZXNuJ3QgaGF2ZSBhIHRpdGxlLCBsb29rIGZvciB0aXRsZSBvZiBwYXJlbnQgYXJyYXkgaXRlbVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwYXJlbnRTY2hlbWEgPVxuICAgICAgICBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciwgMCwgLTEpO1xuICAgICAgaWYgKGhhc093bihwYXJlbnRTY2hlbWEsICd0aXRsZScpKSB7XG4gICAgICAgIGJ1dHRvblRleHQgPSAnQWRkIHRvICcgKyBwYXJlbnRTY2hlbWEudGl0bGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwb2ludGVyQXJyYXkgPSBKc29uUG9pbnRlci5wYXJzZShuZXdOb2RlLmRhdGFQb2ludGVyKTtcbiAgICAgICAgYnV0dG9uVGV4dCA9ICdBZGQgdG8gJyArIGZpeFRpdGxlKHBvaW50ZXJBcnJheVtwb2ludGVyQXJyYXkubGVuZ3RoIC0gMl0pO1xuICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuYXNzaWduKG5ld05vZGUsIHtcbiAgICAgIHJlY3Vyc2l2ZVJlZmVyZW5jZTogdHJ1ZSxcbiAgICAgIHdpZGdldDogd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQoJyRyZWYnKSxcbiAgICAgICRyZWY6IGRhdGFSZWYsXG4gICAgfSk7XG4gICAgT2JqZWN0LmFzc2lnbihuZXdOb2RlLm9wdGlvbnMsIHtcbiAgICAgIHJlbW92YWJsZTogZmFsc2UsXG4gICAgICB0aXRsZTogYnV0dG9uVGV4dCxcbiAgICB9KTtcbiAgICBpZiAoaXNOdW1iZXIoSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIsIDAsIC0xKS5tYXhJdGVtcykpIHtcbiAgICAgIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyLCAwLCAtMSkubWF4SXRlbXM7XG4gICAgfVxuXG4gICAgLy8gQWRkIGxheW91dCB0ZW1wbGF0ZSB0byBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgaWYgKGRhdGFSZWYubGVuZ3RoKSB7XG4gICAgICBpZiAoIWhhc093bihqc2YubGF5b3V0UmVmTGlicmFyeSwgZGF0YVJlZikpIHtcbiAgICAgICAgLy8gU2V0IHRvIG51bGwgZmlyc3QgdG8gcHJldmVudCByZWN1cnNpdmUgcmVmZXJlbmNlIGZyb20gY2F1c2luZyBlbmRsZXNzIGxvb3BcbiAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbZGF0YVJlZl0gPSBudWxsO1xuICAgICAgICBjb25zdCBuZXdMYXlvdXQgPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBudWxsLCBzY2hlbWFSZWYsICcnLFxuICAgICAgICAgIG5ld05vZGUuYXJyYXlJdGVtLCBuZXdOb2RlLmFycmF5SXRlbVR5cGUsIHRydWUsIHRydWUsIGRhdGFQb2ludGVyXG4gICAgICAgICk7XG4gICAgICAgIGlmIChuZXdMYXlvdXQpIHtcbiAgICAgICAgICBuZXdMYXlvdXQucmVjdXJzaXZlUmVmZXJlbmNlID0gdHJ1ZTtcbiAgICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtkYXRhUmVmXSA9IG5ld0xheW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUganNmLmxheW91dFJlZkxpYnJhcnlbZGF0YVJlZl07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWpzZi5sYXlvdXRSZWZMaWJyYXJ5W2RhdGFSZWZdLnJlY3Vyc2l2ZVJlZmVyZW5jZSkge1xuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtkYXRhUmVmXS5yZWN1cnNpdmVSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3Tm9kZTtcbn1cblxuLyoqXG4gKiAnbWFwTGF5b3V0JyBmdW5jdGlvblxuICpcbiAqIENyZWF0ZXMgYSBuZXcgbGF5b3V0IGJ5IHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIGFuIGV4aXN0aW5nIGxheW91dCB0aHJvdWdoXG4gKiBhbiBpdGVyYXRlZS4gUmVjdXJzaXZlbHkgbWFwcyB3aXRoaW4gYXJyYXkgZWxlbWVudHMgJ2l0ZW1zJyBhbmQgJ3RhYnMnLlxuICogVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCBmb3VyIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleCwgbGF5b3V0LCBwYXRoKVxuICpcbiAqIFRoZSByZXR1cm5lZCBsYXlvdXQgbWF5IGJlIGxvbmdlciAob3Igc2hvcnRlcikgdGhlbiB0aGUgc291cmNlIGxheW91dC5cbiAqXG4gKiBJZiBhbiBpdGVtIGZyb20gdGhlIHNvdXJjZSBsYXlvdXQgcmV0dXJucyBtdWx0aXBsZSBpdGVtcyAoYXMgJyonIHVzdWFsbHkgd2lsbCksXG4gKiB0aGlzIGZ1bmN0aW9uIHdpbGwga2VlcCBhbGwgcmV0dXJuZWQgaXRlbXMgaW4tbGluZSB3aXRoIHRoZSBzdXJyb3VuZGluZyBpdGVtcy5cbiAqXG4gKiBJZiBhbiBpdGVtIGZyb20gdGhlIHNvdXJjZSBsYXlvdXQgY2F1c2VzIGFuIGVycm9yIGFuZCByZXR1cm5zIG51bGwsIGl0IGlzXG4gKiBza2lwcGVkIHdpdGhvdXQgZXJyb3IsIGFuZCB0aGUgZnVuY3Rpb24gd2lsbCBzdGlsbCByZXR1cm4gYWxsIG5vbi1udWxsIGl0ZW1zLlxuICpcbiAqIC8vICAgbGF5b3V0IC0gdGhlIGxheW91dCB0byBtYXBcbiAqIC8vICB7ICh2OiBhbnksIGk/OiBudW1iZXIsIGw/OiBhbnksIHA/OiBzdHJpbmcpID0+IGFueSB9XG4gKiAgIGZ1bmN0aW9uIC0gdGhlIGZ1bmNpdG9uIHRvIGludm9rZSBvbiBlYWNoIGVsZW1lbnRcbiAqIC8vICB7IHN0cmluZ3xzdHJpbmdbXSA9ICcnIH0gbGF5b3V0UG9pbnRlciAtIHRoZSBsYXlvdXRQb2ludGVyIHRvIGxheW91dCwgaW5zaWRlIHJvb3RMYXlvdXRcbiAqIC8vICB7IGFueVtdID0gbGF5b3V0IH0gcm9vdExheW91dCAtIHRoZSByb290IGxheW91dCwgd2hpY2ggY29uYXRpbnMgbGF5b3V0XG4gKiAvL1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwTGF5b3V0KGxheW91dCwgZm4sIGxheW91dFBvaW50ZXIgPSAnJywgcm9vdExheW91dCA9IGxheW91dCkge1xuICBsZXQgaW5kZXhQYWQgPSAwO1xuICBsZXQgbmV3TGF5b3V0OiBhbnlbXSA9IFtdO1xuICBmb3JFYWNoKGxheW91dCwgKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcmVhbEluZGV4ID0gK2luZGV4ICsgaW5kZXhQYWQ7XG4gICAgY29uc3QgbmV3TGF5b3V0UG9pbnRlciA9IGxheW91dFBvaW50ZXIgKyAnLycgKyByZWFsSW5kZXg7XG4gICAgbGV0IG5ld05vZGU6IGFueSA9IGNvcHkoaXRlbSk7XG4gICAgbGV0IGl0ZW1zQXJyYXk6IGFueVtdID0gW107XG4gICAgaWYgKGlzT2JqZWN0KGl0ZW0pKSB7XG4gICAgICBpZiAoaGFzT3duKGl0ZW0sICd0YWJzJykpIHtcbiAgICAgICAgaXRlbS5pdGVtcyA9IGl0ZW0udGFicztcbiAgICAgICAgZGVsZXRlIGl0ZW0udGFicztcbiAgICAgIH1cbiAgICAgIGlmIChoYXNPd24oaXRlbSwgJ2l0ZW1zJykpIHtcbiAgICAgICAgaXRlbXNBcnJheSA9IGlzQXJyYXkoaXRlbS5pdGVtcykgPyBpdGVtLml0ZW1zIDogW2l0ZW0uaXRlbXNdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXRlbXNBcnJheS5sZW5ndGgpIHtcbiAgICAgIG5ld05vZGUuaXRlbXMgPSBtYXBMYXlvdXQoaXRlbXNBcnJheSwgZm4sIG5ld0xheW91dFBvaW50ZXIgKyAnL2l0ZW1zJywgcm9vdExheW91dCk7XG4gICAgfVxuICAgIG5ld05vZGUgPSBmbihuZXdOb2RlLCByZWFsSW5kZXgsIG5ld0xheW91dFBvaW50ZXIsIHJvb3RMYXlvdXQpO1xuICAgIGlmICghaXNEZWZpbmVkKG5ld05vZGUpKSB7XG4gICAgICBpbmRleFBhZC0tO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNBcnJheShuZXdOb2RlKSkgeyBpbmRleFBhZCArPSBuZXdOb2RlLmxlbmd0aCAtIDE7IH1cbiAgICAgIG5ld0xheW91dCA9IG5ld0xheW91dC5jb25jYXQobmV3Tm9kZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG5ld0xheW91dDtcbn1cblxuLyoqXG4gKiAnZ2V0TGF5b3V0Tm9kZScgZnVuY3Rpb25cbiAqIENvcHkgYSBuZXcgbGF5b3V0Tm9kZSBmcm9tIGxheW91dFJlZkxpYnJhcnlcbiAqXG4gKiAvLyAgIHJlZk5vZGUgLVxuICogLy8gICBsYXlvdXRSZWZMaWJyYXJ5IC1cbiAqIC8vICB7IGFueSA9IG51bGwgfSB3aWRnZXRMaWJyYXJ5IC1cbiAqIC8vICB7IGFueSA9IG51bGwgfSBub2RlVmFsdWUgLVxuICogLy8gIGNvcGllZCBsYXlvdXROb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYXlvdXROb2RlKFxuICByZWZOb2RlLCBqc2YsIHdpZGdldExpYnJhcnk6IGFueSA9IG51bGwsIG5vZGVWYWx1ZTogYW55ID0gbnVsbFxuKSB7XG5cbiAgLy8gSWYgcmVjdXJzaXZlIHJlZmVyZW5jZSBhbmQgYnVpbGRpbmcgaW5pdGlhbCBsYXlvdXQsIHJldHVybiBBZGQgYnV0dG9uXG4gIGlmIChyZWZOb2RlLnJlY3Vyc2l2ZVJlZmVyZW5jZSAmJiB3aWRnZXRMaWJyYXJ5KSB7XG4gICAgY29uc3QgbmV3TGF5b3V0Tm9kZSA9IGNsb25lRGVlcChyZWZOb2RlKTtcbiAgICBpZiAoIW5ld0xheW91dE5vZGUub3B0aW9ucykgeyBuZXdMYXlvdXROb2RlLm9wdGlvbnMgPSB7fTsgfVxuICAgIE9iamVjdC5hc3NpZ24obmV3TGF5b3V0Tm9kZSwge1xuICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiB0cnVlLFxuICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnJHJlZicpLFxuICAgIH0pO1xuICAgIE9iamVjdC5hc3NpZ24obmV3TGF5b3V0Tm9kZS5vcHRpb25zLCB7XG4gICAgICByZW1vdmFibGU6IGZhbHNlLFxuICAgICAgdGl0bGU6ICdBZGQgJyArIG5ld0xheW91dE5vZGUuJHJlZixcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3TGF5b3V0Tm9kZTtcblxuICAgIC8vIE90aGVyd2lzZSwgcmV0dXJuIHJlZmVyZW5jZWQgbGF5b3V0XG4gIH0gZWxzZSB7XG4gICAgbGV0IG5ld0xheW91dE5vZGUgPSBqc2YubGF5b3V0UmVmTGlicmFyeVtyZWZOb2RlLiRyZWZdO1xuICAgIC8vIElmIHZhbHVlIGRlZmluZWQsIGJ1aWxkIG5ldyBub2RlIGZyb20gc2NoZW1hICh0byBzZXQgYXJyYXkgbGVuZ3RocylcbiAgICBpZiAoaXNEZWZpbmVkKG5vZGVWYWx1ZSkpIHtcbiAgICAgIG5ld0xheW91dE5vZGUgPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgbm9kZVZhbHVlLFxuICAgICAgICBKc29uUG9pbnRlci50b1NjaGVtYVBvaW50ZXIocmVmTm9kZS4kcmVmLCBqc2Yuc2NoZW1hKSxcbiAgICAgICAgcmVmTm9kZS4kcmVmLCBuZXdMYXlvdXROb2RlLmFycmF5SXRlbSxcbiAgICAgICAgbmV3TGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlLCBuZXdMYXlvdXROb2RlLm9wdGlvbnMucmVtb3ZhYmxlLCBmYWxzZVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdmFsdWUgbm90IGRlZmluZWQsIGNvcHkgbm9kZSBmcm9tIGxheW91dFJlZkxpYnJhcnlcbiAgICAgIG5ld0xheW91dE5vZGUgPSBjbG9uZURlZXAobmV3TGF5b3V0Tm9kZSk7XG4gICAgICBKc29uUG9pbnRlci5mb3JFYWNoRGVlcChuZXdMYXlvdXROb2RlLCAoc3ViTm9kZSwgcG9pbnRlcikgPT4ge1xuXG4gICAgICAgIC8vIFJlc2V0IGFsbCBfaWQncyBpbiBuZXdMYXlvdXROb2RlIHRvIHVuaXF1ZSB2YWx1ZXNcbiAgICAgICAgaWYgKGhhc093bihzdWJOb2RlLCAnX2lkJykpIHsgc3ViTm9kZS5faWQgPSB1bmlxdWVJZCgpOyB9XG5cbiAgICAgICAgLy8gSWYgYWRkaW5nIGEgcmVjdXJzaXZlIGl0ZW0sIHByZWZpeCBjdXJyZW50IGRhdGFQb2ludGVyXG4gICAgICAgIC8vIHRvIGFsbCBkYXRhUG9pbnRlcnMgaW4gbmV3IGxheW91dE5vZGVcbiAgICAgICAgaWYgKHJlZk5vZGUucmVjdXJzaXZlUmVmZXJlbmNlICYmIGhhc093bihzdWJOb2RlLCAnZGF0YVBvaW50ZXInKSkge1xuICAgICAgICAgIHN1Yk5vZGUuZGF0YVBvaW50ZXIgPSByZWZOb2RlLmRhdGFQb2ludGVyICsgc3ViTm9kZS5kYXRhUG9pbnRlcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdMYXlvdXROb2RlO1xuICB9XG59XG5cbi8qKlxuICogJ2J1aWxkVGl0bGVNYXAnIGZ1bmN0aW9uXG4gKlxuICogLy8gICB0aXRsZU1hcCAtXG4gKiAvLyAgIGVudW1MaXN0IC1cbiAqIC8vICB7IGJvb2xlYW4gPSB0cnVlIH0gZmllbGRSZXF1aXJlZCAtXG4gKiAvLyAgeyBib29sZWFuID0gdHJ1ZSB9IGZsYXRMaXN0IC1cbiAqIC8vIHsgVGl0bGVNYXBJdGVtW10gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRUaXRsZU1hcChcbiAgdGl0bGVNYXAsIGVudW1MaXN0LCBmaWVsZFJlcXVpcmVkID0gdHJ1ZSwgZmxhdExpc3QgPSB0cnVlXG4pIHtcbiAgbGV0IG5ld1RpdGxlTWFwOiBUaXRsZU1hcEl0ZW1bXSA9IFtdO1xuICBsZXQgaGFzRW1wdHlWYWx1ZSA9IGZhbHNlO1xuICBpZiAodGl0bGVNYXApIHtcbiAgICBpZiAoaXNBcnJheSh0aXRsZU1hcCkpIHtcbiAgICAgIGlmIChlbnVtTGlzdCkge1xuICAgICAgICBmb3IgKGNvbnN0IGkgb2YgT2JqZWN0LmtleXModGl0bGVNYXApKSB7XG4gICAgICAgICAgaWYgKGlzT2JqZWN0KHRpdGxlTWFwW2ldKSkgeyAvLyBKU09OIEZvcm0gc3R5bGVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGl0bGVNYXBbaV0udmFsdWU7XG4gICAgICAgICAgICBpZiAoZW51bUxpc3QuaW5jbHVkZXModmFsdWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aXRsZU1hcFtpXS5uYW1lO1xuICAgICAgICAgICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7IGhhc0VtcHR5VmFsdWUgPSB0cnVlOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChpc1N0cmluZyh0aXRsZU1hcFtpXSkpIHsgLy8gUmVhY3QgSnNvbnNjaGVtYSBGb3JtIHN0eWxlXG4gICAgICAgICAgICBpZiAoaSA8IGVudW1MaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdGl0bGVNYXBbaV07XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZW51bUxpc3RbaV07XG4gICAgICAgICAgICAgIG5ld1RpdGxlTWFwLnB1c2goeyBuYW1lLCB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHsgaGFzRW1wdHlWYWx1ZSA9IHRydWU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIElmIGFycmF5IHRpdGxlTWFwIGFuZCBubyBlbnVtIGxpc3QsIGp1c3QgcmV0dXJuIHRoZSB0aXRsZU1hcCAtIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICAgICAgbmV3VGl0bGVNYXAgPSB0aXRsZU1hcDtcbiAgICAgICAgaWYgKCFmaWVsZFJlcXVpcmVkKSB7XG4gICAgICAgICAgaGFzRW1wdHlWYWx1ZSA9ICEhbmV3VGl0bGVNYXBcbiAgICAgICAgICAgIC5maWx0ZXIoaSA9PiBpLnZhbHVlID09PSB1bmRlZmluZWQgfHwgaS52YWx1ZSA9PT0gbnVsbClcbiAgICAgICAgICAgIC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGVudW1MaXN0KSB7IC8vIEFsdGVybmF0ZSBKU09OIEZvcm0gc3R5bGUsIHdpdGggZW51bSBsaXN0XG4gICAgICBmb3IgKGNvbnN0IGkgb2YgT2JqZWN0LmtleXMoZW51bUxpc3QpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZW51bUxpc3RbaV07XG4gICAgICAgIGlmIChoYXNPd24odGl0bGVNYXAsIHZhbHVlKSkge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aXRsZU1hcFt2YWx1ZV07XG4gICAgICAgICAgbmV3VGl0bGVNYXAucHVzaCh7IG5hbWUsIHZhbHVlIH0pO1xuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7IGhhc0VtcHR5VmFsdWUgPSB0cnVlOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgeyAvLyBBbHRlcm5hdGUgSlNPTiBGb3JtIHN0eWxlLCB3aXRob3V0IGVudW0gbGlzdFxuICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBPYmplY3Qua2V5cyh0aXRsZU1hcCkpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlTWFwW3ZhbHVlXTtcbiAgICAgICAgbmV3VGl0bGVNYXAucHVzaCh7IG5hbWUsIHZhbHVlIH0pO1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkgeyBoYXNFbXB0eVZhbHVlID0gdHJ1ZTsgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChlbnVtTGlzdCkgeyAvLyBCdWlsZCBtYXAgZnJvbSBlbnVtIGxpc3QgYWxvbmVcbiAgICBmb3IgKGNvbnN0IGkgb2YgT2JqZWN0LmtleXMoZW51bUxpc3QpKSB7XG4gICAgICBjb25zdCBuYW1lID0gZW51bUxpc3RbaV07XG4gICAgICBjb25zdCB2YWx1ZSA9IGVudW1MaXN0W2ldO1xuICAgICAgbmV3VGl0bGVNYXAucHVzaCh7IG5hbWUsIHZhbHVlIH0pO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHsgaGFzRW1wdHlWYWx1ZSA9IHRydWU7IH1cbiAgICB9XG4gIH0gZWxzZSB7IC8vIElmIG5vIHRpdGxlTWFwIGFuZCBubyBlbnVtIGxpc3QsIHJldHVybiBkZWZhdWx0IG1hcCBvZiBib29sZWFuIHZhbHVlc1xuICAgIG5ld1RpdGxlTWFwID0gW3sgbmFtZTogJ1RydWUnLCB2YWx1ZTogdHJ1ZSB9LCB7IG5hbWU6ICdGYWxzZScsIHZhbHVlOiBmYWxzZSB9XTtcbiAgfVxuXG4gIC8vIERvZXMgdGl0bGVNYXAgaGF2ZSBncm91cHM/XG4gIGlmIChuZXdUaXRsZU1hcC5zb21lKHRpdGxlID0+IGhhc093bih0aXRsZSwgJ2dyb3VwJykpKSB7XG4gICAgaGFzRW1wdHlWYWx1ZSA9IGZhbHNlO1xuXG4gICAgLy8gSWYgZmxhdExpc3QgPSB0cnVlLCBmbGF0dGVuIGl0ZW1zICYgdXBkYXRlIG5hbWUgdG8gZ3JvdXA6IG5hbWVcbiAgICBpZiAoZmxhdExpc3QpIHtcbiAgICAgIG5ld1RpdGxlTWFwID0gbmV3VGl0bGVNYXAucmVkdWNlKChncm91cFRpdGxlTWFwLCB0aXRsZSkgPT4ge1xuICAgICAgICBpZiAoaGFzT3duKHRpdGxlLCAnZ3JvdXAnKSkge1xuICAgICAgICAgIGlmIChpc0FycmF5KHRpdGxlLml0ZW1zKSkge1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcCA9IFtcbiAgICAgICAgICAgICAgLi4uZ3JvdXBUaXRsZU1hcCxcbiAgICAgICAgICAgICAgLi4udGl0bGUuaXRlbXMubWFwKGl0ZW0gPT5cbiAgICAgICAgICAgICAgICAoeyAuLi5pdGVtLCAuLi57IG5hbWU6IGAke3RpdGxlLmdyb3VwfTogJHtpdGVtLm5hbWV9YCB9IH0pXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAodGl0bGUuaXRlbXMuc29tZShpdGVtID0+IGl0ZW0udmFsdWUgPT09IHVuZGVmaW5lZCB8fCBpdGVtLnZhbHVlID09PSBudWxsKSkge1xuICAgICAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhc093bih0aXRsZSwgJ25hbWUnKSAmJiBoYXNPd24odGl0bGUsICd2YWx1ZScpKSB7XG4gICAgICAgICAgICB0aXRsZS5uYW1lID0gYCR7dGl0bGUuZ3JvdXB9OiAke3RpdGxlLm5hbWV9YDtcbiAgICAgICAgICAgIGRlbGV0ZSB0aXRsZS5ncm91cDtcbiAgICAgICAgICAgIGdyb3VwVGl0bGVNYXAucHVzaCh0aXRsZSk7XG4gICAgICAgICAgICBpZiAodGl0bGUudmFsdWUgPT09IHVuZGVmaW5lZCB8fCB0aXRsZS52YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ3JvdXBUaXRsZU1hcC5wdXNoKHRpdGxlKTtcbiAgICAgICAgICBpZiAodGl0bGUudmFsdWUgPT09IHVuZGVmaW5lZCB8fCB0aXRsZS52YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgaGFzRW1wdHlWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBncm91cFRpdGxlTWFwO1xuICAgICAgfSwgW10pO1xuXG4gICAgICAvLyBJZiBmbGF0TGlzdCA9IGZhbHNlLCBjb21iaW5lIGl0ZW1zIGZyb20gbWF0Y2hpbmcgZ3JvdXBzXG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1RpdGxlTWFwID0gbmV3VGl0bGVNYXAucmVkdWNlKChncm91cFRpdGxlTWFwLCB0aXRsZSkgPT4ge1xuICAgICAgICBpZiAoaGFzT3duKHRpdGxlLCAnZ3JvdXAnKSkge1xuICAgICAgICAgIGlmICh0aXRsZS5ncm91cCAhPT0gKGdyb3VwVGl0bGVNYXBbZ3JvdXBUaXRsZU1hcC5sZW5ndGggLSAxXSB8fCB7fSkuZ3JvdXApIHtcbiAgICAgICAgICAgIGdyb3VwVGl0bGVNYXAucHVzaCh7IGdyb3VwOiB0aXRsZS5ncm91cCwgaXRlbXM6IHRpdGxlLml0ZW1zIHx8IFtdIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFzT3duKHRpdGxlLCAnbmFtZScpICYmIGhhc093bih0aXRsZSwgJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIGdyb3VwVGl0bGVNYXBbZ3JvdXBUaXRsZU1hcC5sZW5ndGggLSAxXS5pdGVtc1xuICAgICAgICAgICAgICAucHVzaCh7IG5hbWU6IHRpdGxlLm5hbWUsIHZhbHVlOiB0aXRsZS52YWx1ZSB9KTtcbiAgICAgICAgICAgIGlmICh0aXRsZS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRpdGxlLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBncm91cFRpdGxlTWFwLnB1c2godGl0bGUpO1xuICAgICAgICAgIGlmICh0aXRsZS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRpdGxlLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdyb3VwVGl0bGVNYXA7XG4gICAgICB9LCBbXSk7XG4gICAgfVxuICB9XG4gIGlmICghZmllbGRSZXF1aXJlZCAmJiAhaGFzRW1wdHlWYWx1ZSkge1xuICAgIG5ld1RpdGxlTWFwLnVuc2hpZnQoeyBuYW1lOiAnPGVtPk5vbmU8L2VtPicsIHZhbHVlOiBudWxsIH0pO1xuICB9XG4gIHJldHVybiBuZXdUaXRsZU1hcDtcbn1cbiJdfQ==