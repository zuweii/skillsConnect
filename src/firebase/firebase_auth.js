import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    signInWithPopup,
    setPersistence,
    browserSessionPersistence
  } from "firebase/auth";
  import { auth, googleProvider } from './firebase_config';
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { db } from "./firebase_config";
  
  class FirebaseAuthentication {
      constructor() {
          this.user = null;
          this.userData = null;
          this.authReady = false;
          this.authStateChanged = new Promise((resolve) => {
              onAuthStateChanged(auth, async (user) => {
                  this.user = user;
                  if (user) {
                      await this.fetchAndUpdateUserData(user.uid);
                  } else {
                      this.userData = null;
                  }
                  this.authReady = true;
                  resolve(user);
              });
          });
          
          // Set persistence to session
          setPersistence(auth, browserSessionPersistence)
              .catch((error) => {
                  console.error("Error setting persistence:", error);
              });
      }
  
      async login(email, password) {
          try {
              const userCredential = await signInWithEmailAndPassword(auth, email, password);
              this.user = userCredential.user;
              await this.fetchAndUpdateUserData(userCredential.user.uid);
              return { user: userCredential.user, error: null };
          } catch (error) {
              console.error("Login error", error);
              return { user: null, error: error.code };
          }
      }
  
      async loginWithGoogle() {
          try {
              const result = await signInWithPopup(auth, googleProvider);
              this.user = result.user;
              await this.fetchAndUpdateUserData(result.user.uid);
              return { user: result.user, error: null };
          } catch (error) {
              console.error("Google login error", error);
              return { user: null, error: error.code };
          }
      }
  
      async logout() {
          try {
              await signOut(auth);
              this.user = null;
              this.userData = null; // Clear userData on logout
          } catch (error) {
              console.error("Logout error", error);
          }
      }
  
      async fetchAndUpdateUserData(uid) {
          try {
              const userDocRef = doc(db, "users", uid);
              const userDoc = await getDoc(userDocRef);
  
              let profilePhotoUrl = userDoc.exists() && userDoc.data().profile_photo 
                  ? userDoc.data().profile_photo  // Use existing profile photo if available
                  : this.user.photoURL || "";     // Fallback to Firebase photoURL or empty string
  
              const updatedData = {
                  email: this.user.email,
                  username: userDoc.exists() ? userDoc.data().username : this.user.email.split("@")[0],
                  profile_photo: profilePhotoUrl
              };
  
              // Only set the document if it doesn't exist or fields are missing
              if (!userDoc.exists() || !userDoc.data().profile_photo) {
                  await setDoc(userDocRef, updatedData, { merge: true });
              }
  
              this.userData = updatedData;
          } catch (error) {
              console.error("Error fetching/updating user data", error);
              this.userData = null;
          }
      }
  
      getCurrentUser() {
          return this.user;
      }
  
      getUserData() {
          return this.userData;
      }
  
      isAuthReady() {
          return this.authReady;
      }
  
      async waitForAuthReady() {
          if (this.authReady) return this.user;
          return this.authStateChanged;
      }
  }
  
  const FBInstanceAuth = new FirebaseAuthentication();
  export default FBInstanceAuth;