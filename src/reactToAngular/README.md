# reactToAngular

Convert a React component to AngularJS

```typescript
reactToAngular(reactComponent: React.ComponentType, propNames: string[], serviceNames?: string[]): angular.IComponentOptions
```

| Parameter        | Type                  | Description                                                                                                                                                                                                                                                                         |
| ---------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reactComponent` | `React.ComponentType` | The React component. Can be either a class or function component.                                                                                                                                                                                                                   |
| `propNames`      | `string[]`            | List of props that the React component accepts. If not passed, it will assume that the component has no params. **Note:** All the bindings in the component will be of type `<`, which means that to pass a callback, you should pass its reference and not execute it in the prop. |
| `serviceNames`   | `string[]?`           | (Optional) List of AngularJS services that would be passed into the component by props. This param is for legacy support, and we suggest using the [useAngularService](../useAngularService/README.md) hook instead.                                                                |

### Returns

A component options object, which should be passed as the second param in the AngularJS component declaration.

### Example

```javascript
// SomeComponent.jsx

const SomeComponent = ({ name: initialName, onSubmit }) => {
    const [name, setName] = useState(initialName);

    return (
        <>
            <input type="text" value={name} onChange={event => setName(event.target.value)}/>
            <button onClick={() => onSubmit(name)}>Submit</button>
        </>
    );
};

angular.module('myModule').component(
    'someCompoennt',
    reactToAngular(SomeComponent, ['name', 'onSubmit'])
);

// otherAngularComponent.js

angular.module('myModule').component('otherAngularComponent', {
    template: `
        <some-component name="data.name" on-submit='onSubmit'></some-component>
    `,
    controller: ['$scope', ($scope) => {
        $scope.data = {
            name: 'John',
        };

        $scope.onSubmit = (name) => {
            alert(name);
        }
    }],
});
```

## ReactToAngularPortals

When a React component is mounted from AngularJS (using reactToAngular), it's being added to ReactToAngularPortals and using [React portals](https://reactjs.org/docs/portals.html) it's being placed in the correct DOM node. Therefore, you must add `<ReactToAngularPortals />` to your React root. 

Because all React components that are added using reactToAngular will be descendents of ReactToAngularPortals, you can wrap it with contexts and share data, for example:

```javascript
ReactDOM.render(
    <RecoilRoot>
        <ReactToAngularPortals />
    </RecoilRoot>,
    document.querySelector('#react-root'),
);
```