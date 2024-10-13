import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from './firebase_config';  // Import initialized auth from firebase_config.js

class FirebaseAuthentication {
    getAuth() {
        return auth;  // Use the initialized auth instance
    }

    async login(auth, email, password) {
        let errorCode = null;
        let data = null;
        try {
            data = await signInWithEmailAndPassword(auth, email, password);
            console.log("login success", data);
        } catch (error) {
            console.error("login error", error);
            errorCode = 1001;
        }
        return { data, errorCode };
    }

    logout() {
        signOut(auth)
            .then(() => {
                console.log("logout success");
            })
            .catch((error) => {
                console.error("logout error", error);
            });
    }
}

const FBInstanceAuth = new FirebaseAuthentication();
export default FBInstanceAuth;
