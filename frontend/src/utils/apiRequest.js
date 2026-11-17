
import { logout, tokenRefreshed } from '../../features/authSlice';
import { adminLogout,adminTokenRefreshed} from '../../features/adminfeatures/adminAuthSlice';

import { URL } from '../../redux/URL';
// Prevent multiple refresh requests at the same time
let userRefreshPromise = null;
let adminRefreshPromise = null;
// Refresh access token
const refreshToken = async (dispatch, isAdmin = false) => {
    const refreshKey = isAdmin ? 'admin_refresh' : 'refresh';
    const accessKey = isAdmin ? 'admin_access' : 'access';
    const refresh = localStorage.getItem(refreshKey);

    if (!refresh) {
        throw new Error('Refresh token not found.');
    }

    const response = await fetch(`${URL}/token/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
    });

    const data = await response.json();

    if (!response.ok || !data.access) {
        throw new Error('Session expired. Please login again.');
    }

    // Save new access token
        localStorage.setItem(accessKey, data.access);

        if (data.refresh) {
            localStorage.setItem(refreshKey, data.refresh);
        }

        if (isAdmin) {

            dispatch(adminTokenRefreshed({
                access: data.access,
                refresh: data.refresh || refresh
            }));

        } else {

            dispatch(tokenRefreshed({
                access: data.access,
                refresh: data.refresh || refresh
            }));

        }

    return data.access;
};

// Common API request function
export const apiRequest = async (endpoint, options = {}, dispatch,isAdmin = false) => {

    const sendRequest = async (accessToken) => {

        const headers = new Headers(options.headers || {});

     


        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }

        return fetch(`${URL}${endpoint}`, {
            ...options,
            headers,
        });
    };

    const accessKey = isAdmin ? 'admin_access' : 'access';
    let access = localStorage.getItem(accessKey);
    
    let response = await sendRequest(access);

    // If access token expired
    if (response.status === 401) {

        try {

            // Reuse an ongoing refresh request
            let currentRefreshPromise;

            if (isAdmin) {

                if (!adminRefreshPromise) {
                    adminRefreshPromise = refreshToken(dispatch, true)
                        .finally(() => {
                            adminRefreshPromise = null;
                        });
                }

                currentRefreshPromise = adminRefreshPromise;

            } else {

                if (!userRefreshPromise) {
                    userRefreshPromise = refreshToken(dispatch, false)
                        .finally(() => {
                            userRefreshPromise = null;
                        });
                }

                currentRefreshPromise = userRefreshPromise;

            }

            const newAccess = await currentRefreshPromise;

            // Retry original API request
            response = await sendRequest(newAccess);

        } catch (error) {

            if (isAdmin) {

            localStorage.removeItem('admin_access');
            localStorage.removeItem('admin_refresh');
            localStorage.removeItem('admin_user');

            dispatch(adminLogout());

        } else {

            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');

            dispatch(logout());

        }
            throw error;
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
};
