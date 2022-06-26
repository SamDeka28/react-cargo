# React-cargo

`react-cargo` is a minimal state management tool for React with managed updates on state transition. `react-cargo` is easy to setup, just install and you are ready to add global state to your application without the need of writing any boilerplate code. `react-cargo` exposes easy to use hook based api's.

Please visit the official website: [http://transit.codehaven.dev]()

## Installation

To install the stable version of `react-transit`

```
npm install react-cargo
```

or

```
yarn add react-cargo
```

## List of hooks

- [useStore](#useStore)
- useStoreValue
- useStoreSetter
- useSelector
- useResetStore

## Methods

- addState
- getStore

## Creating a store

Create a store is as easy as calling a function with some argument. Using `addState`, you can create a `StateInstance`, which takes an object with a key and a default state

> `key` : should be unique accross the application

> `default` : can take in Primitive as well as Non-primitive data types

```
import {addState} from "react-cargo";

export const counter = addState({
    key : 'counter',
    default : 0
})
```

## Using a store in your component

We can use `useStore`, `useStoreValue`,`useStoreSetter` or `useSelector` to use a state in our component.

```
import {addState} from "react-cargo";

const counter = addState({
    key : 'counter',
    default : 0
});

function Counter(){
    let [count,setCount] = useStore(counter);
    return <div>
        <h4>Counter {count}</h4>
        <Actions/>
    </div>
}

function Actions(){
    let count = useStoreSetter(counter);

    const increment = ()=>count(({prevState})=>prevState+1);

    const decrement = ()=>count(({prevState})=>prevState-1);

    return <div>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
    </div>
}

```
