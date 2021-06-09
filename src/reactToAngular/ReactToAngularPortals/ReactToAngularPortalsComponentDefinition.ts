import React from 'react';
import type { auto } from 'angular';

interface ReactToAngularPortalsComponentDefinition {
    component: React.ReactElement;
    container: HTMLElement;
    $injector: auto.IInjectorService;
}

export default ReactToAngularPortalsComponentDefinition;

export interface ReactToAngularPortalsComponentDefinitionWithId extends ReactToAngularPortalsComponentDefinition {
    id: number;
}
