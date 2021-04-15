import React, { useContext, useState } from "react";
import { materialServiceEnv } from "../AppEnv";
import { Material } from "../model/Material";
import { HttpJsonError } from "../service/http/HttpError";
import { E, Eq, RD } from "../util/fpts";
import { useIO } from "./useIO";

export const MaterialServiceContext = React.createContext(materialServiceEnv);

export const useMaterialService = () => {
  return useContext(MaterialServiceContext);
};

export const useMaterialRD = () => {
  const materialServiceEnv = useMaterialService();

  const [remoteData, setRemoteData] = useState<
    RD.RemoteData<HttpJsonError, Material>
  >(RD.initial);

  useIO(
    () => {
      setRemoteData(RD.pending);
      materialServiceEnv.materialService.getMaterial().then(
        E.fold(
          (error) => setRemoteData(RD.failure(error)),
          (material) => setRemoteData(RD.success(material))
        )
      );
    },
    [],
    Eq.getTupleEq()
  );

  return remoteData;
};
