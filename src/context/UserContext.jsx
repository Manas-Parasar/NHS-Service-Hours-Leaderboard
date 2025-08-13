import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = { uid: user.uid, email: user.email, name: user.displayName };
          const userRole = userSnap.data().role;
          setUser(userData);
          setRole(userRole);
          sessionStorage.setItem("user", JSON.stringify(userData));
          sessionStorage.setItem("role", userRole);
        }
      } else {
        setUser(null);
        setRole(null);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);