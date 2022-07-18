import { EventEmitter } from "events";
import { useEffect, useState } from "react";

interface StoreInstance<T> {
  key: string;
  state: T;
  default: T;
  listeners: string[];
  events: EventEmitter;
  unsubscribe: (listeners: string[]) => void;
  addListeners: (
    setState: React.Dispatch<React.SetStateAction<T>>,
    listeners: string[]
  ) => void;
  get: (cargoStore?: StoreInstance<T>) => T;
  set: (state: { [key in keyof T]?: any } | T, listeners?: string[]) => void;
}

class CargoStore<T> implements StoreInstance<T> {
  key: string;
  state: T;
  default: T;
  events: EventEmitter;
  listeners: string[];

  constructor(key: string, state: T) {
    this.key = key;
    this.state = state;
    this.default =
      typeof state == "object" ? JSON.parse(JSON.stringify(state)) : state;
    let uniqueKeys = makeUniqueKeys(state);
    this.listeners = uniqueKeys.length ? uniqueKeys : [key];
    this.events = new EventEmitter();
  }

  public get(cargoStore?: StoreInstance<T>) {
    if (cargoStore) return cargoStore.get();
    return this.state;
  }

  public set(state: { [key in keyof T]?: any } | T, listeners?: string[]) {
    let isNonPrimitiveState = typeof this.state === "object";
    let nextState = isNonPrimitiveState
      ? collateState(this.state, this.state, state)
      : state;
    this.state = nextState;
    if (!listeners?.length)
      listeners = isNonPrimitiveState ? makeUniqueKeys(state) : this.listeners;
    this.emit(listeners, nextState);
  }

  /**
   * @method emit
   * @description This method is responsible for emitting events with the state data
   * @param listeners
   * @param state
   */
  private emit(listeners: string[], state: T) {
    for (const listener of listeners) {
      this.events.emit(listener, state);
    }
  }

  /**
   * @method addListeners
   * @description Register listeners for a StateInstace with a registered key
   * @param setState
   * @listeners Array of listener keys
   */
  public addListeners(
    setState: React.Dispatch<React.SetStateAction<T>>,
    listeners: string[]
  ): void {
    for (const listener of listeners) {
      this.events.on(listener, function (state: T) {
        if (typeof state == "object") state = JSON.parse(JSON.stringify(state));
        setState(state);
      });
    }
  }

  public unsubscribe(listeners: string[]) {
    for (const listener of listeners) {
      this.events.removeAllListeners(listener);
    }
  }
}

interface Dispatch<T> {
  (state: T): void;
}

function InitHook<T>() {
  let [_, setState] = useState<T>();
  return setState;
}

/**
 * @function useStore
 * @description Similar to React.setState. Returns an array with value and a setter function.
 * `useStore` takes a StateInstance.
 * @example
 * import { useStore, createStore} from 'react-cargo';
 *
 * let counterState = createStore({key :'counter',state : 0});
 *
 * function Counter(){
 *   let [count,setCounter] = useStore(counterState);
 *
 *   let increment = ()=> setCounter(count + 1);
 *
 *   let decrement = ()=> setCounter(count - 1);
 *
 *   return (
 *      <>
 *         <h5>{count}</h5>
 *         <button onClick={increment}> + </button>
 *         <button onClick={decrement}> - </button>
 *      </>
 *   )
 * }
 *
 * @param {*} StateInstance
 * @returns
 */
export function useStore<T>(
  stateInstance: StoreInstance<T>
): [T, Dispatch<{ [key in keyof T]?: any }>] {
  let setState = InitHook();

  useEffect(() => {
    stateInstance.addListeners(setState, [
      stateInstance.key,
      ...stateInstance.listeners,
    ]);
    return () =>
      stateInstance.unsubscribe([
        stateInstance.key,
        ...stateInstance.listeners,
      ]);
  }, []);

  return [stateInstance.get(), stateInstance.set.bind(stateInstance)];
}

