import type { auto, IComponentOptions, IDirective, IModule } from 'angular';

/**
 * Gets the binding object by the component or directive name.
 *
 * @param componentName - the component or directive name in camelCase.
 * @param module - angularJs module.
 * @param injector - angularJs injector.
 * @returns object with the scope or bindings object of the component or directive.
 */
function getBindings(componentName: string, module: IModule, injector: auto.IInjectorService): Record<string, string> {
    // Look for the component with the componentName name in angular's invokeQueue
    const component: IComponentOptions | undefined = module['_invokeQueue'].filter(
        (item) => item[1] === 'component' && item[2][0] === componentName,
    )?.[0]?.[2]?.[1];
    if (component) {
        return component.bindings || {};
    }

    // Look for the directive with the componentName name in angular's invokeQueue
    const directiveFunc: (() => IDirective) | undefined = module['_invokeQueue'].filter(
        (item) => item[1] === 'directive' && item[2][0] === componentName,
    )?.[0]?.[2]?.[1];
    const directive: IDirective | undefined = directiveFunc && injector.invoke(directiveFunc);
    if (directive && typeof directive.scope !== 'boolean') {
        return typeof directive.bindToController === 'object' ? directive.bindToController : directive.scope || {};
    }

    return {};
}

export default getBindings;
