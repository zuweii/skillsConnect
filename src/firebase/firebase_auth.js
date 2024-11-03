import { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup } from "firebase/auth";
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
            this.userData = null;
        } catch (error) {
            console.error("Logout error", error);
        }
    }

    async fetchAndUpdateUserData(uid) {
        try {
            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);

            // Default username based on email if user data doesn't exist
            const defaultUsername = this.user.email.split("@")[0];
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Update user data in Firestore with username if it’s missing or needs updating
            const updatedData = {
                ...userData,
                email: this.user.email,
                username: userData.username || defaultUsername,
                profile_photo: this.user.photoURL || userData.profile_photo || ""
            };

            if (!userDoc.exists() || userData.username !== updatedData.username) {
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
