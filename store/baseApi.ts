
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// initialize an empty api service that we'll inject endpoints into later as needed
export const baseAPI = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.API_URL
  }),
  tagTypes: [
    'user'
  ],
  endpoints: () => ({}),
});
