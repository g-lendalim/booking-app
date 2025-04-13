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
                    src={userData.profilePictureUrl || 'default-profile-pic.jpg'} // Fallback image
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 150, height: 150, objectFit: 'cover' }}
                  />
                </div>
                <h2>{userData.fullName}</h2>
              </div>

              {/* Profile Information */}
              <div className="profile-info mb-4">
                <p><strong>Full Name:</strong> {userData.fullName}</p>
                <p><strong>IC Number:</strong> {userData.icNumber}</p>
                <p><strong>Date of Birth:</strong> {userData.icNumber}</p>
                {userData.role === 'doctor' && (
                  <p><strong>Registration Number:</strong> {userData.registrationNumber}</p>
                )}
                <p><strong>Contact Number:</strong> {userData.contactNumber}</p>
                <p><strong>Email:</strong> {userData.email}</p>
              </div>

              {/* Edit Profile Button */}
              <div className="text-center">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/edit-profile/${currentUser.uid}`)}
                  className="rounded-pill p-3"
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


