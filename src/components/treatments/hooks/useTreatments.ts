import { useQuery, useQueryClient } from 'react-query';
import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
// import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}


export function useTreatments(): Treatment[] {
  // const toast = useCustomToast();
  // TODO: get data from server via useQuery
  const fallback = [];
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, 
    // using global settings now instead of in the individual hooks in react-query/queryClient.
    // {
    //   staleTime: 600000,   // i.e. 10 minutes
    //   cacheTime: 900000,   // i.e. 15 minutes
    //   refetchOnMount: false,
    //   refetchOnWindowFocus: false,
    //   refetchOnReconnect: false,
    // }
    );
    // {
    // onError: (error) => {
    //   const title = error instanceof Error ? error.message : 'error connecting to server';
    //   toast({ title, status: 'error' })
    // }
    // }
  return data;
}

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments, 
     // using global settings now instead of in the individual hooks in react-query/queryClient.
    // {
    //   staleTime: 600000,   // i.e. 10 minutes
    //   cacheTime: 900000,   // i.e. 15 minutes
    // }
  );
}

