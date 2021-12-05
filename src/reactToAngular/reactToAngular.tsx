import type { auto, IAugmentedJQuery, IComponentOptions, IController, IOnChangesObject } from 'angular';
import React from 'react';
import type AngularServices from '../../src/AngularServices';
import UpdatableComponent, { UpdatableComponentRef } from './UpdatableComponent';
import reactToAngularPortalsManager from './ReactToAngularPortals/reactToAngularPortalsManager';

/**
 * Create an angularJs component that wraps a react component
 *
 * @example
 * const ReactComponent = ({name, onClick}) => {
 *     return <button onClick={onClick}>{name}</button>;
 * }
 * angular.module('myModule').component('reactComponent', reactToAngular(ReactComponent, ['name', 'onClick']));
 *
 * // Can be used in an angularJs template:
 * <react-component name="$ctrl.name" on-click="$ctrl.onClick"></react-component>
 *
 * @param reactComponent - the react component.
 * @param propNames - list of props to be passed to the angularJs component, in camelCase. All
 * props are one way binding (`<`), so for callbacks, pass the callback function.
 * @param serviceNames - list of services to be passed to the reactJs component, in camelCase.
 * It's preferable to use the useAngularService hook instead..
 */
function reactToAngular<PROPS = Record<any, any>, SERVICE_NAMES extends keyof AngularServices = string>(
    reactComponent: React.ComponentType<PROPS>,
    propNames: (keyof PROPS | 'children')[] = [],
    serviceNames: SERVICE_NAMES[] = [],
): IComponentOptions {
    const bindings = Object.fromEntries(propNames.map((prop) => [prop, '<']));

    return {
        bindings,
        controller: [
            '$element',
            '$injector',
            ...(serviceNames as string[]),
            class implements IController {
                /**
                 * List of requested AngularJs services.
                 */
                private readonly services: Partial<AngularServices>;
                /**
                 * This holds the remove component definition function that's returned from `addComponentDefinition`,
                 * and used when the `onDestroy` lifecycle hook is triggered to unmount the component.
                 */
                private removeReactToAngularComponentDefinition: (() => void) | undefined;
                /**
                 * This holds the ref of the updatable component. The ref has an `updateProps` method that allows
                 * us to update the binding that's being passed to the `reactComponent` from outside.
                 */
                private componentRef: React.RefObject<UpdatableComponentRef<PROPS>> = React.createRef();
                /**
                 * Has the updatable react component created and `addComponentDefinition` called?
                 */
                private reactMounted: boolean = false;
                /**
                 * Object that holds the bindings that's being passed to this component.
                 */
                private bindings: PROPS;

                constructor(
                    /**
                     * jQuery object that contains the element of the component. the react component will be mounted
                     * on this element.
                     */
                    private readonly $element: IAugmentedJQuery,
                    /**
                     * The injector service. This allows us to get any angular service in the useAngularService hook.
                     */
                    private readonly $injector: auto.IInjectorService,
                    /**
                     * List of angular services in the order they appear in the `serviceNames` list.
                     */
                    ...servicesArray: AngularServices[SERVICE_NAMES][]
                ) {
                    this.services = this.getServicesObject(servicesArray);
                }

                /**
                 * We use the `onChanges` lifecycle hook to generate and update the binding object and trigger the
                 * `updateProps` method that will update the react component.
                 */
                public $onChanges(onChangesObj: IOnChangesObject): void {
                    const currentBindings = (this.bindings || {}) as PROPS;

                    const newBindings = Object.fromEntries(
                        Object.entries(onChangesObj).map(([bindingName, { currentValue }]) => [
                            bindingName,
                            currentValue,
                        ]),
                    ) as Partial<PROPS>;

                    this.bindings = {
                        ...currentBindings,
                        ...newBindings,
                    };

                    this.updateProps();
                }

                /**
                 * In AngularJs, the onChange lifecycle hook is triggered before the onInit. Therefore we can be sure
                 * that when onInit is triggered, the binding object is already created.
                 */
                public $onInit(): void {
                    // we use an updatable component and not directly the provided `reactComponent` because it allows
                    // us to update it's state from the outside by exporting `updateProps` method in it's ref object.
                    const updatableComponent = (
                        <UpdatableComponent
                            component={reactComponent}
                            props={this.bindings!}
                            services={this.services}
                            ref={this.componentRef}
                        />
                    );

                    this.removeReactToAngularComponentDefinition = reactToAngularPortalsManager.addComponentDefinition({
                        component: updatableComponent,
                        container: this.$element[0]!,
                        $injector: this.$injector,
                    });

                    this.reactMounted = true;
                }

                /**
                 * When the angular component is destroyed, trigger the remove function of the component definition of
                 * react to angular portal.
                 */
                public $onDestroy() {
                    if (this.reactMounted) {
                        this.removeReactToAngularComponentDefinition?.();
                    }
                }

                /**
                 * Call the updateProps method on the updatable component ref object.
                 */
                private updateProps() {
                    if (this.reactMounted) {
                        this.componentRef.current?.updateProps(this.bindings);
                    }
                }

                /**
                 * Get the requested services in an object.
                 *
                 * @param servicesArray - list of angular service instances in the order they appear in the
                 * `serviceNames` list.
                 * @returns an object that maps the service name to it's instance.
                 */
                private getServicesObject(servicesArray: AngularServices[SERVICE_NAMES][]): {
                    [SERVICE_NAME in SERVICE_NAMES]: AngularServices[SERVICE_NAME];
                } {
                    const servicesObjectEntries = serviceNames.map((serviceName, index) => [
                        serviceName,
                        servicesArray[index],
                    ]);

                    return Object.fromEntries(servicesObjectEntries);
                }
            },
        ],
    };
}

export default reactToAngular;
