import { auth, db, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          role: "member", 
          hours: 0,
        });
      }

      const updatedSnap = await getDoc(userRef);
      const userData = updatedSnap.data();

      switch (userData.role) {
        case "creator":
          navigate("/creator");
          break;
        case "advisor":
          navigate("/advisor");
          break;
        case "officer":
          navigate("/officer");
          break;
        case "member":
        default:
          navigate("/member");
          break;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}

export default Login;