import { Button, Col, Row, Modal, Card } from 'react-bootstrap';
import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { AuthContext } from '../components/AuthProvider';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import DarkFormCard from '../components/DarkFormCard'; 

export default function AuthPage() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [MMCNumber, setMMCNumber] = useState('');
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) navigate('/home');
  }, [currentUser, navigate]);

  const checkUserExists = useCallback(async () => {
    if (!email || !currentUser) return;
    const db = getFirestore();
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    setUserExists(userDocSnap.exists());
  }, [email, currentUser]);

  useEffect(() => {
    if (email) checkUserExists();
  }, [email, checkUserExists]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        MMCNumber: role === 'doctor' ? MMCNumber : null,
        createdAt: new Date(),
      });
      console.log('User signed up and profile saved in Firestore!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Row className="justify-content-center text-center mt-5">
      <Col md={8} lg={7} xl={6} className="px-3">
        <Card className="mb-4 bg-dark text-light shadow-sm">
          <Card.Body>
            <h2>Choose your role to continue</h2>
            <div className="d-flex justify-content-between gap-2 mt-3">
              <Button variant="primary" onClick={() => setRole('doctor')}>
                Doctor
              </Button>
              <Button variant="success" onClick={() => setRole('patient')}>
                Patient
              </Button>
              <Button variant="danger" onClick={() => setRole('admin')}>
                Admin
              </Button>
            </div>
          </Card.Body>
        </Card>

        {role && (
          <DarkFormCard
            role={role}
            email={email}
            password={password}
            MMCNumber={MMCNumber}
            setEmail={setEmail}
            setPassword={setPassword}
            setMMCNumber={setMMCNumber}
            handleGoogleLogin={handleGoogleLogin}
            handleSubmit={userExists ? handleLogin : handleSignUp}
            userExists={userExists}
            handleLogin={handleLogin}
          />
        )}
      </Col>
    </Row>
  );
}
