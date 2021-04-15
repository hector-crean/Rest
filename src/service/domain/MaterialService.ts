
import * as t from 'io-ts'; 
import { pipe} from '../../util/fpts'; 
import { Material, materialCodec } from "../../model/Material";
import { decodeWithCodec } from "../../util/decode";
import { A, R, Rec, RTE, TE, O } from "../../util/fpts";
import { CacheServiceEnv, getWithCache } from "../cache/CacheService";
import { getJson, HttpClientEnv } from "../http/HttpClient";
import { HttpJsonError } from "../http/HttpError";

////////////////////////////////////////////////////////////////////////////////
// Implementations of the services
////////////////////////////////////////////////////////////////////////////////

interface MaterialPayload {
  records: Array<{
    id:          string;
    fields:      Material;
    createdTime: string;
  }>;
}

interface MaterialResponse {
  payload: MaterialPayload
}

const materialRecordsCodec: t.Type<
  Array<{
    id:          string;
    fields:      Material;
    createdTime: string;
  }>
> = t.array(t.type({
  id: t.string,
  fields: materialCodec,
  createdTime: t.string
}))

const materialResponseCodec: t.Type<MaterialResponse> = t.type(
  {
    payload: t.type({
      records: materialRecordsCodec
      }
    )
  }
)




export const getMaterial = (
  config: {
    tableId: string;
    data: any;
    tab: string;
  }
): RTE.ReaderTaskEither<
  HttpClientEnv, 
  HttpJsonError, 
  Array<{
    id:          string;
    fields:      Material;
    createdTime: string;
  }>
> => pipe(
  getJson(
    // `https://api.airtable.com/v0/${config.tableId}/${encodeURIComponent(
    //   config.tab
    // )}`,
    `https://api.airtable.com/v0/appx9k7N6GH6bX3nP/Materials`,
    decodeWithCodec(materialResponseCodec)
  ),
  RTE.map((response) =>
    pipe(
     response.payload.records,
    ),
  )
);



export const getMaterialWithCache = (
  config: {
    tableId: string;
    data: any;
    tab: string;
  }
): RTE.ReaderTaskEither<
  HttpClientEnv & CacheServiceEnv,
  HttpJsonError,
  Array<{
    id:          string;
    fields:      Material;
    createdTime: string;
  }>
> => getWithCache("materials", materialRecordsCodec, getMaterial(config));


////////////////////////////////////////////////////////////////////////////////
// Domain services to get material, etc.
//
// These should not expose lower-level dependencies, and should keep the error type
// abstract.
////////////////////////////////////////////////////////////////////////////////

export interface MaterialService<E> {
  getMaterials: 
    TE.TaskEither<E,  Array<{
      id:          string;
      fields:      Material;
      createdTime: string;
    }>>;
}

export type MaterialServiceEnv<E> = {
  materialService: MaterialService<E>;
};



////////////////////////////////////////////////////////////////////////////////
// Service implementations
////////////////////////////////////////////////////////////////////////////////

export const makeMaterialService= (
  config: {
    tableId: string;
    data: any;
    tab: string;
  }
): R.Reader<
  HttpClientEnv & CacheServiceEnv,
  MaterialService<HttpJsonError>
> => (env) => ({
  getMaterials: getMaterialWithCache(config)(env),
});