/**
 * @method useStoreValue
 * Use `useStoreValue` to get the value of a Store.
 * This hook returns only the value without returning the Setter function
 *
 * @example
 * import { useStoreSetter, useStoreValue, createStore} from 'react-cargo';
 *
 * let nameStore = createStore({key :'counter',state : ''});
 *
 * function App(){
 *   return (
 *      <>
 *         <NameView/>
 *         <Actions/>
 *      </>
 *   )
 * }
 *
 * function ViewCount(){
 *      let name = useStoreValue(nameStore);
 *
 *      return <h5>{name}</h5>
 * }
 *
 * function Actions(){
 *      let setName = useStoreSetter(nameStore);
 *
 *      return <p>
 *             <input
 *               type="text"
 *               onChange={(e) => setName(e.target.value)}
 *               placeholder="Enter a name"
 *             />
 *         </p>
 * }
 *
 * @param {*} StateInstance
 * @returns
 */
export function useStoreValue<T>(stateInstance: StoreInstance<T>): T {
  let setState = InitHook();

  useEffect(() => {
    stateInstance.addListeners(setState, [
      stateInstance.key,
      ...stateInstance.listeners,
    ]);
    return () =>
      stateInstance.unsubscribe([
        stateInstance.key,
        ...stateInstance.listeners,
      ]);
  }, []);

  return stateInstance.get();
}

/**
 * @method useStoreSetter
 * Use `useStoreSetter` to set the state of a Store.
 * This hook returns only the Setter function
 *
 * @example
 * import { useStoreSetter, useStoreValue, createStore} from 'react-cargo';
 *
 * let nameStore = createStore({key :'counter',state : ''});
 *
 * function App(){
 *   return (
 *      <>
 *         <NameView/>
 *         <Actions/>
 *      </>
 *   )
 * }
 *
 * function ViewCount(){
 *      let name = useStoreValue(nameStore);
 *
 *      return <h5>{name}</h5>
 * }
 *
 * function Actions(){
 *      let setName = useStoreSetter(nameStore);
 *
 *      return <p>
 *             <input
 *               type="text"
 *               onChange={(e) => setName(e.target.value)}
 *               placeholder="Enter a name"
 *             />
 *         </p>
 * }
 *
 * @param {*} StateInstance
 * @returns
 */
export function useStoreSetter<T>(
  stateInstance: StoreInstance<T>
): Dispatch<{ [key in keyof T]?: any }> {
  let setState = InitHook();

  useEffect(() => {
    stateInstance.addListeners(setState, [
      stateInstance.key,
      ...stateInstance.listeners,
    ]);
    return () =>
      stateInstance.unsubscribe([
        stateInstance.key,
        ...stateInstance.listeners,
      ]);
  }, []);

  return stateInstance.set.bind(stateInstance);
}

/**
 * @method useResetStore
 * Use `useResetStore` to reset the value of a Store to its initial state.
 * This hook returns a `resetter`
 *
 * @example
 * import { useStore, useStoreValue, createStore, useResetStore} from 'react-cargo';
 *
 * let counterState = createStore({key :'counter',state : 0});
 *
 * function Counter(){
 *   return (
 *      <>
 *         <ViewCount/>
 *         <Actions/>
 *         <Reset/>
 *      </>
 *   )
 * }
 *
 * function Reset(){
 *      let reset = useResetStore(counterState);
 *
 *      return <button onClick={reset}>Reset Counter</button>
 * }
 *
 * function ViewCount(){
 *      let count = useStoreValue(counterState);
 *
 *      return <h5>{count}</h5>
 * }
 *
 * function Actions(){
 *      let [state, setCount] = useStore(counterState);
 *
 *      let increment = ()=> setCounter(state + 1);
 *      let decrement = ()=> setCounter(state - 1);
 *
 *      return <>
 *          <button onClick={increment}> + </button>
 *          <button onClick={decrement}> - </button>
 *      </>
 * }
 *
 * @param {*} StateInstance
 * @returns
 */
export function useResetStore<T>(stateInstance: StoreInstance<T>): () => void {
  return function () {
    stateInstance.set(stateInstance.default);
  };
}


