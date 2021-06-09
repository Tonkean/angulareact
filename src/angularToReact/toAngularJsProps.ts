import { AngularJsPropMetadata } from './getAngularJsPropsMetadata';
import decamelize from 'decamelize';

/**
 * Convert list of props metadata to an attribute map.
 *
 * @example
 * toAngularJsProps([
 *     {propName: 'oneWayBindingExample', propValue: 'props.oneWayBindingExample', isTwoWayBinding: false}
 *     {propName: 'stringBindingExample', propValue: '{{props.stringBindingExample}}', isTwoWayBinding: false}
 * ])
 * // {
 * //     one-way-binding-example: 'props.oneWayBindingExample',
 * //     string-binding-example: '{{props.stringBindingExample}}',
 * // }
 *
 * @param propsMetadata - list of angularJs props metadata.
 * @returns map with the prop as the name and a variable pointing to the props object as value, to pass to the
 * angularJs template as variables.
 */
function toAngularJsProps(propsMetadata: AngularJsPropMetadata<string>[]): Record<string, string> {
    const entries = propsMetadata.map((metadata) => [decamelize(metadata.propName, '-'), metadata.propValue]);

    return Object.fromEntries(entries);
}

export default toAngularJsProps;
