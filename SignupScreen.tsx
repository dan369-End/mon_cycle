import React from 'react';
import { GoogleLogin } from 'react-google-login';

const SignupScreen = () => {
    const responseGoogle = (response) => {
        console.log(response);
    };

    return (
        <div>
            <h1>Signup Screen</h1>
            <GoogleLogin
                clientId="YOUR_GOOGLE_CLIENT_ID"
                buttonText="Sign in with Google"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
            />
        </div>
    );
};

export default SignupScreen;