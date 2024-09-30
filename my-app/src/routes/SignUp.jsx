import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpWithEmail } from '../utils/firebase';
import Input from '../Input';
import Button from '../Button';
import '../css/SignUp.css';

/**
 * @component Signup
 * 
 * This component renders a signup form for creating a new user account. 
 * It handles user input, validates the password confirmation, 
 * and manages the signup process with Firebase.
 */
const Signup = () => {
    // State to manage form data and error messages
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook to programmatically navigate

    /**
     * Handles changes in the input fields.
     * @param {Event} event - The input change event
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    /**
     * Handles form submission and user signup.
     * Validates that password and confirm password match.
     * @param {Event} e - The form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); // Set error if passwords don't match
            return;
        }
        try {
            // Attempt to sign up the user with the provided email and password
            await signUpWithEmail(formData.name, formData.lastName, formData.email, formData.password);
            navigate('/login'); // Redirect to the login page on success
        } catch (error) {
            setError(error.message); // Set error message if signup fails
        }
    };

    return (
        <div className='signup'>
            <h2>Create a Dev@Deakin Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <Input id="name" name="name" type="text" placeholder="Name" onChange={handleChange} value={formData.name} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <Input id="email" name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <Input id="password" name="password" type="password" placeholder="Password" onChange={handleChange} value={formData.password} />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} />
                </div>
                <Button type="submit" text="Create" />
                <Link to="/login">
                    <button className="login-button">Login</button>
                </Link>
                <Link to='/'>
                    <Button text={'Home'} />
                </Link>
            </form>
            {error && <p>{error}</p>} {/* Display error message if any */}
        </div>
    );
};

export default Signup;
