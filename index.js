import { useEffect, useState } from "react";
import { EventEmitter } from "events";

// let eventEmitter = new EventEmitter();

const EMITTER_KEY = "storefrontevent";

/**
 * @class CreateStore
 */
function CreateStore() {
  this.store = {};
}

function StoreState(key = null, state = 0) {
  this.key = key;
  this.default = state;
  this.event = new EventEmitter();
}

/**
 * @memberof CreateStore
 * @method addState
 * @description Add a State Instance to the Global Store
 * @param {*} configurable
 * @param {string} configurable.key - A unique key representing a State Instance
 * @param {any} configurable.default - Initial values of a State Instance
 * @returns
 */
CreateStore.prototype.addState = function ({ key, default: state = "" }) {
  if (!key)
    throw new Error("A `key` is a required property and must be unique");
  if (this.store[key])
    throw new Error("Cannot redeclare multiple state with the same key");

  const storeStateInstance = new StoreState(key, state);

  this.store[key] = storeStateInstance;
  return { key, default: state };
};

/**
 * @method getState
 * @description Get all the registered states in the State Machine. If key is provided, it will return the specific State Instance
 * @param {*} [key] - (optional)
 * @returns
 */
CreateStore.prototype.getState = function (key) {
  if (key) return this.store[key];
  return this.store;
};

CreateStore.prototype.listenerSetState = function (
  setState,
  key,
  stateInstanceKey
) {
  stateInstanceKey = stateInstanceKey ? stateInstanceKey : key;
  this.store[stateInstanceKey].event.on(key, function (data) {
    setState(data);
  });
};

function stateAppend(appendable, indexOfArray = -1) {
  if (typeof appendable != "object")
    throw new Error("Append only work in case of Non-Primitive State values");
  //get changed key names
  let changedKeys = Object.keys(appendable);

  return function (storeKey) {
    let listeners = [];
    for (let key of changedKeys) {
      let listenerKey = key;
      if (indexOfArray != -1) listenerKey = `${key}-${indexOfArray}`;
      listeners.push(`${storeKey}-${listenerKey}`);
    }
    return { listeners, appendable, indexOfArray };
  };
}

CreateStore.prototype.attachAtomicListener = function (
  setState,
  atomicListenerKeys,
  stateInstanceKey
) {
  //In case of useSelector atomicListenerKeys is an  Array of listener keys
  if (Array.isArray(atomicListenerKeys)) {
    for (const listenerKey of atomicListenerKeys) {
      let key = `${EMITTER_KEY}-${listenerKey}`;
      this.listenerSetState(setState, key, stateInstanceKey);
    }
  } else {
    stateInstanceKey = atomicListenerKeys;
    let key = `${EMITTER_KEY}-${atomicListenerKeys}`;
    this.listenerSetState(setState, key, stateInstanceKey);
  }
};

CreateStore.prototype.storeEmitter = function (
  listeners,
  state,
  stateInstanceKey
) {
  for (const key of listeners) {
    let eventName = `${EMITTER_KEY}-${key}`;
    this.store[stateInstanceKey].event.emit(eventName, state);
  }
};

function setStoreValue(key, listeners, setState, valueOrUpdater) {
  let nextState;
  let eventListeners = [...listeners];
  let prevState = this.store[key]?.default;
  ({ eventListeners, nextState } = getNextState(
    valueOrUpdater,
    prevState,
    key,
    eventListeners,
    nextState
  ));
  this.store[key] = { ...this.store[key], default: nextState };
  setState(nextState);
  this.storeEmitter(eventListeners, this.store[key], key);
}

CreateStore.prototype.setStorageData = function (
  key,
  setState,
  listeners = []
) {
  let setter = setStoreValue.bind(this, key, listeners, setState);

  return [this.store[key]?.default, setter];
};

function getNextState(
  valueOrUpdater,
  prevState,
  key,
  eventListeners,
  nextState
) {
  if (typeof valueOrUpdater == "function") {
    let updater = valueOrUpdater;
    if (typeof prevState == "object") {
      let { appendable, listeners, indexOfArray } = updater({
        prevState,
        append: stateAppend,
      })(key);

      eventListeners = [...eventListeners, ...listeners];
      nextState = handleArrayOrObject(
        prevState,
        indexOfArray,
        appendable,
        nextState
      );
    } else {
      nextState = updater({
        prevState,
        append: () => {
          throw new Error(
            "Append is not available for primitive states values"
          );
        },
      });
    }
  } else {
    nextState = valueOrUpdater;
  }
  return { eventListeners, nextState };
}

