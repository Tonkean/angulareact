import { useEffect, useRef, useState } from 'react';
import useAngularService from '../useAngularService/useAngularService';
import type { IRootScopeService } from 'angular';

type TupleReturnType<T extends any[]> = T extends [(...args: any) => infer FuncReturnType, ...infer Rest]
    ? [FuncReturnType, ...TupleReturnType<Rest>]
    : [];

/**
 * React hook to get latest value from an object that's being updated by reference in angular. The watch function is
 * being triggered on every digest, and then compared by reference, so it's recommended to get a number, a string or
 * a boolean from the watch function.
 *
 * @example
 * const UserNameThatUpdates = () => {
 *     const userService = useAngularService("userService");
 *     const [userName] = useAngularWatch(() => userService.currentUser.name);
 *
 *     return (
 *         <strong>
 *             {userName}
 *         </strong>
 *     )
 * };
 *
 * @param watchFunctions - A function that gets the value. It will be triggered on every digest cycle to check for
 * changes.
 * @returns an array with the current value returned from the watch functions.
 */
function useAngularWatch<T extends ((rootScope: IRootScopeService) => any)[]>(
    ...watchFunctions: T
): TupleReturnType<T> {
    const rootScope = useAngularService('$rootScope');

    const [value, setValues] = useState(() => {
        return watchFunctions.map((func) => func(rootScope)) as TupleReturnType<T>;
    });

    const watchFunctionsRef = useRef(watchFunctions);
    watchFunctionsRef.current = watchFunctions;

    useEffect(() => {
        // Creating a watch array, that will wrap watchFunctionsRef's functions with a dynamic call to
        // their last instance
        const watchArray = watchFunctionsRef.current.map((_, index) => () =>
            watchFunctionsRef.current[index]!(rootScope),
        );
        const removeFunc = rootScope.$watchGroup(watchArray, (newValue: TupleReturnType<T>) => {
            // We need to clone this array because angular being angular, and uses the same array as newValue and just
            // mutates it, so to make it immutable, we create a new array on each change.
            const newValueArray: TupleReturnType<T> = [...newValue];
            setValues(newValueArray);
        });

        return () => removeFunc();
    }, [rootScope]);

    return value;
}

export default useAngularWatch;
