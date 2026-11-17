
import React, { useEffect, useState } from 'react';

import './AddressForm.css'
function AddressForm({editAddress,onClose,onSubmit,loading,errors}) {

    const [formData, setFormData] = useState({
        full_name: '',
        address_nickname: '',
        street_address: '',
        city: '',
        postal_code: '',
        country: '',
        phone_number: ''
    });


    // Fill form when editing an existing address
    useEffect(() => {

        if (editAddress) {

            setFormData({
                full_name: editAddress.full_name || '',
                address_nickname: editAddress.address_nickname || '',
                street_address: editAddress.street_address || '',
                city: editAddress.city || '',
                postal_code: editAddress.postal_code || '',
                country: editAddress.country || '',
                phone_number: editAddress.phone_number || ''
            });

        } else {

            // Empty form for new address
            setFormData({
                full_name: '',
                address_nickname: '',
                street_address: '',
                city: '',
                postal_code: '',
                country: '',
                phone_number: ''
            });

        }

    }, [editAddress]);


    // Handle input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

    };


    // Handle form submission
    const handleSubmit = async (e) => {

        e.preventDefault();

        await onSubmit(formData);

    };


    return (

        <div
            className="address-modal-overlay"
        >

            <div
                className="address-modal"
        
            >

                {/* Modal Header */}
                <div className="address-modal-header">

                    <div>

                        <h2>
                            {editAddress
                                ? 'Edit Address'
                                : 'Add New Address'}
                        </h2>

                        <p>
                            Enter your delivery address details.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="address-modal-close"
                        onClick={onClose}
                    >
                        &times;
                    </button>

                </div>


                {/* Address Form */}
                <form onSubmit={handleSubmit}>

                    {/* Full Name */}
                    <div className="address-form-group">

                        <label htmlFor="full_name">
                            Full Name
                        </label>

                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            maxLength={150}
                            required
                        />
                        {errors?.full_name && (
                        <p className="field-error">
                            {errors.full_name[0]}
                        </p>
                    )}

                    </div>


                    {/* Address Nickname */}
                    <div className="address-form-group">

                        <label htmlFor="address_nickname">
                            Address Nickname
                        </label>

                        <input
                            type="text"
                            id="address_nickname"
                            name="address_nickname"
                            value={formData.address_nickname}
                            onChange={handleChange}
                            placeholder="Home, Office, etc."
                            maxLength={100}
                        
                        />
                         {errors?.address_nickname && (
                        <p className="field-error">
                            {errors.address_nickname[0]}
                        </p>
                    )}

                    </div>


                    {/* Street Address */}
                    <div className="address-form-group">

                        <label htmlFor="street_address">
                            Street Address
                        </label>

                        <textarea
                            id="street_address"
                            name="street_address"
                            value={formData.street_address}
                            onChange={handleChange}
                            placeholder="Enter your street address"
                            maxLength={255}
                            rows={3}
                            required
                        />
                        {errors?.street_address && (
                        <p className="field-error">
                            {errors.street_address[0]}
                        </p>
                    )}

                    </div>


                    {/* City and Postal Code */}
                    <div className="address-form-row">

                        <div className="address-form-group">

                            <label htmlFor="city">
                                City
                            </label>

                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                maxLength={100}
                                required
                            />
                             {errors?.city && (
                            <p className="field-error">
                                {errors.city[0]}
                            </p>
                        )}

                        </div>


                        <div className="address-form-group">

                            <label htmlFor="postal_code">
                                Postal Code
                            </label>

                            <input
                                type="text"
                                id="postal_code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                placeholder="Postal code"
                                maxLength={20}
                                required
                            />
                            {errors?.postal_code && (
                            <p className="field-error">
                                {errors.postal_code[0]}
                            </p>
                        )}

                        </div>

                    </div>


                    {/* Country */}
                    <div className="address-form-group">

                        <label htmlFor="country">
                            Country
                        </label>

                        <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Enter country"
                            maxLength={100}
                            required
                        />
                         {errors?.country && (
                            <p className="field-error">
                                {errors.country[0]}
                            </p>
                        )}

                    </div>


                    {/* Phone Number */}
                    <div className="address-form-group">

                        <label htmlFor="phone_number">
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            maxLength={20}
                            required
                        />
                        {errors?.phone_number && (
                            <p className="field-error">
                                {errors.phone_number[0]}
                            </p>
                        )}

                    </div>


                    {/* Form Actions */}
                    <div className="address-form-actions">

                        <button
                            type="button"
                            className="address-cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="address-submit-btn"
                            disabled={loading}
                        >

                            {loading
                                ? 'Please wait...'
                                : editAddress
                                    ? 'Update Address'
                                    : 'Save Address'}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default AddressForm;