/**
 * Use `useSelector` to opt into selective state dispatch. The selector function
 * should return a patial representation of the original state object with key that
 * represent the property in the store object and a boolean value, which, if true,
 * registers to selective state dispatch
 * @param {*} stateConstruct
 * @param {*} selectorFunction
 *
 *
 * @example
 * import { useSelector, createStore} from 'react-cargo';
 *
 * let counterState = createStore({key :'counter',state : {counter : 0}});
 *
 * function Counter(){
 *   let setCounter = useStoreSetter(counterState);
 *
 *   return (
 *      <>
 *         <ViewCount/>
 *         <Actions/>
 *      </>
 *   )
 * }
 *
 * function ViewCount(){
 *      let [counter] = useSelector(counterState,{counter : true});
 *
 *      return <h5>{counter.count}</h5>
 * }
 *
 * function Actions(){
 *      let [ state , setCount] = useSelector(counterState,{counter : true});
 *
 *      let increment = ()=> setCount({counter : state.counter + 1});
 *      let decrement = ()=> setCount({counter : state.counter - 1});
 *
 *      return <>
 *          <button onClick={increment}> + </button>
 *          <button onClick={decrement}> - </button>
 *      </>
 * }
 *
 * @returns
 */
export function useSelector<T>(
  stateInstance: StoreInstance<T>,
  selector: { [key in keyof T]?: any }
): [T, Dispatch<{ [key in keyof T]?: any } | T>] {
  if (typeof stateInstance !== "object")
    throw new Error("useSelector can only be used with non-primitive states");

  let listeners = makeUniqueKeys(selector);

  let setState = InitHook();

  useEffect(() => {
    stateInstance.addListeners(setState, listeners);
    return () => stateInstance.unsubscribe(listeners);
  }, []);

  return [
    stateInstance.get(),
    (nextState: { [key in keyof T]?: any } | T) =>
      stateInstance.set(nextState, listeners),
  ];
}

/**
 * @method createStore
 * @description Add a State Instance to the Global Store
 * @param {*} configurable
 * @param {string} configurable.key - A unique key representing a State Instance
 * @param {any} configurable.state - Initial values of a State Instance
 * @returns
 */

export function createStore<T>({
  key,
  state,
}: {
  key: string;
  state: T;
}): StoreInstance<T> {
  return new CargoStore<T>(key, state);
}

function collateState(
  stateSlice: { [x: string]: any },
  nextState: any,
  appendableState: { [x: string | number]: any }
) {
  if (Array.isArray(nextState)) {
    spreadArray(appendableState, nextState);
  } else {
    for (const key in stateSlice) {
      if (Object.hasOwnProperty.call(stateSlice, key)) {
        const value = stateSlice[key];
        if (typeof value == "object") {
          if (Array.isArray(nextState[key])) {
            spreadArray(appendableState[key], nextState[key]);
          }
          collateState(value, nextState[key], appendableState?.[key]);
        } else {
          if (value !== false && appendableState.hasOwnProperty(key)) {
            nextState[key] = appendableState?.[key];
          }
        }
      }
    }
  }
  return nextState;
}

function spreadArray(appendable: { [x: number]: any }, nextState: any[]): any {
  for (let key in appendable) {
    if (parseInt(key) > nextState.length)
      nextState.splice(parseInt(key), 0, appendable[key]);
    if (Object.hasOwnProperty.call(appendable, key)) {
      let value = appendable[key];
      if (typeof value == "object" && Array.isArray(nextState[key])) {
        return spreadArray(value, nextState[key]);
      }
      nextState.splice(parseInt(key), 1, value);
    }
  }
  return nextState;
}

/**
 * @method makeUniqueKeys
 * @description
 * Responsible for creating unique listener keys based on the object passed
 * @param data
 * @param parentkey
 * @param accumulator
 * @returns
 */
function makeUniqueKeys(
  data: any,
  parentkey: string[] = [],
  accumulator: string[] = []
): string[] {
  if (typeof data !== "object") return [];
  for (const key of Object.keys(data)) {
    if (typeof data[key] == "object") {
      parentkey.push(key);
      makeUniqueKeys(data[key], parentkey, accumulator);
    } else {
      if (data[key] !== false) {
        let pushableKey: string[] = [];
        if (parentkey.length) pushableKey = [...parentkey, key];
        else pushableKey.push(key);
        accumulator.push(pushableKey.join("."));
      }
    }
  }
  return accumulator;
}
