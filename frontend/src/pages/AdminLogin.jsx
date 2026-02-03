import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const AdminLogin = () => {
    const handleLogin = () => {
        // Redirect to Backend Auth
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Portal</h2>
                <p className="text-gray-500 mb-8">Sign in to manage events.</p>

                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <FaGoogle className="text-red-500" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;
