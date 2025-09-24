import React from 'react';
import ReactToAngularPortalsComponentDefinition, {
    ReactToAngularPortalsComponentDefinitionWithId,
} from './ReactToAngularPortalsComponentDefinition';

type SetComponentDefinitions = React.Dispatch<React.SetStateAction<ReactToAngularPortalsComponentDefinitionWithId[]>>;
export type ReactToAngularPortalsManagerConfiguration = {
    /**
     * If true this will not replace the reference when creating a definition for an existing component. This is a risk mitigating flag in case this solution causes problems.
     * There is a bug where if the component is loaded before ReactToAngularPortals (if its the first component most likely)
     * it will not be cleaned up correctly when unmounting and may cause strange behavior if returned to the same state since there will be 2 of the same components.
     */
    dontCreateNewDefinitionForExistingComponent?: boolean;
}

class ReactToAngularPortalsManager {
    private configuration: ReactToAngularPortalsManagerConfiguration;

    private componentDefinitionsCounter = 0;

    private setComponentDefinitions: SetComponentDefinitions | undefined;
    /** Stores all component definition that has not been added to the state. */
    private componentDefinitionsQueue: ReactToAngularPortalsComponentDefinitionWithId[] = [];
    /** Stores all component definition. Used to remove previous component when re-declaring angular component. */
    private componentDefinitionsCache: ReactToAngularPortalsComponentDefinitionWithId[] = [];

    public initialize(configuration: ReactToAngularPortalsManagerConfiguration) {
        this.configuration = configuration
    }

    /**
     * Add a component to an html element.
     *
     * @param componentDefinition - the component definition to add.
     * @returns a cleanup function that will remove the component from the html element.
     */
    public addComponentDefinition(componentDefinition: ReactToAngularPortalsComponentDefinition): () => void {
        const newComponentDefinitionWithId = this.createComponentDefinitionWithId(componentDefinition);

        if (this.setComponentDefinitions) {
            // Add to state
            this.setComponentDefinitions((currentList) => [...currentList, newComponentDefinitionWithId]);
        } else {
            // Add to queue
            this.componentDefinitionsQueue = [...this.componentDefinitionsQueue, newComponentDefinitionWithId];
        }

        // Remove function
        return () => {
            this.removeComponentDefinition(newComponentDefinitionWithId);
        };
    }

    /**
     * Get a component definition with id, and if it's a re-decalre (there is already a component in the same
     * container), removes the existing component
     *
     * @param component - the component to add.
     * @param container - the html element.
     * @param $injector - AngularJs service injector.
     * @returns a component definition with id.
     */
    private createComponentDefinitionWithId({
        component,
        container,
        $injector,
    }: ReactToAngularPortalsComponentDefinition): ReactToAngularPortalsComponentDefinitionWithId {
        const existingComponentDefinition = this.componentDefinitionsCache.find(
            (componentDefinition) => componentDefinition.container === container,
        );

        if (existingComponentDefinition) {
            // Remove existing component definition
            this.removeComponentDefinition(existingComponentDefinition);
            if (this.configuration?.dontCreateNewDefinitionForExistingComponent) {
                return existingComponentDefinition;
            }
        }

        const id = existingComponentDefinition?.id || this.componentDefinitionsCounter++;
        const newComponentDefinitionWithId = {
            id,
            container,
            component,
            $injector,
        };

        this.componentDefinitionsCache = [...this.componentDefinitionsCache, newComponentDefinitionWithId];

        return newComponentDefinitionWithId;
    }

    public addSetComponentDefinitions(setComponentDefinitions: SetComponentDefinitions) {
        this.setComponentDefinitions = setComponentDefinitions;

        this.addComponentDefinitionsFromQueue();
    }

    public removeSetComponentDefinitions() {
        this.setComponentDefinitions = undefined;
    }

    private addComponentDefinitionsFromQueue() {
        this.componentDefinitionsQueue.forEach((component) => this.addComponentDefinition(component));

        // free up the memory.
        this.componentDefinitionsQueue = [];
    }

    private removeComponentDefinition(componentToRemove: ReactToAngularPortalsComponentDefinitionWithId) {
        if (this.setComponentDefinitions) {
            // Remove from state.
            this.setComponentDefinitions((currentList) =>
                currentList.filter((component) => component !== componentToRemove),
            );
        } else {
            // Remove from queue
            this.componentDefinitionsQueue = this.componentDefinitionsQueue.filter(
                (component) => component !== componentToRemove,
            );
        }

        // Remove from cache
        this.componentDefinitionsCache = this.componentDefinitionsCache.filter(
            (component) => component !== componentToRemove,
        );
    }
}

const reactToAngularPortalsManager = new ReactToAngularPortalsManager();
export default reactToAngularPortalsManager;
