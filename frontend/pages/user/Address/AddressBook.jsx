
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    clearAddressError
} from '../../../features/addressSlice';

import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import DeleteAddressModal from './DeleteAddressModal';

import './AddressBook.css';


function AddressBook() {

    const dispatch = useDispatch();

    // Redux state
    const {
        addresses,
        loading,
        error,
        actionLoading,
        actionError
    } = useSelector((state) => state.address);


    // Local component states
    const [showForm, setShowForm] = useState(false);
    const [editAddress, setEditAddress] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDeleteAddress, setSelectedDeleteAddress] = useState(null);


    // Fetch all addresses when page loads
    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);


    // Open Add Address form
    const handleAddAddress = () => {

        setEditAddress(null);

        dispatch(clearAddressError());

        setShowForm(true);
    };


    // Open Edit Address form
    const handleEditAddress = (address) => {

        setEditAddress(address);

        dispatch(clearAddressError());

        setShowForm(true);
    };


    // Close Address form
    const handleCloseForm = () => {

        setShowForm(false);

        setEditAddress(null);

        dispatch(clearAddressError());
    };


    // Add or Update address
    const handleSubmitAddress = async (addressData) => {

        try {

            if (editAddress) {

                await dispatch(
                    updateAddress({
                        id: editAddress.id,
                        addressData
                    })
                ).unwrap();

            } else {

                await dispatch(
                    addAddress(addressData)
                ).unwrap();

            }

            setShowForm(false);

            setEditAddress(null);

        } catch (error) {

            console.error('Address operation failed:', error);

        }
    };


    // Open Delete confirmation modal
    const handleDeleteClick = (address) => {

        setSelectedDeleteAddress(address);

        dispatch(clearAddressError());

        setShowDeleteModal(true);
    };


    // Close Delete confirmation modal
    const handleCloseDeleteModal = () => {

        setShowDeleteModal(false);

        setSelectedDeleteAddress(null);

        dispatch(clearAddressError());
    };


    // Confirm Delete
    const handleConfirmDelete = async () => {

        if (!selectedDeleteAddress) return;

        try {

            await dispatch(
                deleteAddress(selectedDeleteAddress.id)
            ).unwrap();

            setShowDeleteModal(false);

            setSelectedDeleteAddress(null);

            // Refresh address list
            dispatch(fetchAddresses());

        } catch (error) {

            console.error('Address deletion failed:', error);

        }
    };


    // Set Default Address
    const handleSetDefault = async (id) => {

        try {

            await dispatch(
                setDefaultAddress(id)
            ).unwrap();

        } catch (error) {

            console.error('Failed to set default address:', error);

        }
    };


    return (

        <div className="address-book-container">


            {/* Error Message */}
            {error && (
                <p className="address-error">
                    {typeof error === 'string'
                        ? error
                        : 'Unable to load addresses.'}
                </p>
            )}



            {/* Loading and Address List */}
            {loading ? (

                <div className="address-loading">
                    Loading addresses...
                </div>

            ) : addresses.length === 0 ? (

                /* Empty Address */
                <div className="empty-address">

                    <h3>No Saved Addresses</h3>

                    <p>
                        You haven't added any delivery addresses yet.
                    </p>

                    <button
                        type="button"
                        className="add-address-btn"
                        onClick={handleAddAddress}
                    >
                        Add Your First Address
                    </button>

                </div>

            ) : (

                /* Address List */
                <div className="saved-address-section">

                    <div className="saved-address-header">

                        <h3>
                            Saved Addresses ({addresses.length})
                        </h3>

                        <button
                            type="button"
                            className="add-address-btn"
                            onClick={handleAddAddress}
                        >
                            + Add New Address
                        </button>

                    </div>


                    <div className="address-list">

                        {addresses.map((address) => (

                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteClick}
                                onSetDefault={handleSetDefault}
                            />

                        ))}

                    </div>

                </div>

            )}


            {/* Add / Edit Address Form */}
            {showForm && (

                <AddressForm
                    editAddress={editAddress}
                    onClose={handleCloseForm}
                    onSubmit={handleSubmitAddress}
                    loading={actionLoading}
                    errors={actionError}
                />

            )}


            {/* Delete Confirmation Modal */}
            {showDeleteModal && (

                <DeleteAddressModal
                    address={selectedDeleteAddress}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    loading={actionLoading}
                />

            )}

        </div>

    );

}

export default AddressBook;
