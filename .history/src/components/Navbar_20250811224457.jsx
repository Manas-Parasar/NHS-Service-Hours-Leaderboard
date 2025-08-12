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
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-link">
          <h3>NHS Leaderboard</h3>
        </Link>
      </div>

      <div className="navbar-center">
        {role === "creator" && (
          <>
            <Link to="/creator" className="navbar-link">Dashboard</Link>
          </>
        )}
        {role === "advisor" && (
          <>
            <Link to="/advisor" className="navbar-link">Dashboard</Link>
          </>
        )}
        {role === "officer" && (
          <>
            <Link to="/officer" className="navbar-link">Dashboard</Link>
          </>
        )}
        {role === "member" && (
          <>
            <Link to="/member" className="navbar-link">Dashboard</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        <span className="navbar-user">{currentUser?.email} ({role})</span>
        <button onClick={handleLogout} className="navbar-button">Sign Out</button>
      </div>
    </nav>
  );
};

export default Navbar;