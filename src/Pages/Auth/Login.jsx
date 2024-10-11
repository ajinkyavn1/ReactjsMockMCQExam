import GoogleButton from 'react-google-button';
import { useFirebase } from '../../Context/FirebaseContext';

export default function LoginPage() {
    const firebase = useFirebase();
    console.log(firebase);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: '400px' }}>
                <div className="card-body text-center">
                    <h5 className="card-title mb-4">Welcome to Our App</h5>
                    {firebase.User ? (
                        <p className="card-text">Hello, {firebase.User.displayName}!</p>
                    ) : (
                        <p className="card-text">Please log in to continue.</p>
                    )}
                    <div className="p-1">
                        <GoogleButton
                            style={{ width: '100%' }}
                            onClick={() => {
                                firebase.signinWithGoogle();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
