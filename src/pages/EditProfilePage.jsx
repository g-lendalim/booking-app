import React, { useContext, useState, useEffect } from 'react'; 
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthProvider'; 

export default function EditProfilePage() {
    const { uid } = useParams();  
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
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const db = getFirestore();
    const storage = getStorage();

    useEffect(() => {
        if (currentUser && currentUser.uid !== uid) {
            navigate('/profile');
            return;
        }

        const fetchUserData = async () => {
            const userDocRef = doc(db, 'users', uid);  
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setUserData(userDocSnap.data());
            } else {
                console.log('No such document!');
            }
        };
        fetchUserData();
    }, [currentUser, db, navigate, uid]);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfilePic(file);
        }
    };

    const handleSaveChanges = async () => {
        setErrorMessage('');


        if (!userData.fullName || !userData.icNumber || !userData.contactNumber || !userData.email) {
            setErrorMessage("Please fill out all required fields.");
            return; 
        }

        if (userData.role === 'doctor' && !userData.registrationNumber) {
            setErrorMessage("Please enter your registration number.");
            return; 
        }

        setIsLoading(true);

        try {
            if (newProfilePic) {
                const storageRef = ref(storage, `profile_pics/${currentUser.uid}`);
                await uploadBytes(storageRef, newProfilePic);
                const newProfilePicUrl = await getDownloadURL(storageRef); 
                setUserData((prevState) => ({
                    ...prevState,
                    profilePictureUrl: newProfilePicUrl, 
                }));
            }

            const userDataToUpdate = {
                fullName: userData.fullName,
                icNumber: userData.icNumber,
                contactNumber: userData.contactNumber,
                email: userData.email,
                role: userData.role,
                profilePictureUrl: userData.profilePictureUrl,
            };

            if (userData.role === 'doctor' && userData.registrationNumber) {
                userDataToUpdate.registrationNumber = userData.registrationNumber;
            }

            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, userDataToUpdate);
            setIsLoading(false);
            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            setIsLoading(false);
            console.error('Error updating profile:', error); 
            setErrorMessage('An error occurred while updating the profile. Please try again later.'); // Set error message
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Edit Profile</h1>
            <div className="text-center mb-4">
                {/* Profile Picture */}
                <div className="profile-pic-container" style={{ position: 'relative' }}>
                    <img
                        src={userData.profilePictureUrl || ''}  
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: 150, height: 150, objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                        <input
                            type="file"
                            onChange={handleProfilePicChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="profile-pic-upload"
                        />
                        <label htmlFor="profile-pic-upload" className="btn btn-primary btn-sm">
                            <i className="bi bi-pencil-fill"></i> Change
                        </label>
                    </div>
                </div>
            </div>

            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Form>
                <Form.Group>
                    <Form.Label><strong>Full Name</strong></Form.Label>
                    <Form.Control
                        type="text"
                        value={userData.fullName}
                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label><strong>IC Number</strong></Form.Label>
                    <Form.Control
                        type="number"
                        value={userData.icNumber}
                        onChange={(e) => setUserData({ ...userData, icNumber: e.target.value })}
                    />
                </Form.Group>

                {userData.role === 'doctor' && (
                    <Form.Group>
                        <Form.Label><strong>Registration Number</strong></Form.Label>
                        <Form.Control
                            type="text"
                            value={userData.registrationNumber}
                            onChange={(e) => setUserData({ ...userData, registrationNumber: e.target.value })}
                        />
                    </Form.Group>
                )}

                <Form.Group>
                    <Form.Label><strong>Contact Number</strong></Form.Label>
                    <Form.Control
                        type="number"
                        value={userData.contactNumber}
                        onChange={(e) => setUserData({ ...userData, contactNumber: e.target.value })}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label><strong>Email</strong></Form.Label>
                    <Form.Control
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                </Form.Group>

                {/* Save Changes Button */}
                <Button
                    variant="success"
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="mt-3 w-100"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </Form>
        </div>
    );
}
