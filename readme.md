# React-cargo

[![npm version](https://badge.fury.io/js/react-cargo.svg)](https://badge.fury.io/js/react-cargo) [![npm](https://img.shields.io/npm/dt/react-cargo.svg)](https://www.npmjs.com/package/react-cargo) [![NpmLicense](https://img.shields.io/npm/l/react-cargo.svg?registry_uri=https%3A%2F%2Fregistry.npmjs.com)](https://www.npmjs.com/package/react-cargo)

`react-cargo` is a minimal state management tool for React with managed updates on state transition. `react-cargo` is easy to setup, just install and you are ready to add global state to your application without the need of writing any boilerplate code. `react-cargo` exposes easy to use hook based api's.

## Installation

To install the stable version of `react-cargo`

```bash
npm install react-cargo
```

or

```bash
yarn add react-cargo
```

## List of hooks

- useStore
- useStoreValue
- useStoreSetter
- useSelector
- useResetStore

## Methods

- createStore

## Creating a store

Creating a store is as easy as calling a function with some argument. Using `createStore`, you can create a `StateInstance`, which takes an object with a key and a default state

> `key` : should be unique accross the application

> `state` : can take in Primitive as well as Non-primitive data types

```js
import {createStore} from "react-cargo";

export const counter = createStore({
    key : 'counter',
    state : 0
})
```

## Using a store in your component

We can use `useStore`, `useStoreValue`,`useStoreSetter` or `useSelector` to use a state in our component.

```js
import {createStore} from "react-cargo";

const counter = createStore({
    key : 'counter',
    state : 0
});

function Counter(){
    let [count,setCount] = useStore(counter);
    return <div>
        <h4>Counter {count}</h4>
        <Actions/>
    </div>
}

function Actions(){
    let [count,setCount] = useStore(counter);

    const increment = ()=>setCount(count+1);

    const decrement = ()=>count(count-1);

    return <div>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
    </div>
}

```


## Hooks
### useStore : 
Returns a tuple where the first element is the value of state and the second element is a setter function that will update the value of the given state when called.
<br><br>
```js
 function useStore<T>(stateInstance: StoreInstance<T>):[T, Dispatch<{ [key in keyof T]?: any }>]
```

- stateInstance : an instance returned by `createStore`
<br><br>

> This API is similar to the React useState() hook except it takes a `stateInstance` (returned by `createStore`). It returns a tuple of the current value of the state and a setter function. The setter function takes a new value.

<br>

### **Example**

```js
import { useStore, createStore} from 'react-cargo';

let counterState = createStore({
    key :'counter',
    state : 0
});

function Counter(){
    let [count,setCounter] = useStore(counterState);
    
    let increment = ()=> setCounter(count + 1);
    let decrement = ()=> setCounter(count - 1);

    return (
        <>
            <h5>{count}</h5>
            <button onClick={increment}> + </button>
            <button onClick={decrement}> - </button>
        </>
    )
}
```
### useStoreValue
Returns the value of the given `stateInstance`.
```js
 function useStoreValue<T>(stateInstance: StoreInstance<T>): T;
```

- stateInstance : an instance returned by `createStore`
<br><br>

> This hook should be used where a component intends only to read state.

<br>

### **Example**

```js
  import { useStoreSetter, useStoreValue, createStore} from 'react-cargo';
 
  let nameStore = createStore({
    key :'counter',
    state : ''
  });
 
  function App(){
    return (
       <>
          <NameView/>
          <Actions/>
       </>
    )
  }
 
  function ViewCount(){
       let name = useStoreValue(nameStore);
 
       return <h5>{name}</h5>
  }
 
  function Actions(){
       let setName = useStoreSetter(nameStore);
 
       return <p>
              <input
                type="text"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name"
              />
          </p>
  }
```
### useStoreSetter : 
Returns a setter to set the state of a provided `stateInstance`
<br><br>
```js
  function useStoreSetter<T>(stateInstance: StoreInstance<T>): Dispatch<T>;
```

- stateInstance : an instance returned by `createStore`
<br><br>

### **Example**

```js
import { useStoreSetter, useStoreValue, createStore} from 'react-cargo';

 let nameStore = createStore({
    key :'counter',
    state : ''
 });

 function App(){
   return (
      <>
         <NameView/>
         <Actions/>
      </>
   )
 }

 function ViewCount(){
      let name = useStoreValue(nameStore);

      return <h5>{name}</h5>
 }

 function Actions(){
      let setName = useStoreSetter(nameStore);

      return <p>
             <input
               type="text"
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter a name"
             />
         </p>
 }

```

### useResetStore : 
Returns a resetter function to reset the state of a provided `stateInstance` to its initial state
<br><br>
```js
  function useResetStore<T>(stateInstance: StoreInstance<T>): () => void;
```

- stateInstance : an instance returned by `createStore`
<br><br>

### **Example**

```js
  import { useStore, useStoreValue, createStore, useResetStore} from 'react-cargo';
 
  let counterState = createStore({
    key :'counter',
    state : 0
  });
 
  function Counter(){
    return (
       <>
          <ViewCount/>
          <Actions/>
          <Reset/>
       </>
    )
  }
 
  function Reset(){
       let reset = useResetStore(counterState);
 
       return <button onClick={reset}>Reset Counter</button>
  }
 
  function ViewCount(){
       let count = useStoreValue(counterState);
 
       return <h5>{count}</h5>
  }
 
  function Actions(){
       let [state, setCount] = useStore(counterState);
 
       let increment = ()=> setCounter(state + 1);
       let decrement = ()=> setCounter(state - 1);
 
       return <>
           <button onClick={increment}> + </button>
           <button onClick={decrement}> - </button>
       </>
  }
```

### useSelector : 
Returns a tuple where the first element is the value of state and the second element is a setter function that will update the value of the given state when called. Using `useSelector`, components can subscribe to specific updates in a Non-primitive stateInstance. Note that a `useSelector` will listen to all updates on the store regardless of the `selector` (subscribed slice of the state) provided if the `setter` function was called on the same component as the `useSelector`.
<br><br>

> This hook can only be used with non-primitive state values

```js
  function useSelector<T>(stateInstance: StoreInstance<T>, selector: {[key in keyof T]?: any;})
  : [T, Dispatch<{key in keyof T]?: any;} | T>];
```

- stateInstance : an instance returned by `createStore`
- selector : A map representing the state structure with boolean values. By default every key is set to false until specified. If the value of a key is true, the component automatically subscribe to the selective update.
<br><br>

### **Example**

```js
  import { useSelector, createStore} from 'react-cargo';
 
  let counterState = createStore({key :'counter',state : {counter : 0}});
 
  function Counter(){
    let setCounter = useStoreSetter(counterState);
 
    return (
       <>
          <ViewCount/>
          <Actions/>
       </>
    )
  }
 
  function ViewCount(){
       let [counter] = useSelector(counterState,{counter : true});
 
       return <h5>{counter.count}</h5>
  }
 
  function Actions(){
       let [ state , setCount] = useSelector(counterState,{counter : true});
 
       let increment = ()=> setCount({counter : state.counter + 1});
       let decrement = ()=> setCount({counter : state.counter - 1});
 
       return <>
           <button onClick={increment}> + </button>
           <button onClick={decrement}> - </button>
       </>
  }
 
```
<br><br>
## Methods

### createStore :
Create a  new `stateInstance`

```js
function createStore<T>({ key, state, }: {
    key: string;
    state: T;
}): StoreInstance<T>;
```

- key :  A unique string used to identify a stateInstance internally.
- state : The initial value of the stateInstance
<br><br>
## Creating Custom State Handlers

When creating a store using `createStore`, it returns a `getter` ( `get` ) and `setter` ( `set` ). This can be used to create a custom handler to manipulate state which can be used to seperate concerns from components. The idea is to separate state logic from a component. However, it should be noted that `get` doesn't subscribe to any state change, it returns the latest store values only when called.

For example : 

counter.cargo.js
```js
  import { createStore } from 'react-cargo';

  export const counterState = createStore({
    key : 'counter',
    state : {
      counter :  0
    }
  });


  export const handleIncrement = ()=> {
    let { counter } = counterState.get();

    counterState.set({ counter : counter + 1});
  }

  export const handleDecrement = ()=> {
     let { counter } = counterState.get();

    counterState.set({ counter : counter - 1});
  }
```

This can be used in a component as : 

App.js
```js
import { counterState, handleIncrement, handleDecrement } from './counter.cargo.js';

export function App() {
  return (
    <div className="App">
        <CountView />
        <Actions />
    </div>
  );
}

function CountView() {
  let [state] = useSelector(counterState,  { counter: true });
  return <p>{state.counter}</p>;
}

function Actions() {
  return (
    <p>
        <button
          type="button"
          style={{ width: 50 }}
          onClick={handleIncrement}
        >
          +
        </button>
        <button
          type="button"
          style={{ width: 50 }}
          onClick={handleDecrement}
        >
          -
        </button>
    </p>
  );
}
```


### LICENSE 
Licensed under **ISC**