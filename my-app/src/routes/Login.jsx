import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmail } from '../utils/firebase'; // Firebase authentication utility
import Input from '../Input';
import Button from '../Button';
import '../css/Login.css'; // Import the CSS file

/**
 * Login component handles user authentication.
 * It allows users to log in using their email and password.
 */
const Login = () => {
    // State to store form data (email and password) and error messages
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    // useNavigate hook for programmatic navigation
    const navigate = useNavigate();

    /**
     * Handle input changes for the email and password fields.
     * @param {Object} event - The event object containing the target's name and value.
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        // Update the form data state
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
            // Attempt to sign in with the provided email and password
            const token = await signInWithEmail(formData.email, formData.password); // Assuming this function returns a token
            localStorage.setItem('authToken', token); // Store the token in localStorage
            localStorage.setItem('userEmail', formData.email); // Save the user's email
            navigate('/'); // Redirect to the home page after successful login
        } catch (error) {
            // Set error message if login fails
            setError(error.message); // Display the error message to the user
        }
    };

    return (
        <div className='login'>
            <div className='signup-link'>
                {/* Button to navigate to the sign-up page */}
                <Button className ='signup-button' onClick={() => navigate('/signup')} text="Sign Up" />
            </div>
            <br />
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {/* Input fields for email and password */}
                <Input name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email} />
                <Input name="password" type="password" placeholder="Password" onChange={handleChange} value={formData.password} />
                {/* Submit button for logging in */}
                <Button type="submit" text="Log In" />
                {/* Link to navigate back to home */}
                <Link to='/'>
                    <Button text={'Home'} />
                </Link>
            </form>
            {/* Display error message if present */}
            {error && <p className='error-message'>{error}</p>}
        </div>
    );
};

export default Login;
