import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase_config';

class FirebaseAuthentication {
    constructor() {
        this.user = null;
        this.authStateChanged = new Promise((resolve) => {
            onAuthStateChanged(auth, (user) => {
                this.user = user;
                resolve(user);
            });
        });
    }

    getAuth() {
        return auth;
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.user = userCredential.user;
            return { data: userCredential, errorCode: null };
        } catch (error) {
            console.error("login error", error);
            return { data: null, errorCode: error.code };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            this.user = null;
            console.log("logout success");
        } catch (error) {
            console.error("logout error", error);
        }
    }

    getCurrentUser() {
        return this.user;
    }

    async waitForAuthReady() {
        return this.authStateChanged;
    }
}

const FBInstanceAuth = new FirebaseAuthentication();
export default FBInstanceAuth;