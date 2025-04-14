import React, { useContext, useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Container } from 'react-bootstrap';
import { AuthContext } from '../components/AuthProvider';

export default function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    fullName: '',
    icNumber: '',
    registrationNumber: '',
    contactNumber: '',
    email: '',
    profilePictureUrl: '',
    role: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  return (
    <Container className="profile-page mt-5">
      <Row className="justify-content-center">
        <Col md={9}>
          <Card className="shadow-lg">
            <Card.Body>
              {/* Profile Header */}
              <div className="text-center mb-4">
                <div className="profile-pic-container mb-3">
                  <img
                    src={userData.profilePictureUrl} 
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 150, height: 150, objectFit: 'cover' }}
                  />
                </div>
                <h2 className="fw-bold">{userData.fullName}</h2>
                <p className="text-muted">{userData.role}</p>
              </div>

              {/* Profile Information */}
              <div className="profile-info mb-4">
                <Row className="mb-3">
                  <Col sm={4} className="fw-bold">Full Name:</Col>
                  <Col sm={8}>{userData.fullName}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4} className="fw-bold">IC Number:</Col>
                  <Col sm={8}>{userData.icNumber}</Col>
                </Row>
                {userData.role === 'doctor' && (
                  <Row className="mb-3">
                    <Col sm={4} className="fw-bold">Registration Number:</Col>
                    <Col sm={8}>{userData.registrationNumber}</Col>
                  </Row>
                )}
                <Row className="mb-3">
                  <Col sm={4} className="fw-bold">Contact Number:</Col>
                  <Col sm={8}>{userData.contactNumber}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4} className="fw-bold">Email:</Col>
                  <Col sm={8}>{userData.email}</Col>
                </Row>
              </div>

              {/* Edit Profile Button */}
              <div className="text-center">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/edit-profile/${currentUser.uid}`)}
                  className="rounded-pill px-4 py-2"
                >
                  Edit Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


