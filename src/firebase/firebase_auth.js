import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase_config';

class FirebaseAuthentication {
    constructor() {
        this.user = null;
        this.authReady = false;
        this.authStateChanged = new Promise((resolve) => {
            onAuthStateChanged(auth, (user) => {
                this.user = user;
                this.authReady = true;
                resolve(user);
            });
        });
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.user = userCredential.user;
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
        } catch (error) {
            console.error("Logout error", error);
        }
    }

    getCurrentUser() {
        return this.user;
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