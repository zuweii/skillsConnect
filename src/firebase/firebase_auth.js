import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase_config';
import { doc, getDoc } from "firebase/firestore";
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
                    await this.fetchUserData(user.uid);
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
            await this.fetchUserData(userCredential.user.uid);
            return { user: userCredential.user, error: null };
        } catch (error) {
            console.error("Login error", error);
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

    async fetchUserData(uid) {
        try {
            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                this.userData = userDoc.data();
            } else {
                console.error("User document not found");
                this.userData = null;
            }
        } catch (error) {
            console.error("Error fetching user data", error);
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