import type { CallbackParameters } from './angularToReact';
import parseBindingProperties from './parseBindingProperties';

export interface AngularJsPropMetadata<Key> {
    propName: Key;
    propValue: string;
    isTwoWayBinding: boolean;
}

/**
 * Generate angularJs props metadata from a binding object, with the attribute name as the binding name and attribute
 * value which points to the scope to get the value.
 *
 * @example
 * angular.module('myModule').component('angularComponent', {
 *     bindings: {
 *         oneWayBindingExample: '<',
 *         stringBindingExample: '@',
 *         callbackBindingExample: '&',
 *         twoWayDataBinding: '=',
 *         renamedDataBinding: '<differentName',
 *     },
 * });
 *
 * const bindings = getAngularBindingsSummary('angularComponent', angular.module('myModule'));
 * toAngularJsProps(bindings, {
 *     callbackBindingExample: [
 *         'firstParamName',
 *         'secondParamName',
 *     ],
 * });
 * // [
 * //     {propName: 'oneWayBindingExample', propValue: 'props.oneWayBindingExample', isTwoWayBinding: false}
 * //     {propName: 'stringBindingExample', propValue: '{{props.stringBindingExample}}', isTwoWayBinding: false}
 * //     {propName: 'callbackBindingExample', propValue: 'props.callbackBindingExample(firstParamName, secondParamName)', isTwoWayBinding: false}
 * //     {propName: 'twoWayDataBinding', propValue: 'props.oneWayBindingExample', isTwoWayBinding: true}
 * //     {propName: 'differentName', propValue: 'props.differentName', isTwoWayBinding: false}
 * // ]
 *
 * @param bindings - an object with a scope map and optionally callback parameters map from the component or the
 * directive factories.
 * @param callbackParameters - an object that maps a callback binding to the parameters it exports.
 * @returns list of props metadata.
 */
function getAngularJsPropsMetadata<T extends Record<string, string>>(
    bindings: T,
    callbackParameters: CallbackParameters<T> | undefined,
): AngularJsPropMetadata<keyof T & string>[] {
    return Object.entries(bindings).map(([internalBindingName, bindingProperties]) => {
        const { bindingName, bindingType } = parseBindingProperties(internalBindingName, bindingProperties);

        let propValue: string;
        switch (bindingType) {
            case '@': {
                propValue = `{{props.${bindingName}}}`;
                break;
            }
            case '&': {
                const callbackParams = callbackParameters?.[bindingName]?.join(',');
                propValue = `props.${bindingName}(${callbackParams || ''})`;
                break;
            }
            default: {
                propValue = `props.${bindingName}`;
                break;
            }
        }

        return { propName: bindingName, isTwoWayBinding: bindingType === '=', propValue };
    });
}

export default getAngularJsPropsMetadata;