function handleArrayOrObject(prevState, indexOfArray, appendable, nextState) {
  if (Array.isArray(prevState)) {
    if (indexOfArray != -1) {
      if (!Array.isArray(appendable))
        throw new Error(
          "A stateIntance representing an Array should pass an index and an array of values"
        );
      nextState = [...prevState];
      nextState.splice(indexOfArray, 1, ...appendable);
    }
  } else if (typeof prevState == "object") {
    nextState = {
      ...prevState,
      ...appendable,
    };
  }
  return nextState;
}

function validateStoreInstance(stateConstruct) {
  if (!stateConstruct.key) throw new Error("Must provide a StoreStateInstance");
}

function InitHook() {
  let [_, setState] = useState();
  return setState;
}

let Store = new CreateStore();

function unsubscribe(listeners, stateInstanceKey) {
  if (Array.isArray(listeners)) {
    for (const listenerKey of listeners) {
      let key = `${EMITTER_KEY}-${listenerKey}`;
      Store.store[stateInstanceKey].event.removeAllListeners(key);
    }
  } else {
    stateInstanceKey = listeners;
    let key = `${EMITTER_KEY}-${listeners}`;
    Store.store[stateInstanceKey].event.removeAllListeners(key);
  }
}

/**
 * @function useStore
 * @description Similar to React.setState. Return an array with value and a setter function
 * @param {*} StateInstance
 * @returns
 */
export const useStore = function (stateConstruct) {
  validateStoreInstance(stateConstruct);
  let setState = InitHook();
  let { key } = stateConstruct;
  useEffect(() => {
    Store.attachAtomicListener(setState, key);
    return () => unsubscribe(key);
  }, []);

  return Store.setStorageData(stateConstruct.key, setState, key);
};

export const useStoreValue = function (stateConstruct) {
  validateStoreInstance(stateConstruct);
  let setState = InitHook();
  let { key } = stateConstruct;

  useEffect(() => {
    Store.attachAtomicListener(setState, key);
    return () => unsubscribe(key);
  }, []);

  return Store.store[key]?.default;
};

export const useStoreSetter = function (stateConstruct) {
  validateStoreInstance(stateConstruct);
  let setState = InitHook();
  let { key } = stateConstruct;

  useEffect(() => {
    Store.attachAtomicListener(setState, key);
    return () => unsubscribe(key);
  }, []);

  return Store.setStorageData(stateConstruct.key, setState, [key])[1];
};

export const useResetStore = function (stateConstruct) {
  validateStoreInstance(stateConstruct);
  let setState = InitHook();
  let { key, default: state } = stateConstruct;
  useEffect(() => {
    Store.attachAtomicListener(setState, key);
    return () => unsubscribe(key);
  });

  return function () {
    Store.store[key] = { ...Store.store[key], default: state };
    Store.storeEmitter([...Object.keys(state).map(item=>`${key}-${item}`)], state, key);
    setState(state);
  };
};

export const useSelector = function (stateConstruct, selectorFunction) {
  let [_, setState] = useState();

  validateStoreInstance(stateConstruct);
  let key = stateConstruct.key;
  let store = Store.getState(key);

  let prevState = store?.default;
  if (typeof prevState != "object")
    throw new Error(
      "useSelector can only be used for Non-primitive store values"
    );

  let selectedStateSlice = selectorFunction(prevState);
  if (typeof selectedStateSlice != "object")
    throw new Error("Selector function must return an Object");
  let selectedStateKeyName = Object.keys(selectedStateSlice).map(
    (keyName) => `${key}-${keyName}`
  );

  useEffect(() => {
    Store.attachAtomicListener(setState, selectedStateKeyName, key);
    return () => unsubscribe(selectedStateKeyName, key);
  }, []);

  return Store.setStorageData(
    stateConstruct.key,
    setState,
    selectedStateKeyName,
    true
  );
};

export const addState = Store.addState.bind(Store);
export const getStore = Store.getState.bind(Store);
