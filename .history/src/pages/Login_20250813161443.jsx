import { auth, db, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import nhsIcon from "../assets/nhs-icon.png";

const GreekPillar = ({ pillarText }) => {
  const fontSize = 50;
  const lineHeight = 1.2;
  const textHeight = pillarText.length * fontSize * lineHeight;

  const pillarCenterY = 1000 / 2;

  const startY = pillarCenterY - (textHeight / 2) + (fontSize * lineHeight / 2);

  return (
    <svg width="150" height="100%" viewBox="0 0 150 1000">
      <rect x="25" y="0" width="100" height="20" fill="#f0f0f0" />
      <rect x="37.5" y="20" width="75" height="960" fill="#f0f0f0" />
      <rect x="25" y="980" width="100" height="20" fill="#f0f0f0" />
      <line x1="45" y1="20" x2="45" y2="980" stroke="#e0e0e0" strokeWidth="5" />
      <line x1="60" y1="20" x2="60" y2="980" stroke="#e0e0e0" strokeWidth="5" />
      <line x1="75" y1="20" x2="75" y2="980" stroke="#e0e0e0" strokeWidth="5" />
      <line x1="90" y1="20" x2="90" y2="980" stroke="#e0e0e0" strokeWidth="5" />
      <line x1="105" y1="20" x2="105" y2="980" stroke="#e0e0e0" strokeWidth="5" />

      <text
        x="75"
        y={startY}
        textAnchor="middle"
        fontFamily="'Playfair Display', serif"
        fontSize={fontSize}
        fill="#e0f2f7"
        fontWeight="bold"
      >
        {pillarText.split('').map((char, index) => (
          <tspan key={index} x="75" dy={index === 0 ? "0" : `${lineHeight}em`}>
            {char}
          </tspan>
        ))}
      </text>
    </svg>
  );
};

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
    <>
      <style>{`
        html, body {
          height: 100%;
          overflow: hidden;
        }
      `}</style>
      <div style={{
        backgroundColor: '#2b8dd3',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Montserrat', sans-serif"
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 100px',
        }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ marginRight: '40px', height: '100%', display: 'flex', alignItems: 'center' }}><GreekPillar pillarText="LEADERSHIP" /></div>
            <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}><GreekPillar pillarText="CHARACTER" /></div>
          </div>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ marginRight: '50px', height: '100%', display: 'flex', alignItems: 'center' }}><GreekPillar pillarText="SERVICE" /></div>
            <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}><GreekPillar pillarText="SCHOLARSHIP" /></div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 1
        }}>
          <img src={nhsIcon} alt="NHS Logo" style={{ width: '180px', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>NHS Leaderboard</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Sign in with your school google account</p>
          <button onClick={handleLogin} style={{
            backgroundColor: 'white',
            color: '#2b8dd3',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderRadius: '50px',
            cursor: 'pointer',
            marginTop: '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}>
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;