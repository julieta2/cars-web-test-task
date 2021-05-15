import axios from 'axios';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    timeout: 10000,
});
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;

axiosInstance.interceptors.response.use((response) => response, (error) => {
    if (
        error.response
        && error.response.status === 401
        && (
            error.response.data.message === 'Token has expired'
            || error.response.data.message === 'Unable to authenticate with invalid token.'
            || error.response.data.message === 'Token Signature could not be verified.'
        )
    ) {
        localStorage.removeItem('token');
        this.$router.push('/login');
    }
    return error;
});

export default axiosInstance;