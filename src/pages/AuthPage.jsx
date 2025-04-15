import { Button, Col, Row, Card } from 'react-bootstrap';
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
import FormCard from '../components/FormCard';

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
    if (currentUser) navigate('/appointments');
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
      <Col md={8} lg={6}>
        {/* Clinic Name and Logo */}
        <div className="mb-5">
          <i className="bi bi-heart-pulse text-danger" style={{ fontSize: '3rem' }}></i>
          <h1 className="fw-bold mt-2">Lifeline Medical Center</h1>
          <p className="text-muted">Your trusted partner in health and care</p>
        </div>

        {/* Role Selection Card */}
        <Card className="mb-4 shadow-lg border-0">
          <Card.Body>
            <h2 className="fw-bold mb-4">Choose Your Role</h2>
            <div className="d-flex justify-content-between gap-3">
              <Button variant="primary" className="w-100" onClick={() => setRole('doctor')}>
                Doctor
              </Button>
              <Button variant="success" className="w-100" onClick={() => setRole('patient')}>
                Patient
              </Button>
              <Button variant="danger" className="w-100" onClick={() => setRole('admin')}>
                Admin
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Form Card */}
        {role && (
          <FormCard
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
