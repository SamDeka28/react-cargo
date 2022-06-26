import React from "react";
import { SetterOrUpdater } from "recoil";
declare module "barebonestore";
interface IAddStateConstructReturn {
  key: string;
  state: any;
}

interface StateOptions<T> {
  key: string;
  default: T;
}

interface StateInstance<T> extends StateOptions<T> {}

type Appender<T> = (T) => T;

type SetStateAction<S> = ({ prevState: S, append: Appender }) => S;
// this technically does accept a second argument, but it's already under a deprecation warning
// and it's not even released so probably better to not define it.
type Dispatch<A> = (valueOrUpdate: A) => void;

class CreateStore {
  store: { [key: string]: any };
}

/**
 * Add a State Instance to the Global Store
 * @param {*} configurable
 * @param {string} configurable.key - A unique key representing a State Instance
 * @param {any} configurable.default - Initial values of a State Instance
 */
declare function addState<T>(options: StateOptions<T>): StateInstance<T>;

declare function getStore(): { [key: string]: any };

/**
 * @function useStore
 * @description Similar to React.setState. Return an array with value and a setter function
 * @param {*} StateInstance
 * @returns
 */
declare function useStore<T>(
  stateConstruct: StateInstance<T>
): [T, Dispatch<SetStateAction<T>>];

declare function setStateValue(
  key: string,
  listeners: string[],
  setState: SetterOrUpdater,
  state: Dispatch<SetStateAction<T>>
);

declare function useStoreValue<T>(stateConstruct: StateInstance<T>): T;

declare function useStoreSetter<T>(
  stateConstruct: StateInstance<T>
): [T, Dispatch<SetStateAction<T>>];

declare function useSelector<T>(
  stateConstruct: StateInstance<T>,
  selectorFunction: (state) => T
): [T, Dispatch<SetStateAction<T>>];

declare function useResetStore<T>(stateConstruct: StateInstance<T>): void;

declare function listenerSetState(
  setState: React.Dispatch<SetStateAction<any>>
);

declare function setStorageData(
  key: string,
  setState: React.Dispatch<SetStateAction<any>>,
  store: any
): [any, Function];

declare function getKeyFromStateConstruct(
  stateConstruct: [IAddStateConstructReturn, CreateStore]
): [IAddStateConstructReturn, CreateStore];
