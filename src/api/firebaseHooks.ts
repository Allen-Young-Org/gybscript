/* eslint-disable @typescript-eslint/no-explicit-any */
// firebaseHooks.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getDocumentByFields,
  addDocumentWithProperties,
  updateDocumentsWithProperties,
} from "./firebasecrud";

//Selecting a document using fields
export const useDocumentByFields = (
  collectionName: string,
  queryFields: Record<string, any>
) => {
  return useQuery({
    queryKey: [collectionName, "documentByFields", queryFields],
    queryFn: () => getDocumentByFields(collectionName, queryFields),
    enabled: Object.keys(queryFields).length > 0,
    staleTime: 0,
  });
};

//Creating a new document - Insert operation
export const useAddDocumentWithProperties = (collectionName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentData: Record<string, any>) =>
      addDocumentWithProperties(collectionName, documentData),
    onSuccess: () => {
      // Invalidate queries for the collection to update the cached data
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
};
// Update document with property 
export const useUpdateDocumentsWithProperties = (
  collectionName: string,
  queryFields: Record<string, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateProperties: Record<string, any>) =>
      updateDocumentsWithProperties(
        collectionName,
        queryFields,
        updateProperties
      ),
    onSuccess: () => {
      // Invalidate queries for the collection to update the cached data
      queryClient.invalidateQueries({ queryKey: [collectionName] });
    },
  });
};
