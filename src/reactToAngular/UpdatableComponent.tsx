import React, { useImperativeHandle, useState } from 'react';
import type AngularServices from '../../src/AngularServices';

export interface UpdatableComponentRef<T> {
    updateProps(newProps: T): void;
}

interface Props<T> {
    /**
     * The react component to render.
     */
    component: React.ComponentType<T>;
    /**
     * The initial props to pass to the given component.
     */
    props: T;
    /**
     * AngularJs services to pass as props to the given component.
     */
    services: Partial<AngularServices>;
}

/**
 * This component is a wrapper around a given react component, which allows modifying the props that's being passed to
 * the given component by calling `updateProps` method on the component ref object.
 */
const UpdatableComponent = <T,>(
    { component: Component, props: initialProps, services }: Props<T>,
    ref: React.Ref<UpdatableComponentRef<T>>,
) => {
    const [props, setProps] = useState(initialProps);

    useImperativeHandle(ref, () => ({
        updateProps(newProps: T) {
            setProps(newProps);
        },
    }));

    return <Component {...props} {...services} />;
};

export default React.forwardRef(UpdatableComponent);
