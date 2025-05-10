// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCFWfkAdbAH2d8DtQORgZsOJ6itqsQDdqc",
  authDomain: "pravi-fabrics.firebaseapp.com",
  projectId: "pravi-fabrics",
  storageBucket: "pravi-fabrics.firebasestorage.app",
  messagingSenderId: "986820495145",
  appId: "1:986820495145:web:d9a2716debd7b497971938",
  measurementId: "G-LR3NT6RECX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export {app};