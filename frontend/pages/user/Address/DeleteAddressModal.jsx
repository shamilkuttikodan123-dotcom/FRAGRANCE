
import React from 'react';
import './DeleteAddressModal.css'
function DeleteAddressModal({ address, onClose, onConfirm, loading }) {

    if (!address) return null;

    return (
        <div
            className="address-modal-overlay"
            onClick={onClose}
        >
            <div
                className="address-modal delete-address-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="address-modal-header">
                    <h3>Delete Address</h3>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        &times;
                    </button>
                </div>

                <div className="delete-modal-content">
                    <p>
                        Are you sure you want to delete this address?
                    </p>

                    <p className="delete-address-name">
                        {address.address_nickname || address.full_name}
                    </p>

                    <p className="delete-warning">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="address-modal-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="confirm-delete-btn"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Address'}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default DeleteAddressModal;
