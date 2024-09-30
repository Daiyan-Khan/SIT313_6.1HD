// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore"; // Updated imports for Firestore
import { getStorage } from 'firebase/storage';
import bcrypt from "bcryptjs";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUJEW3rjqFI5p5y2lbwThqeNOq3BjM40s",
    authDomain: "deakin-75d56.firebaseapp.com",
    projectId: "deakin-75d56",
    storageBucket: "deakin-75d56.appspot.com",
    messagingSenderId: "357773857162",
    appId: "1:357773857162:web:11c5e8bcb03d225afb7873",
    measurementId: "G-M2HG108VK3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore with the modular SDK
const storage = getStorage(app);

export { db, storage };

// Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
});

// Function for Google Sign-In Popup
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);

// Function to sign up with email and password
export const signUpWithEmail = async (name, lastName, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            name,
            lastName,
            email
        });

        console.log("User signed up and saved to Firestore:", user);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.error("Email already in use");
            throw new Error("Email address is already in use. Please use a different email address.");
        } else {
            console.error("Error signing up:", error.message);
            throw new Error(error.message);
        }
    }
};

export const checkUserInFirestore = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document!");
        return null;
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        switch (error.code) {
            case 'auth/wrong-password':
                throw new Error('Incorrect password. Please try again.');
            case 'auth/user-not-found':
                throw new Error('No account found with this email.');
            case 'auth/invalid-email':
                throw new Error('Invalid email format.');
            default:
                throw new Error(error.message);
        }
    }
};

// Example functions for Firebase
export const getVideoData = async () => {
    const querySnapshot = await getDocs(collection(db, 'videos')); // Use Firestore's collection and getDocs
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveVideoData = async (videoURL) => {
    await addDoc(collection(db, 'videos'), { // Use Firestore's addDoc function
        url: videoURL,
        title: 'Your Video Title', // You might want to customize this
        views: 0, // Initial view count
        rating: 0, // Initial rating
        upvotes: 0, // Initial upvote count
        downvotes: 0 // Initial downvote count
    });
};

// Function to get video data by ID
export const getVideoDataById = async (videoId) => {
    const videoRef = doc(db, "videos", videoId);
    const docSnap = await getDoc(videoRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        console.log("No such video!");
        return null;
    }
};

// Function to update video upvotes or downvotes
export const updateVideoVotes = async (videoId, type) => {
    const videoRef = doc(db, "videos", videoId);
    const docSnap = await getDoc(videoRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const newVotes = {
            upvotes: type === 'upvote' ? (data.upvotes || 0) + 1 : data.upvotes,
            downvotes: type === 'downvote' ? (data.downvotes || 0) + 1 : data.downvotes,
        };

        // Update the document with new vote counts
        await updateDoc(videoRef, newVotes);
        return { ...data, ...newVotes }; // Return the updated video data
    } else {
        console.log("No such video to update!");
        return null;
    }
};

// Function to update video views
export const updateVideoViews = async (videoId) => {
    const videoRef = doc(db, "videos", videoId); // Get the document reference
    await updateDoc(videoRef, {
        views: increment(1) // Increment the view count by 1
    });
};

// utils/firebase.js

// Function to increment video views
export const incrementVideoViews = async (videoId) => {
    const videoRef = doc(db, "videos", videoId); // Use the modular doc function
    await updateDoc(videoRef, {
        views: increment(1) // Use the imported increment function
    });
};
