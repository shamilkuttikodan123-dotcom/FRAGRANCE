import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { UpdateProfile,fetchProfile } from "../../../features/profileSlice";
import "./UpdateProfilePage.css";

function UpdateProfilePage({ onClose }) {

    const dispatch = useDispatch();

    const { profile, updateLoading,updateError } = useSelector(
        (state) => state.profile
    );

    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    // Load existing profile details
    useEffect(() => {
        if (profile) {
            reset({
                full_name: profile.full_name || "",
                phone_number: profile.phone_number || ""
            });
        }
    }, [profile, reset]);

    // Select profile picture
    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedImage(file);

            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
        }
    };

    // Submit profile details
    const onSubmit = async (formData) => {
        try {
            const updatedData = new FormData();

            updatedData.append("full_name", formData.full_name);
            updatedData.append("phone_number", formData.phone_number);

            if (selectedImage) {
                updatedData.append("profile_picture", selectedImage);
            }

            await dispatch(UpdateProfile(updatedData)).unwrap();


            onClose();
            await dispatch(fetchProfile()).unwrap();

        } catch (error) {
            console.log(error);
        }
    };

 

    return (
        <div
            className="profile-popup-overlay"
        >
            <div
                className="profile-popup-content"
            >


                <div className="profile-page">

                    <div className="profile-header">
                        <h1>Edit Profile</h1>
                        <p>Update your personal information.</p>
                    </div>

                    <div className="profile-card">

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="profile-edit-form"
                        >

                            {/* Profile Picture */}
                            <div className="profile-picture-section">

                                <label>Profile Picture</label>

                                <div className="profile-image-preview">

                                    {preview || profile?.profile_picture ? (
                                        <img
                                            src={preview || profile.profile_picture}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div className="profile-placeholder">
                                            No Image
                                        </div>
                                    )}

                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />

                            </div>

                            {/* Full Name */}
                            <label>Full Name</label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                {...register("full_name", {
                                    required: "Full name is required",
                                    pattern: {
                                        value: /^[A-Za-z ]+$/,
                                        message: "Enter a valid full name"
                                    }
                                })}
                            />

                            {errors.full_name && (
                                <p className="error-message">
                                    {errors.full_name.message}
                                </p>
                            )}
                            {updateError?.full_name && (
                                <p className="error-message">
                                    {updateError.full_name[0]}
                                </p>
                            )}

                            {/* Phone Number */}
                            <label>Phone Number</label>

                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                {...register("phone_number", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Enter a valid 10 digit phone number"
                                    }
                                })}
                            />

                            {errors.phone_number && (
                                <p className="error-message">
                                    {errors.phone_number.message}
                                </p>
                            )}

                            {updateError?.phone_number && (
                                <p className="error-message">
                                    {updateError.phone_number[0]}
                                </p>
                            )}

                            {/* Buttons */}
                            <button
                                type="submit"
                                className="profile-save-btn"
                                disabled={updateLoading}
                            >
                                {updateLoading ? "Updating..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="update-password-btn"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                        </form>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default UpdateProfilePage;
