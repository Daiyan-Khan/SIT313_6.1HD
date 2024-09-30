import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmail } from '../utils/firebase'; // Firebase authentication utility
import Input from '../Input';
import Button from '../Button';
import TwoFactorAuth from './2fa'; // Import the updated 2FA component
import '../css/Login.css'; // Import the CSS file

/**
 * Login component handles user authentication.
 * It allows users to log in using their email and password.
 */
const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [is2FA, setIs2FA] = useState(false); // State to toggle 2FA input
    const [token, setToken] = useState(''); // State to store authentication token

    const navigate = useNavigate();

    /**
     * Handle input changes for the email and password fields.
     * @param {Object} event - The event object containing the target's name and value.
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    /**
     * Handle form submission for user login.
     * @param {Object} e - The event object for the form submission.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            const authToken = await signInWithEmail(formData.email, formData.password); // Sign in and get token
            localStorage.setItem('authToken', authToken); // Store the token
            setToken(authToken); // Store the token in state for 2FA
            setIs2FA(true); // Switch to 2FA input form
            setError(''); // Clear any previous error messages
        } catch (error) {
            setError(error.message); // Set error message if login fails
        }
    };

    /**
     * Handle successful verification of 2FA code.
     */
    const handle2FASuccess = () => {
        console.log('successful');
        alert('Signed in successfully!'); // Notify user of successful login
        navigate('/'); // Redirect to the home page
    };

    return (
        <div className='login'>
            <div className='signup-link'>
                <Button className='signup-button' onClick={() => navigate('/signup')} text="Sign Up" />
            </div>
            <br />
            <h2>{is2FA ? 'Two-Factor Authentication' : 'Login'}</h2>
            {!is2FA ? (
                <form onSubmit={handleSubmit}>
                    <Input name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email} />
                    <Input name="password" type="password" placeholder="Password" onChange={handleChange} value={formData.password} />
                    <Button type="submit" text="Log In" />
                </form>
            ) : (
                <TwoFactorAuth email={formData.email} onSuccess={handle2FASuccess} />
            )}
            <Link to='/' className='home-link'>
                <Button text={'Home'} />
            </Link>
            {error && <p className='error-message'>{error}</p>}
        </div>
    );
};

export default Login;
