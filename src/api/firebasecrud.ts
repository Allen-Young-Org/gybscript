/* eslint-disable @typescript-eslint/no-explicit-any */
// firebaseCRUD.ts
import { db } from "../firebase"; // Import your firebase.tsx file that exports your Firestore instance
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";

//Query for selecting a document using fields
export const getDocumentByFields = async (
  collectionName: string,
  queryFields: Record<string, any>
) => {
  const colRef = collection(db, collectionName);
  const constraints = Object.entries(queryFields).map(([field, value]) =>
    where(field, "==", value)
  );
  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No matching document found!");
  }

  const documents: any[] = [];
  querySnapshot.forEach((docSnap) => {
    documents.push({ id: docSnap.id, ...docSnap.data() });
  });

  return documents;
};

//For Insert
export const addDocumentWithProperties = async (
  collectionName: string,
  properties: Record<string, any>
) => {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, properties);
  return { id: docRef.id, ...properties };
};

// for Update
export const updateDocumentsWithProperties = async (
  collectionName: string,
  queryFields: Record<string, any>,
  updateProperties: Record<string, any>
) => {
  const colRef = collection(db, collectionName);
  const constraints = Object.entries(queryFields).map(([field, value]) =>
    where(field, "==", value)
  );
  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No matching document found!");
  }
  const updatedDocuments = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const docRef = doc(db, collectionName, docSnap.id);
      await updateDoc(docRef, updateProperties);
      return { id: docSnap.id, ...updateProperties };
    })
  );

  return updatedDocuments;
};
