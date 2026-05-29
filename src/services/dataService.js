import { 
  collection, addDoc, query, where, getDocs, serverTimestamp,
  updateDoc, doc, increment, onSnapshot, orderBy, limit, arrayUnion, getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { notifyDonorsNewRequest, notifyRequestorOnAccept } from './notificationService';

export const createBloodRequest = async (requestData) => {
  const docRef = await addDoc(collection(db, "requests"), {
    ...requestData,
    status: "active",
    respondersCount: 0,
    responders: [],
    createdAt: serverTimestamp(),
  });
  const newRequest = { id: docRef.id, ...requestData };
  await notifyDonorsNewRequest(newRequest);
  return docRef.id;
};

export const listenToActiveRequests = (callback, bloodType = null, city = null) => {
  let constraints = [where("status", "==", "active"), orderBy("createdAt", "desc"), limit(100)];
  if (bloodType) constraints.push(where("bloodType", "==", bloodType));
  if (city) constraints.push(where("location", "==", city));
  const q = query(collection(db, "requests"), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const acceptBloodRequest = async (requestId, userId, donorInfo = {}) => {
  const requestRef = doc(db, "requests", requestId);
  const requestSnap = await getDoc(requestRef);
  const requestorId = requestSnap.data().createdBy;
  await updateDoc(requestRef, {
    respondersCount: increment(1),
    responders: arrayUnion({
      userId,
      bloodType: donorInfo.bloodType || "",
      phone: donorInfo.phone || "",
      city: donorInfo.city || "",
      timestamp: new Date().toISOString()
    }),
    lastUpdated: serverTimestamp()
  });
  await notifyRequestorOnAccept(requestorId, donorInfo, requestId);
  return true;
};

export const acceptBloodRequestWithCooldown = async (requestId, userId, donorInfo) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const lastDonation = userSnap.data()?.lastDonationDate;
  const cooldownEnd = lastDonation ? lastDonation + (56 * 24 * 60 * 60 * 1000) : 0;
  if (cooldownEnd > Date.now()) {
    throw new Error("لا يمكنك التبرع الآن. أنت في فترة راحة (8 أسابيع).");
  }
  await updateDoc(userRef, { lastDonationDate: Date.now(), available: false });
  return acceptBloodRequest(requestId, userId, donorInfo);
};

export const checkAndExpireRequests = async () => {
  const q = query(collection(db, "requests"), where("status", "==", "active"));
  const snap = await getDocs(q);
  const now = Date.now();
  const EXPIRY_MS = 48 * 60 * 60 * 1000;
  snap.forEach(async (docSnap) => {
    const data = docSnap.data();
    const createdAt = data.createdAt?.toMillis?.() || 0;
    if (now - createdAt > EXPIRY_MS) {
      await updateDoc(doc(db, "requests", docSnap.id), { status: "expired" });
    }
  });
};
