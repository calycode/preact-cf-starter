/** Free-form metadata attached to a successful API response. */
export type ApiMeta = Record<string, unknown>;

/** Standard successful response envelope. */
export type ApiSuccess<T> = {
   data: T;
   meta?: ApiMeta;
};

/** Standard error response envelope. */
export type ApiFailure = {
   error: {
      code: string;
      message: string;
      details?: unknown;
   };
};
