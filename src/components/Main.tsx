import React, { useReducer, useState } from "react";
import {
  appEnv,
  materialServiceEnv,
  cacheServiceEnv,
  httpClientEnv,
} from "../AppEnv";
import {
  AppEnvContext,
  useAppEnvReducer,
  useAppEnvRemoteData,
  useAppEnvRT,
  useAppEnvRTE,
} from "../hooks/useAppEnv";
import { MaterialServiceContext, useMaterialRD } from "../hooks/useDomain";
import { useIO } from "../hooks/useIO";
import { Material } from "../model/Material";
import {
  MaterialService,
  getMaterial,
  getMaterialWithCache,
} from "../service/domain/MaterialService";
import { HttpJsonError } from "../service/http/HttpError";
import { E, Eq, pipe, RD, RT, RTE, TE } from "../util/fpts";
import { MaterialRD } from "./MaterialRD";

export interface System {
  id: string;
  name: string;
  airtableId: string;
}

export const systems: Record<string,System> = {
  'thermohouse':{
    id: "thermohouse",
    name: "Thermohouse",
    airtableId: "appKyHS0iwvNQ3gCl",
  },
  'almere':{
    id: "almere",
    name: "Almere",
    airtableId: "appKa5xUVR7rmAvJR",
  },
  'skylark':{
    id: 'skylark',
    name: 'Skylark',
    airtableId: 'appx9k7N6GH6bX3nP'
  }
}
////////////////////////////////////////////////////////////////////////////////
// Vanillaish implementation
////////////////////////////////////////////////////////////////////////////////

