import { useEffect } from "react";
import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";

const DEV_EMAIL = "1624701945@qq.com";
const DEV_PASSWORD = "Password123";

export default function AutoEmailLogin() {
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (!mounted) return;

        const u = auth.currentUser;

        // Case A: already signed in as anonymous -> link to email/password (keeps the same uid)
        if (u && u.isAnonymous) {
          const cred = EmailAuthProvider.credential(DEV_EMAIL, DEV_PASSWORD);
          await linkWithCredential(u, cred);
          return;
        }

        // Case B: already signed in with some account
        if (u && !u.isAnonymous) {
          // if already the dev account, do nothing
          if (u.email === DEV_EMAIL) return;

          // different account -> switch to dev account
          await signOut(auth);
        }

        // Case C: not signed in -> try sign in as dev
        try {
          await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
        } catch (err: any) {
          const code = String(err?.code || "");
          if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
            await createUserWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
          } else {
            console.log("AutoEmailLogin sign-in error:", err);
          }
        }
      } catch (e) {
        console.log("AutoEmailLogin error:", e);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
