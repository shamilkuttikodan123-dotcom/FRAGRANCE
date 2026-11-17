
import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UpdateProfilePage from "./UpdateProfilePage";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
import ForgotPasswordProfile from "./ForgotPasswordProfile";
import {
    UserRound,
    Mail,
    Phone,
    ShieldCheck,
    LockKeyhole,
    
} from "lucide-react";
import Loading from "../../../components/Home page/Loading";
import { fetchProfile,clearProfile } from "../../../features/profileSlice";
import "./Profile.css";

function MyProfile() {

    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);


        const { profile, profileLoading, profileError } = useSelector(
            (state) => state.profile
        );

        const isGoogleAccount = Boolean(profile?.google_id);
        const dispatch = useDispatch();




    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);



    if (profileLoading && !profile) {
    return <Loading/>
    }
    if (profileError) {
        return <p className="myprofile-error">{profileError}</p>;
    }

    if (!profile) {
        return <p className="myprofile-empty">Profile data not available.</p>;
    }

    return (
        <div className="myprofile-page">

            {/* Page Header */}
            <div className="myprofile-header">
                <h1>My Profile</h1>
                <p>Manage your account information and security.</p>
            </div>

            {/* Profile Picture Section - Display Only */}
            <div className="myprofile-picture-section">

                <div className="myprofile-picture">

                    {profile.profile_picture ? (
                        <img
                        key={profile.profile_picture}
                        src={profile.profile_picture}
                        alt="Profile"
                    />
                    ) : (
                        <UserRound size={55} />
                    )}

                </div>

                <div className="myprofile-picture-info">
                    <h3>{profile.full_name}</h3>
                    <p>Profile Picture</p>
                    <span>Your profile picture</span>
                </div>

            </div>

            {/* Account Information */}
            <div className="myprofile-card">

                <div className="myprofile-card-header">

                    <div className="myprofile-heading">
                        <UserRound />

                        <div>
                            <h2>Account Information</h2>
                            <p>Your personal account details</p>
                        </div>
                    </div>


                    <button
                    onClick={() => {
                        setShowEditPopup(true);
                    }}
                >
                    Edit Details
                </button>

                </div>

                <div className="myprofile-details-grid">

                    <div className="myprofile-detail">
                        <label>Full Name</label>

                        <div className="myprofile-value">
                            <UserRound />
                            <span>{profile.full_name}</span>
                        </div>
                    </div>

                    <div className="myprofile-detail">
                        <label>Email Address</label>

                        <div className="myprofile-value">
                            <Mail />
                            <span>{profile.email}</span>
                        </div>
                    </div>

                    <div className="myprofile-detail">
                        <label>Phone Number</label>

                        <div className="myprofile-value">
                            <Phone />
                            <span>
                                {profile.phone_number || "Not provided"}
                            </span>
                        </div>
                    </div>

                </div>

            </div>

            {/* Security Credentials */}
           {!isGoogleAccount&&( <div className="myprofile-card">

                <div className="myprofile-card-header">

                    <div className="myprofile-heading">
                        <ShieldCheck />

                        <div>
                            <h2>Security Credentials</h2>
                            <p>Manage your account security</p>
                        </div>
                    </div>

                </div>

                {/* Email Section */}
                <div className="myprofile-security-detail">

                    <div className="myprofile-security-info">

                        <div className="myprofile-security-icon">
                            <Mail />
                        </div>

                        <div>
                            <h3>Email Address</h3>
                            <p>{profile.email}</p>
                        </div>

                    </div>

                  
                        <button
                        type="button"
                        className="myprofile-security-btn"
                        onClick={() => {
                            setShowEmailPopup(true);
                        }}
                    >
                        Change Email
                    </button>
                    

                </div>

                <div className="myprofile-security-divider"></div>

                {/* Password Section */}
                <div className="myprofile-security-detail">

                    <div className="myprofile-security-info">

                        <div className="myprofile-security-icon">
                            <LockKeyhole />
                        </div>

                        <div>
                            <h3>Password</h3>
                            <p>••••••••••••</p>
                        </div>

                    </div>

                
                        <button
                        type="button"
                        className="myprofile-security-btn"
                        onClick={() => {
                            setShowPasswordPopup(true);
                        }}
                    >
                        Change Password
                    </button>
                

                </div>

            </div>)}

                {showEditPopup && (
                    <UpdateProfilePage
                        onClose={() => {
                            setShowEditPopup(false);
                        }}
                    />
                )}

            {showEmailPopup && (
                <ChangeEmail
                    onClose={() => {
                        setShowEmailPopup(false);
                    }}
                />
            )}

            {showPasswordPopup && (
                <ChangePassword
                    onClose={() => {
                        setShowPasswordPopup(false);
                    }}
                    onForgotPassword={() => {
                        setShowPasswordPopup(false);

                        setShowForgotPasswordPopup(true);
                    }}
                />
            )}

            {showForgotPasswordPopup && (
                <ForgotPasswordProfile
                    onClose={() => {
                        setShowForgotPasswordPopup(false);
                    }}
                />
            )}

        </div>
    );
}

export default MyProfile;
