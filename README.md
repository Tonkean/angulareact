# angulareact

[![npm](https://img.shields.io/npm/v/angulareact?style=flat-square)](https://www.npmjs.com/package/angulareact)
[![license](https://img.shields.io/github/license/tonkean/angulareact?style=flat-square)](LICENSE)
![top language](https://img.shields.io/github/languages/top/tonkean/angulareact?style=flat-square)
![dependencies](https://img.shields.io/david/tonkean/angulareact?style=flat-square)

A way to seamlessly integrate React and AngularJS.

Great for projects slowly migrating from AngularJS to React, supports using React components in AngularJS and vice versa
with full component functionality, bindings and existing angular services.

## Installation

The package can be installed via [npm](https://github.com/npm/cli):

```
npm install angulareact --save
```

Or via [yarn](https://github.com/yarnpkg/yarn):

```
yarn add angulareact
```

You will need AngularJS 1.5 or newer, and React 16.8 or newer.

## Setup

Add the React component `<ReactToAngularPortals />` to your DOM:

```javascript
ReactDOM.render(<ReactToAngularPortals />, document.querySelector('#react-root'));
```

For a more information about ReactToAngularPortals [click here](src/reactToAngular/README.md#ReactToAngularPortals).

## Usage

### [reactToAngular](src/reactToAngular/README.md)

**Convert a React component to AngularJS**

The most basic use of the reactToAngular can be described with:

```javascript
const SomeComponent = ({ firstName, onClick }) => {
    return <button onClick={onClick}>Greet {firstName}</button>;
};

angular.module('myModule').component(
    'someCompoennt',
    reactToAngular(SomeComponent, ['firstName', 'onClick'])
);
```

After the conversion you can use the component like so:

```html
<some-component first-name="data.firstName" on-click="onClick"></some-component>
```

**Note:** All the bindings in the component will be of type `<`, which means that to pass a callback, you should pass
its reference and not execute it in the prop.

For a more information about reactToAngular [click here](src/reactToAngular/README.md).

### [angularToReact](src/angularToReact/README.md)

**Converts an AngularJS component to React.**

The most basic use of the angularToReact can be described with:

```javascript
const SomeAngularComponent = angularToReact('some-angular-component', angular.module('myModule'));

const SomeComponent = ({ name }) => {
    return <SomeAngularComponent name={name} />;
};
```

For a more information about angularToReact [click here](src/angularToReact/README.md).

### [useAngularService](src/useAngularService/README.md)

**A hook to get an AngularJS service.**

The most basic use of the angularToReact can be described with:

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
}
```

For a more information about useAngularService [click here](src/useAngularService/README.md).

### [useAngularWatch](src/useAngularWatch/README.md)

**A hook used for watching on changes during digest cycles.**

The most basic use of the angularToReact can be described with:

```javascript
 const UsernameThatUpdates = () => {
    const userService = useAngularService("userService");
    const [username] = useAngularWatch(() => userService.currentUser.name);

    return (
        <strong>
            { username }
        </strong>
    );
};
```

For a more information about useAngularWatch [click here](src/useAngularWatch/README.md).

## Caveats

If you want to use one of the hooks or angularToReact in a component that is not a descendent of a component that was added using reactToAngular, you must wrap your React root with `AngularInjectorContext` and pass the AngularJS injector:

```javascript
angular.module("myModule")
    .run(['$injector', ($injector) => {
        ReactDOM.render(
            <AngularInjectorContext.Provider value={$injector}>
                <YourReactRoot />
            </AngularInjectorContext>,
            document.querySelector('#react-root'),
        );
    }])
```


## License

Licensed under MIT license, see [LICENSE](LICENSE) for the full license.