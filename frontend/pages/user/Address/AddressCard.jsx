
import React from 'react';
import './AddressCard.css'
function AddressCard({address, onEdit,onDelete,onSetDefault}) {

    return (

        <div className="address-card">

            {/* Card Header */}
            <div className="address-card-header">

                <div className="address-card-title">

                    <h3>
                        {address.address_nickname || 'Saved Address'}
                    </h3>

                    {address.is_default && (
                        <span className="default-badge">
                            Default Address
                        </span>
                    )}

                </div>


                {/* Default Radio Button */}
                <label className="default-radio">

                    <input
                        type="radio"
                        name="default-address"
                        checked={address.is_default}
                        onChange={() => onSetDefault(address.id)}
                    />

                    <span>Set as Default</span>

                </label>

            </div>


            {/* Address Details */}
            {/* Address Details */}
            <div className="address-card-details">

                <p>
                    <strong>Full Name:</strong> {address.full_name}
                </p>

                <p>
                    <strong>Address Nickname:</strong> {address.address_nickname || 'N/A'}
                </p>

                <p>
                    <strong>Street Address:</strong> {address.street_address}
                </p>

                <p>
                    <strong>City:</strong> {address.city}
                </p>

                <p>
                    <strong>Postal Code:</strong> {address.postal_code}
                </p>

                <p>
                    <strong>Country:</strong> {address.country}
                </p>

                <p>
                    <strong>Phone Number:</strong> {address.phone_number}
                </p>

            </div>


            {/* Card Actions */}
            <div className="address-card-actions">

                <button
                    type="button"
                    className="edit-address-btn"
                    onClick={() => onEdit(address)}
                >
                    Edit
                </button>

                <button
                    type="button"
                    className="delete-address-btn"
                    onClick={() => onDelete(address)}
                >
                    Delete
                </button>

            </div>

        </div>

    );

}

export default AddressCard;
