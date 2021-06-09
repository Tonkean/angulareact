/**
 * The binding object's keys are the internal binding name, but the name to use when passing a prop from the outside
 * can be changed, by adding the name to the binding type, for example `name: '>userName'` means that internally to
 * access the binding value you will need to use `name`, but to pass the name you will have to pass `user-name`.
 *
 * @param internalBindingName - the name that's being used to access the binding value internally. If no external name
 * is provided in the binding properties, it will be used as the external name too.
 * @param bindingProperties - the value in the bindings object. A string that starts with the type (`<`, `@`, etc) and
 * might include the external binding name after the type.
 * @returns the binding type and the external binding name.
 */
function parseBindingProperties(
    internalBindingName: string,
    bindingProperties: string,
): { bindingType: string; bindingName: string } {
    const [bindingType, ...bindingNameChars] = bindingProperties;

    const bindingName = bindingNameChars.length ? bindingNameChars.join('') : internalBindingName;

    return { bindingType: bindingType!, bindingName };
}

export default parseBindingProperties;
