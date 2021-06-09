import { useContext } from 'react';
import type AngularServices from '../AngularServices';
import AngularInjectorContext from '../AngularInjectorContext';

/**
 * React hook for accessing an AngularJS service.
 *
 * @example
 * const Greeting = ({userId}) => {
 *     const [user, setUser] = useState([]);
 *
 *     const $http = useAngularService('$http');
 *
 *     useEffect(() => {
 *         $http.get(`user/${userId}`).then(response => setUsers(response.data));
 *     }, [userId])
 *
 *     return (
 *         <strong>
 *             Hello, {user?.name || 'buddy'}!
 *         </strong>
 *     );
 * }
 *
 * @param serviceName - the angular service.
 * @returns the angular service instance.
 */
function useAngularService<T extends keyof AngularServices>(serviceName: T): AngularServices[T] {
    const $injector = useContext(AngularInjectorContext);

    return $injector.get(serviceName as string);
}

export default useAngularService;
