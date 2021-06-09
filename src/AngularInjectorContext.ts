import React from 'react';
import type { auto } from 'angular';

const fakeInjectorService = {
    get() {
        throw new Error('You are using the AngularJS injector context value without a provider.');
    },
};

const AngularInjectorContext = React.createContext<auto.IInjectorService>(fakeInjectorService as any);

export default AngularInjectorContext;
