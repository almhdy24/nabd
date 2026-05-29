import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; 

// تسجيل الدخول
export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// التسجيل مع حفظ الدور في Firestore
export const registerWithEmail = async (email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // حفظ بيانات المستخدم الإضافية
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: email,
    role: role, // 'donor' أو 'requestor'
    available: role === "donor", 
    createdAt: new Date().toISOString(),
  });

  return user;
};

// جلب بيانات المستخدم من Firestore
export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
