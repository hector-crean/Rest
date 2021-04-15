import React from 'react'; 
import { Material } from "../model/Material";
import { HttpJsonError } from "../service/http/HttpError";
import { pipe, RD } from "../util/fpts";

const getErrorMessage = (e: HttpJsonError): string => {
  switch (e.tag) {
    case "httpRequestError":
      return "Failed to connect to server";
    case "httpContentTypeError":
      return "Unexpected response from server";
    case "httpResponseStatusError":
      return `Request failed with status: ${e.status}`;
    case "decodeError":
      return `Failed to decode response JSON`;
  }
};

export const MaterialRD = ({
  materialRD,
}: {
    materialRD: RD.RemoteData<HttpJsonError,  Array<{
      id:          string;
      fields:      Material;
      createdTime: string;
    }>>;
}) => {
  return (
    <>
      <h1>Material</h1>
      {pipe(
        materialRD,
        RD.fold(
          () => <h1>Welcome</h1>,
          () => <h1>Loading...</h1>,
          (error) => <h1>{getErrorMessage(error)}</h1>,
          (material) => (
            <ul>
              {`${material}`}
            </ul>
          )
        )
      )}
    </>
  );
};
