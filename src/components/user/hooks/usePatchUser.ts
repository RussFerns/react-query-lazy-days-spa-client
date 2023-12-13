import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';
import { useCustomToast } from 'components/app/hooks/useCustomToast';
import { queryKeys } from 'react-query/constants';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
 ): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
 }


// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<User, unknown, User, unknown> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  // TODO: replace with mutate function
  // const patchUser = (newData: User | null) => {
  //   // nothing to see here
  // };
  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      // on Mutate returns context that is passed to onError
      onMutate: async (newData: User | null) => {
        // cancel any ongoing queries so old server data does not return and overwrite
        queryClient.cancelQueries(queryKeys.user);

        // snapshot of prev user value
        const previousUserData: User = queryClient.getQueryData(queryKeys.user);

        // optimistic update with new value
        updateUser(newData);

        // return the context
        return { previousUserData };
      },
      onError: (error, newData, context) => {
        // rollback cache on error to saved value
        if (context.previousUserData) {
          updateUser(context.previousUserData);
          toast({
            title: 'Update failed, restoring previous user data',
            status: 'warning'
          })
        }
      },
      // onSuccess: (data: User) => setUser(data),
      // onSuccess: (userData: User | null) => {
      //   if (userData) {
      //     updateUser(userData);
      //     toast({
      //       title: 'User updated!',
      //       status: 'success'
      //     })
      //   }
      // },
      onSuccess: (userData: User | null) => {
        if (user) {
          toast({
            title: 'User updated!',
            status: 'success'
          })
        }
      },
      onSettled: () => {
        // invalidate user query to stay in sync with server data
        queryClient.invalidateQueries(queryKeys.user);
      }
    }
  )

  return patchUser; 
}


