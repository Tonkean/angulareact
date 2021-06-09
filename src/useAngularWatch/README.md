# useAngularWatch

A hook used for watching on changes during digest cycles.

```typescript
useAngularWatch(...watchFunctions: (rootScope: angular.IRootScopeService) => any): any[]
```

| Parameter        | Type                                            | Description                                                                                                                 |
| ---------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `watchFunctions` | `(rootScope: angular.IRootScopeService) => any` | A function that will be watched for changes by AngularJS. You can access the root scope in the first param of the function. |

### Returns

List of the latest values returned by the watch functions. It will trigger a render only if one the function has
changed.

### Example

```javascript
const UsernameThatUpdates = () => {
    const userService = useAngularService("userService");

    // userService mutates the currentUser object when it updates, so it won't trigger a render 
    // in React unless we use useAngularWatch to watch the first and last name for changes. 
    const [firstName, lastName] = useAngularWatch(
        () => userService.currentUser.firstName,
        () => userService.currentUser.lastName
    );

    return (
        <strong>
            Hello, {firstName} {lastName}!
        </strong>
    )
};
 ```