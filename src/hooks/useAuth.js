  import { useState, useEffect } from 'react';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore'; // Ensure correct import
  import { auth, db } from '../firebase/config'; // Ensure correct import

  export default function useAuth() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          setUser(authUser);
          try {
            // Ensure the collection name and document ID are correct
            const userDoc = doc(db, 'employees', authUser.uid); // Correct usage of doc()
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }, []);

    const signOut = async () => {
      try {
        await auth.signOut();
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    };

    return {
      user,
      userData,
      loading,
      signOut,
    };
  }