export const MainRTEWithGlobalDeps = (config: {
  tableId: string;
  data: any;
  tab: string;
}) => {
  const [remoteData, setRemoteData] = useState<
    RD.RemoteData<HttpJsonError,  Array<{
      id:          string;
      fields:      Material;
      createdTime: string;
    }>>
  >(RD.initial);

  useIO(
    () => {
      setRemoteData(RD.pending);
      RTE.run(getMaterialWithCache(config), {
        // Not great b/c we are importing global static deps - hard to test/mock/reuse
        ...httpClientEnv,
        ...cacheServiceEnv,
      }).then(
        E.fold(
          (e) => setRemoteData(RD.failure(e)),
          (b) => setRemoteData(RD.success(b))
        )
      );
    },
    [],
    Eq.getTupleEq()
  );

  return <MaterialRD materialRD={remoteData} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using lowest-level ReaderTask implementation
//
// This requires the caller to use an RTE, then explicitly map it into a
// ReaderTask<AppEnv, void> to indicate that errors are handled (`never`) and output
// is consumed (`void`).
////////////////////////////////////////////////////////////////////////////////

export const MainAppEnvRT = (config: {
  tableId: string;
  data: any;
  tab: string;
}) => {
  const [materialRD, setMaterialRD] = useState<
    RD.RemoteData<HttpJsonError,  Array<{
      id:          string;
      fields:      Material;
      createdTime: string;
    }>>
  >(RD.initial);

  // Not great b/c we are dependent on the entire AppEnv, and the logic here is a little "low-level"
  useAppEnvRT({
    rt: pipe(
      getMaterial(config),
      RTE.fold(
        (e: HttpJsonError) =>
          RT.fromIO(() => {
            setMaterialRD(RD.failure(e));
          }),
        (materials:  Array<{
          id:          string;
          fields:      Material;
          createdTime: string;
        }>) =>
          RT.fromIO(() => {
            setMaterialRD(RD.success(materials));
          })
      )
    ),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <MaterialRD materialRD={materialRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using an RTE with before/success/error callbacks
//
// This is a helpers to ease the explicit handling of before/error/success
////////////////////////////////////////////////////////////////////////////////

export const MainAppEnvRTE = (config: {
  tableId: string;
  data: any;
  tab: string;
}) => {
  const [materialRD, setMaterialRD] = useState<
    RD.RemoteData<HttpJsonError,  Array<{
      id:          string;
      fields:      Material;
      createdTime: string;
    }>>
  >(RD.initial);

  // A littler simpler logic, but still depend on entire AppEnv
  useAppEnvRTE({
    rte: getMaterial(config),
    onBefore: () => setMaterialRD(RD.pending),
    onError: (error) => setMaterialRD(RD.failure(error)),
    onSuccess: (material) => setMaterialRD(RD.success(material)),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <MaterialRD materialRD={materialRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using an RTE that manifests itself as a RemoteData state
////////////////////////////////////////////////////////////////////////////////

export const MainAppEnvRemoteData = (config: {
  tableId: string;
  data: any;
  tab: string;
}) => {
  // Simpler, still depends on AppEnv
  const materialRD = useAppEnvRemoteData({
    rte: getMaterial(config),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <MaterialRD materialRD={materialRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using an RTE that manifests itself as reducer/redux actions
////////////////////////////////////////////////////////////////////////////////

// Redux/reducer code
type LoadingMaterial = { type: "loadingMaterial" };
type FailedMaterial = { type: "failedMaterial"; error: HttpJsonError };
type LoadedMaterial = { type: "loadedMaterial"; material:  Array<{
  id:          string;
  fields:      Material;
  createdTime: string;
}> };

type Action = LoadingMaterial | FailedMaterial | LoadedMaterial;

type State = { materialRD: RD.RemoteData<HttpJsonError,  Array<{
  id:          string;
  fields:      Material;
  createdTime: string;
}>> };

const initialState = { materialRD: RD.initial };

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (_state, action) => {
  switch (action.type) {
    case "loadingMaterial":
      return { materialRD: RD.pending };
    case "failedMaterial":
      return { materialRD: RD.failure(action.error) };
    case "loadedMaterial":
      return { materialRD: RD.success(action.material) };
  }
};

export const MainAppEnvReducer = (config: {
  tableId: string;
  data: any;
  tab: string;
}) => {
  const [state, dispatch] = useReducer<Reducer>(reducer, initialState);

  // Demo for dispatching actions (still depends on AppEnv)
  useAppEnvReducer({
    rte: getMaterialWithCache(config),
    dispatch,
    getBeforeAction: (): Action => ({ type: "loadingMaterial" }),
    getErrorAction: (error): Action => ({ type: "failedMaterial", error }),
    getSuccessAction: (material): Action => ({
      type: "loadedMaterial",
      material,
    }),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <MaterialRD materialRD={state.materialRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// BreedService implementation
////////////////////////////////////////////////////////////////////////////////

// const mockMaterialService: MaterialService<never> = {
//   getMaterial: TE.right([
//     { },
    
//   ]),
// };

// export const MainBreedService = () => {
//   const materialRD = useMaterialRD();

//   return <MaterialRD materialRD={materialRD} />;
// };

////////////////////////////////////////////////////////////////////////////////
// Show a particular implementation
////////////////////////////////////////////////////////////////////////////////

export const Main = (): JSX.Element => {
  console.log('started')
  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with ReaderTask-based hook
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<AppEnvContext.Provider value={appEnv}>
  //<MainAppEnvRT />
  //</AppEnvContext.Provider>
  //);

  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with ReaderTask-based hook
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<AppEnvContext.Provider value={appEnv}>
  //<MainAppEnvRTE />
  //</AppEnvContext.Provider>
  //);

  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with RemoteData-based hook
  ///////////////////////////////////////////////////////////////////////////////

  // return (
  //   <AppEnvContext.Provider value={appEnv}>
  //     <MainAppEnvRemoteData tableId={systems.skylark.airtableId} tab={"Materials" } data={''}/>
  //   </AppEnvContext.Provider>
  // );

  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with reducer-based hook
  ///////////////////////////////////////////////////////////////////////////////
  return (
  <AppEnvContext.Provider value={appEnv}>
    <MainAppEnvReducer tableId={systems.skylark.airtableId} tab={"Materials" } data={''}/>
  </AppEnvContext.Provider>
  );

  ///////////////////////////////////////////////////////////////////////////////
  // BreedService context with real API
  ///////////////////////////////////////////////////////////////////////////////

  // return (
  //   <MaterialServiceContext.Provider value={materialServiceEnv}>
  //     <MainBreedService />
  //   </MaterialServiceContext.Provider>
  // );

  ///////////////////////////////////////////////////////////////////////////////
  // BreedService context with mock data
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<BreedServiceContext.Provider value={{ breedService: mockBreedService }}>
  //<MainBreedService />
  //</BreedServiceContext.Provider>
  //);

};
