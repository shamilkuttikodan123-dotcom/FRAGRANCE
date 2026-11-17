
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchCustomers,
    customerBlock,
    clearCustomerError
} from "../../../features/adminfeatures/customerSlice";

import "./Customers.css";

function Customers() {

    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const {
    customers,
    searchLoading,
    blockLoading,
    error,
    stats,
    count,
    next,
    previous
} = useSelector((state) => state.customers);
console.log("count:", count);
console.log("pageSize:", pageSize);

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // FETCH CUSTOMERS + SEARCH
    useEffect(() => {
        dispatch(
            fetchCustomers({
                search: searchQuery,
                page: currentPage,
                pageSize: pageSize
            })
        );
    }, [searchQuery, currentPage, dispatch]);


    const handleBlock = (customer) => {
        setSelectedCustomer(customer);
    };

        //block
    const confirmBlock = async () => {

    if (!selectedCustomer) return;

    try {
        await dispatch(
            customerBlock(selectedCustomer.id)
        ).unwrap();

        setSelectedCustomer(null);

        await dispatch(
            fetchCustomers({
                search: searchQuery,
                page: currentPage,
                pageSize: pageSize
            })
        ).unwrap();

    } catch (error) {
        console.error("Block/Unblock failed:", error);
    }
};


    // DATE FORMAT
    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };


    return (
        <div className="customers-page">

         
            <div className="customers-header">
                <div>
                    <h2>Customers</h2>
                    <p>Manage your registered customers</p>
                </div>
            </div>


            {/* ERROR */}
            {error && (
                <div className="customer-error">
                    {typeof error === "string"
                        ? error
                        : "Something went wrong."}

                    <button onClick={() => dispatch(clearCustomerError())}>
                        ×
                    </button>
                </div>
            )}


            {/* CUSTOMER details */}
            <div className="customer-stats">

                <div className="customer-stat-card">
                    <p>Total Customers</p>
                    <h2>{stats.total_customers}</h2>
                </div>

                <div className="customer-stat-card">
                    <p>Blocked Customers</p>
                    <h2>{stats.blocked_customers}</h2>
                </div>

                <div className="customer-stat-card">
                    <p>Not Blocked Customers</p>
                    <h2>{stats.not_blocked_customers}</h2>
                </div>

            </div>
            {/* CUSTOMER SEARCH */}
            

                <div className="customer-search-container">

                    <div className="customer-search-box">

                        <input
                            type="text"
                            placeholder="Search by name, email or phone number..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}                        
                            />

                        {searchQuery && (
                            <button
                                type="button"
                                className="customer-search-clear"
                               onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                            >
                                Clear ×
                            </button>
                        )}

                    </div>

                </div>



            {/* CUSTOMER TABLE */}
            <div className="customers-table-container">

                <table className="customers-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Joined Date</th>
                            <th>Account Status</th>
                            <th>Block Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {searchLoading && customers.length === 0 ? (

                            <tr>
                                <td colSpan="7">Loading customers...</td>
                            </tr>

                        ) : customers.length === 0 ? (

                            <tr>
                                <td colSpan="7">No customers found.</td>
                            </tr>

                        ) : (

                            customers.map((customer) => (

                                <tr key={customer.id}>

                                    <td>{customer.id}</td>
                                    <td>{customer.full_name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone_number || "N/A"}</td>
                                    <td>{formatDate(customer.created_at)}</td>

                                    <td>
                                        <span className={
                                            customer.is_active
                                                ? "customer-status active"
                                                : "customer-status inactive"
                                        }>
                                            {customer.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={
                                            customer.is_blocked
                                                ? "customer-status blocked"
                                                : "customer-status active"
                                        }>
                                            {customer.is_blocked
                                                ? "Blocked"
                                                : "Not Blocked"}
                                        </span>
                                    </td>

                                    <td>
                                        <button
                                            className={
                                                customer.is_blocked
                                                    ? "customer-action unblock"
                                                    : "customer-action block"
                                            }
                                            onClick={() => handleBlock(customer)}
                                            disabled={blockLoading}
                                        >
                                            {customer.is_blocked ? "Unblock" : "Block"}
                                        </button>
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

                {/* CUSTOMER PAGINATION */}

                <div className="customer-pagination">

                    <button
                        type="button"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!previous || searchLoading}
                    >
                        Previous
                    </button>

                    <span>
                        Page {currentPage} of{" "}
                        {Math.max(1, Math.ceil(count / pageSize))}
                    </span>

                    <button
                        type="button"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!next || searchLoading}
                    >
                        Next
                    </button>

                </div>



            {/* CONFIRMATION POPUP */}
            {selectedCustomer && (

                <div className="customer-modal-overlay">

                    <div className="customer-confirm-modal">

                        <div className="customer-modal-icon">
                            !
                        </div>

                        <h3>
                            {selectedCustomer.is_blocked
                                ? "Unblock Customer?"
                                : "Block Customer?"}
                        </h3>

                        <p>
                            Are you sure you want to{" "}
                            {selectedCustomer.is_blocked
                                ? "unblock"
                                : "block"}{" "}
                            <strong>{selectedCustomer.email}</strong>?
                        </p>

                        <div className="customer-modal-actions">

                            <button
                                className="customer-cancel-btn"
                                onClick={() => setSelectedCustomer(null)}
                                disabled={blockLoading}
                            >
                                Cancel
                            </button>

                            <button
                                className="customer-confirm-btn"
                                onClick={confirmBlock}
                                disabled={blockLoading}
                            >
                                {blockLoading
                                    ? "Processing..."
                                    : selectedCustomer.is_blocked
                                        ? "Yes, Unblock"
                                        : "Yes, Block"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Customers;
