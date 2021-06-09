# angularToReact

Convert an AngularJS component to React.

It works with all type of bindings. If it's a two way binding (type `=`), it will add an onChange prop. For example, if
you have a two way binding called `name`, you can pass `onNameChange` to be notified when it changes.

```typescript
angularToReact(componentName: string, module: angular.IModule, callbackParameters?: {[key: string]: string[]}): React.FunctionalComponent
```

| Parameter            | Type                        | Description                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `componentName`      | `string`                    | the name of the AngularJS component.                                                                                                                                                                                                                                                                                                                   |
| `module`             | `angular.IModule`           | AngularJS module.                                                                                                                                                                                                                                                                                                                                      |
| `callbackParameters` | `{[key: string]: string[]}` | (Optional) An object that maps between a callback binding name (type `&`) to it's argument names. For example, for `this.onChange({ firstName, lastName })`, the object you will need to pass is `{ onChange: ['firstName', 'lastName'] }`. To use it in React, do the following: `<SomeComponent onChange={(firstName, lastName) => { /* ... */ }} />`. |

### Returns

A React component.

### Example

```javascript
// someComponent.js

angular.module('myModule').component('someComponent', {
    bindings: {
        lastName: '@',
        background: '<',
        name: '=firstName',
        onClick: '&',
    },
    template: `
        <div ng-style="{ backgroundColor: $ctrl.background }">
            First name:
            <input ng-model="$ctrl.name" />
            
            Last Name: 
            {{ $ctrl.lastName }}
            
            <button ng-click="onClick()">Click me!</button>
        </div>
    `,
    controller: ['$scope', function ($scope) {
        $scope.onClick = () => {
            this.onClick({ submitDate: new Date() });
        }
    }],
});

// OtherAngularComponent.jsx

const SomeComponent = angularToReact(
    'some-component',
    angular.module('myModule'),
    {
        onClick: ['submitDate']
    }
)

const OtherAngularComponent = () => {
    const [firstName, setFirstName] = useState("John");

    return (
        <SomeComponent
            firstName={firstName}
            onFirstNameChange={setFirstName}
            lastName="Doe"
            background="yellow"
            onClick={(date) => alert(`Submitted at ${date.toISOString()}`)}
        />
    );
};
```