import ReactDOM from 'react-dom';
import React, { useEffect, useState } from 'react';
import reactToAngularPortalsManager from './reactToAngularPortalsManager';
import { ReactToAngularPortalsComponentDefinitionWithId } from './ReactToAngularPortalsComponentDefinition';
import AngularInjectorContext from '../../AngularInjectorContext';

const ReactToAngularPortals: React.FC = () => {
    const [componentDefinitions, setComponentDefinitions] = useState(
        [] as ReactToAngularPortalsComponentDefinitionWithId[],
    );

    useEffect(() => {
        reactToAngularPortalsManager.addSetComponentDefinitions(setComponentDefinitions);

        return () => {
            reactToAngularPortalsManager.removeSetComponentDefinitions();
        };
    }, []);

    return (
        <>
            {componentDefinitions.map((componentDefinition) => (
                <AngularInjectorContext.Provider value={componentDefinition.$injector} key={componentDefinition.id}>
                    {ReactDOM.createPortal(componentDefinition.component, componentDefinition.container)}
                </AngularInjectorContext.Provider>
            ))}
        </>
    );
};

export default React.memo(ReactToAngularPortals);
