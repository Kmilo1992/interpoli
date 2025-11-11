import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

const alertsCollection = collection(db, "alerts");

export async function getAlerts() {
  const q = query(alertsCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createAlert(alert) {
  const newAlert = {
    ...alert,
    createdAt: alert.createdAt || new Date().toISOString(),
  };

  const docRef = await addDoc(alertsCollection, newAlert);
  return docRef.id;
}

export async function updateAlertInFirestore(alert) {
  if (!alert?.id) throw new Error("Falta el id para actualizar la alerta.");

  const ref = doc(db, "alerts", alert.id);
  const { id, createdAt, ...rest } = alert; // evitar sobrescribir createdAt

  await updateDoc(ref, {
    ...rest,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function deleteAlertFromFirestore(id) {
  if (!id) throw new Error("Falta el id para eliminar la alerta.");

  const ref = doc(db, "alerts", id);
  await deleteDoc(ref);
  return true;
}
