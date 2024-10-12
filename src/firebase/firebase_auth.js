import {
	getAuth,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";

class FirebaseAuthentication {
	getAuth() {
		return getAuth();
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

	// handle logout
	logout = function (auth) {
		signOut(auth)
			.then(() => {
				console.log("logout success");
			})
			.catch((error) => {
				console.error("logout error", error);
			});
	};
}

const FBInstanceAuth = new FirebaseAuthentication();
export default FBInstanceAuth;
