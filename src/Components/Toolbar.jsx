import React from 'react';
import { signOut } from 'firebase/auth';
import { useFirebase } from '../Context/FirebaseContext';
import Timer from './Timmer';

export default function Toolbar({ User, autoSubmit, isTestStarted }) {
  const firebase = useFirebase();

  const handleSignOut = () => {
    signOut(firebase.firebaseauth)
      .then(() => {
        console.log('User signed out');
      })
      .catch((error) => {
        console.error('Sign out error', error);
      });
  };
  return (
    <nav className="navbar navbar-expand-lg shadow-sm p-3 mb-4" style={{ backgroundColor: '#f5f7fa' }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src={User.photoURL}
            alt="Profile"
            className="rounded-circle"
            style={{
              width: '50px',
              height: '50px',
              marginRight: '15px',
              border: '2px solid #ff7e5f',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          />
          <span className="navbar-text fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
            {User.displayName}
          </span>
        </div>

       

        <button
          className="btn btn-danger rounded-pill shadow-sm"
          style={{ padding: '10px 20px', fontSize: '1rem' }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
