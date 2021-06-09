import React, { useEffect, useRef, useState } from 'react';
import toAngularJsProps from './toAngularJsProps';
import type { IModule, IScope } from 'angular';
import useAngularService from '../useAngularService/useAngularService';
import camelcase from 'camelcase';
import getAngularJsPropsMetadata, { AngularJsPropMetadata } from './getAngularJsPropsMetadata';
import getBindings from './getBindings';

export type CallbackParameters<PROPS extends Record<string, unknown>> = Partial<
    {
        [K in keyof PROPS]: PROPS[K] extends ((...args: any[]) => any) | undefined ? string[] : never;
    }
>;

/**
 * The scope of the angular component that's generated in angularToReact.
 */
type AngularToReactScope<PROPS extends Record<string, unknown>> = IScope & { props?: PROPS };

/**
 * Converts an AngularJS component or directive to a react component.
 *
 * If you would like to have the angular component supported inside React components as well, we need to handle
 * the callbacks it might use as well.
 *
 * We use callbackParameters property to bind the parameters of callbacks.
 * Inside the callbackParameters map should appear all callbacks of the component as keys in the map,
 * and their value should be an array of the callback parameters.
 *
 * For example, if I have a callback that is called myCallback and from my angular component
 * I call this callback like this - myCallback(parameterOne, parameterTwo, parameterThree),
 * then my callbackParameters map would look like this -
 * {
 *     'myCallback' : [
 *         'parameterOne', 'parameterTwo', 'parameterThree'
 *     ]
 * }
 * Please note that any callback that does not exist in this callbackParameters map with its parameters,
 * will not be supported when using the component inside a React component.
 *
 * To get notified when the value of a two way binding prop was changed, you can pass a specific on change prop
 * which will be called with the new value.
 * For example, if your two way binding prop called userName, then you can pass onUserNameChange and it will be
 * triggered when the component updates userName.
 *
 * @example
 * const AngularComponent = angularToReact('angular-component');
 *
 * const ExampleComponent = () => {
 *     return (
 *         <AngularComponent
 *             bindingExample="example value"
 *             anotherBindingExample={true}
 *         />
 *     );
 * }
 *
 * @example callback bindings (&)
 * // Inside the 'angularComponent' component, you trigger the callback by:
 * this.onNameChange({
 *     newFirstName: firstName,
 *     newMiddleName: middleName,
 *     newLastName: lastName,
 * });
 *
 * // In the angularToReact you should declare the callback and it's variables:
 * const AngularComponent = angularToReact(
 *     'angular-component',
 *     {
 *          'onNameChange': [
 *              'newFirstName',
 *              'newMiddleName',
 *              'newLastName',
 *          ]
 *     }
 * );
 *
 * // Then you can use the prop:
 * <AngularComponent onNameChange={(newFirstName, newMiddleName, newLastName) => {...}} />
 *
 * @example two way binding (=)
 * // Inside the 'angularComponent' component, you declare the binding as:
 * bindings: {
 *     userName: '=',
 * }
 *
 * // angularToReact will add a new prop, called 'onUserNameChange':
 * const AngularComponent = angularToReact('angular-component');
 * const ExampleComponent = () => {
 *     const [userName, setUserName] = useState('initial name');
 *     return (
 *         <AngularComponent
 *             userName={userName}
 *             onUserNameChange={setUserName}
 *         />
 *     );
 * }
 *
 * @param componentName - the name of the component.
 * @param module - angularJs module.
 * @param callbackParameters - if your angular component has callback functions, to map between the parameter names
 * returned from angular to the prop passed in the function, you should specify it here.
 * @returns a react component with the same props as the angular bindings.
 */
function angularToReact<T extends Record<string, any> = any>(
    componentName: string,
    module: IModule,
    callbackParameters?: CallbackParameters<T>,
): React.FC<T> {
    // We can't be sure that the angular component has been initialized when angularToReact is called, so we are
    // getting the bindings list and creating the params only when the react component is mounted.
    let angularJsPropsMetadata: AngularJsPropMetadata<keyof T & string>[] | undefined;
    let angularJsBindings: Record<string, string> | undefined;

    const Component: React.FC<T> = (props) => {
        const $injector = useAngularService('$injector');
        const $timeout = useAngularService('$timeout');
        const $compile = useAngularService('$compile');
        const $rootScope = useAngularService('$rootScope');

        const angularElementRef = useRef<HTMLElement>();
        const angularHasBeenCompiledRef = useRef(false);

        const [scope, setScope] = useState<AngularToReactScope<T>>();

        if (!angularJsPropsMetadata) {
            angularJsPropsMetadata = getAngularJsPropsMetadata(
                getBindings(camelcase(componentName), module, $injector) as T,
                callbackParameters,
            );
        }
        if (!angularJsBindings) {
            angularJsBindings = toAngularJsProps(angularJsPropsMetadata);
        }

        /**
         * Create the angular scope for the component, and when the component unmounts, destroy the scope.
         * We use a `useEffect` and `useState` instead of `useMemo` because we need the cleanup function.
         */
        useEffect(() => {
            const newScope: AngularToReactScope<T> = $rootScope.$new(true);
            setScope(newScope);

            return () => {
                // If digest currently running, we will schedule the destroy to the next digest using destroy.
                // Otherwise, we will call destroy immediately.
                if ($rootScope.$$phase) {
                    $timeout(() => {
                        newScope.$destroy();
                    });
                } else {
                    newScope.$destroy();
                }
            };
        }, [$rootScope, $timeout]);

        /**
         * Update the scope with the updated props, compile the component if it's not compiled yet, queue a digest
         * cycle, and add watchers for two way bindings.
         * This `useEffect` runs on every rerender and therefore has no deps array. We wrap the component with
         * `React.memo` so we can be sure that it's being re-rendered only when one of the props changes.
         */
        useEffect(() => {
            if (!scope) {
                return;
            }

            const twoWayBindingsGettersAndSetters = angularJsPropsMetadata
                ?.filter((metadata) => metadata.isTwoWayBinding)
                .map(({ propName }) => ({
                    get [propName]() {
                        return props[propName];
                    },
                    set [propName](newValue) {
                        props[`on${camelcase(propName)}Change`]?.(newValue);
                    },
                }));

            // We mutate the scope because that's how angular scope works. ¯\_(ツ)_/¯
            scope.props = {
                ...props,
                ...twoWayBindingsGettersAndSetters,
            };

            // If angular has not been compiled, compile it.
            if (!angularHasBeenCompiledRef.current && angularElementRef.current) {
                $compile(angularElementRef.current)(scope);
                angularHasBeenCompiledRef.current = true;
            }

            // Execute a digest in the next execution cycle
            $timeout();

            // **Don't add a deps array**, we don't have it intentionally. Read the comment above the useEffect.
        });

        return React.createElement(componentName, {
            ...angularJsBindings,
            ref: angularElementRef,
        });
    };

    // Adding display name to the component and to the memorized component, to show
    // in the react dev tools the angular component name (making it clear that it's
    // an angular component in react), instead of just "component" or "anonymous".
    Component.displayName = camelcase(componentName);

    return React.memo(Component);
}

export default angularToReact;
