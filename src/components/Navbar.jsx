import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import nhsLogo from "../assets/nhs-logo.png"; // Import the NHS logo

const Navbar = () => {
  const { user, role } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null; // This is line 12

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <a href="/" onClick={() => navigate(0)} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src={nhsLogo} alt="NHS Logo" style={styles.logo} />
          <h3 style={styles.title}>NHS Leaderboard</h3>
        </a>
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
        <span style={styles.userInfo}><b>{user?.name}</b> - {role}</span>
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
    backgroundColor: "#FFFFFF", // White background
    color: "#2b8dd3", // NHS blue for text
    padding: "10px 30px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
    fontFamily: "'Montserrat', sans-serif", // Consistent font
  },
  left: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    height: "40px", // Adjust size as needed
    marginRight: "10px",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  center: {
    flex: 2,
    display: "flex",
    justifyContent: "center",
    gap: "30px", // Increased gap for better spacing
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "15px", // Increased gap
  },
  link: {
    color: "#2b8dd3", // NHS blue for links
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem",
    padding: "5px 10px",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#e0f2f7", // Light hover effect
    },
  },
  userInfo: {
    fontSize: "1rem",
    color: "#555", // Darker gray for better readability
    marginRight: "10px",
  },
  button: {
    backgroundColor: "#2b8dd3", // NHS blue for button background
    color: "#FFFFFF", // White text
    border: "none",
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "50px", // Rounded corners
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#206ba0", // Darker blue on hover
    },
  },
};

export default Navbar;