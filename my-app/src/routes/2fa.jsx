import React, { useState } from 'react';
import axios from 'axios';

/**
 * TwoFactorAuth component handles the verification of the 2FA code.
 */
const TwoFactorAuth = ({ email, onSuccess }) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false); // To track if the code has been sent

    /**
     * Handle input changes for the 2FA code field.
     * @param {Object} event - The event object containing the target's value.
     */
    const handleTwoFactorChange = (event) => {
        setToken(event.target.value); // Update the 2FA code state
    };

    /**
     * Function to send the 2FA code to the user's email.
     */
    const sendTwoFactorCode = async () => {
        try {
            // Send a request to the backend to send the 2FA code
            await axios.post('http://localhost:5000/send-2fa-code', { email }); 
            setIsCodeSent(true); // Mark code as sent
            setError(''); // Clear any previous error messages
        } catch (err) {
            setError('Failed to send 2FA code.'); // Handle send error
        }
    };

    const handleVerify = async (e) => {
        console.log('triggered verification');
        e.preventDefault(); 
        try {
            const response = await axios.post('http://localhost:5000/verify-2fa-code', { email, token });
            console.log(response);
            
            // Handle plain text response
            if (response.data.success) {
                console.log('success');
                onSuccess();
            } else {
                setError('Invalid 2FA code.');
            }
        } catch (error) {
            console.log('error');
            setError(error.message || 'Verification failed.');
        }
    };
    

    return (
        <div>
            {!isCodeSent ? (
                <button onClick={sendTwoFactorCode}>Send 2FA Code</button> // Button to trigger sending the code
            ) : (
                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        value={token}
                        onChange={handleTwoFactorChange}
                        placeholder="Enter 2FA Code"
                    />
                    <button type="submit">Verify</button>
                </form>
            )}
            {error && <p className='error-message'>{error}</p>} {/* Display error message if present */}
        </div>
    );
};

export default TwoFactorAuth;
