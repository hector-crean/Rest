import * as t from "io-ts";
import { draw } from "io-ts/Decoder";

import { E, pipe } from "./fpts";



export type DecodeError = { tag: "decodeError"; errors: t.Errors };

export const decodeError = (errors: t.Errors): DecodeError => ({
  tag: "decodeError",
  errors,
});

export const decodeWithCodec = <A>(codec: t.Type<A>) => (
  value: unknown
): E.Either<DecodeError, A> => {
  console.log(value)
  return pipe(
    codec.decode(value), 
    E.mapLeft(decodeError)
  );
}
