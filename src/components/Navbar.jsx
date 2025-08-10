import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { currentUser, role } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (location.pathname === "/") {
      setShow(false);
    } else {
      setShow(true);
    }
  }, [location]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!show) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <h3 style={{ margin: 0 }}>NHS Leaderboard</h3>
      </div>

      <div style={styles.center}>
        {role === "creator" && (
          <>
            <Link to="/creator" style={styles.link}>Dashboard</Link>
            {/* Add more creator-specific links here if needed */}
          </>
        )}
        {role === "advisor" && (
          <>
            <Link to="/advisor" style={styles.link}>Dashboard</Link>
          </>
        )}
        {role === "officer" && (
          <>
            <Link to="/officer" style={styles.link}>Dashboard</Link>
          </>
        )}
        {role === "member" && (
          <>
            <Link to="/member" style={styles.link}>Dashboard</Link>
          </>
        )}
      </div>

      <div style={styles.right}>
        <span style={styles.user}>{currentUser?.email}</span>
        <button onClick={handleLogout} style={styles.button}>Sign Out</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e3a8a", // Tailwind's blue-800
    color: "white",
    padding: "10px 20px",
  },
  left: {
    flex: 1,
  },
  center: {
    flex: 2,
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
  user: {
    fontSize: "0.9rem",
    color: "#d1d5db", // Tailwind's gray-300
  },
  button: {
    backgroundColor: "#ef4444", // Tailwind's red-500
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Navbar;