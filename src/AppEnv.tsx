import React, { useContext } from "react";
import { fetchHttpClient } from "./service/http/FetchHttpClient";
import { HttpClient, HttpClientEnv } from "./service/http/HttpClient";
import { HttpJsonError } from "./service/http/HttpError";
import { domLocalStorage } from "./service/localStorage/DomLocalStorage";
import {
  LocalStorage,
  LocalStorageEnv,
} from "./service/localStorage/LocalStorage";
import {
  CacheService,
  CacheServiceEnv,
  makeLocalStorageCacheService,
} from "./service/cache/CacheService";
import {
  MaterialService,
  MaterialServiceEnv,
  makeMaterialService,
} from "./service/domain/MaterialService";

////////////////////////////////////////////////////////////////////////////////
// Instantiate the implementations of our services services
////////////////////////////////////////////////////////////////////////////////
const materialConfig = {
  tableId: '',
  data: '',
  tab: ''
}

const httpClient: HttpClient = fetchHttpClient;

export const httpClientEnv: HttpClientEnv = {
  httpClient,
};

const localStorage: LocalStorage = domLocalStorage;

export const localStorageEnv: LocalStorageEnv = {
  localStorage,
};

export const cacheService: CacheService = makeLocalStorageCacheService(
  localStorageEnv
);

export const cacheServiceEnv: CacheServiceEnv = {
  cacheService,
};

export const materialService: MaterialService<HttpJsonError> = makeMaterialService(materialConfig)({
  ...httpClientEnv,
  ...cacheServiceEnv,
});

export const materialServiceEnv: MaterialServiceEnv<HttpJsonError> = {
  materialService,
};



////////////////////////////////////////////////////////////////////////////////
// Implementation of context where we bundle it all together for consumption.
//
// Pros:
// - Components can use RTEs that depend on any part of the overall AppEnv
// - Easy to create a general-purpose custom hook that can run any RTE that depends on AppEnv
//
// Cons:
// - Use of AppEnv-based hook makes your component dependent on the whole AppEnv.
//   This is a tradeoff between component isolation and convenience.
////////////////////////////////////////////////////////////////////////////////

export type AppEnv = HttpClientEnv &
  LocalStorageEnv &
  CacheServiceEnv &
  MaterialServiceEnv<HttpJsonError>

export const appEnv: AppEnv = {
  ...httpClientEnv,
  ...localStorageEnv,
  ...cacheServiceEnv,
  ...materialServiceEnv,
};
