# useAngularService

A hook to get an AngularJS service.

```typescript
useAngularService(serviceName: string): any
```

| Parameter     | Type     | Description                        |
| ------------- | -------- | ---------------------------------- |
| `serviceName` | `string` | the name of the AngularJS service. |

### Returns

The requested AngularJS service.

### Example

```javascript
const Greeting = ({ userId }) => {
    const [user, setUser] = useState([]);

    const $http = useAngularService('$http');

    useEffect(() => {
        $http.get(`user/${userId}`).then(response => setUsers(response.data));
    }, [userId])

    return (
        <strong>
            Hello, {user?.name || 'buddy'}!
        </strong>
    );
};
```

## Add service type

If you want `useAngularService` to recognise your custom services and return their type, you should extend
the `AngularServices` interface:

```typescript
declare module 'angulareact' {
    export interface AngularServices {
        customService: CustomServiceType;
    }
}
```

Then, when you'll call `useAngularService('customService')'` the return type will be `CustomServiceType`.