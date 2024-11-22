// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SignupPage from './SignupPage';
import Register from './Register';
import Transition from './Transition';
import Matching from './Matching';
<<<<<<< HEAD
=======
import ProfileSignUp from './ProfileSignUp';
import AddPhoto from './AddPhoto';
import MyProfile from './MyProfile';
import OtherProfile from './OtherProfile';
>>>>>>> 946c759 (putting 4 pages(profilesignup, photos, characters, redflag) in one url)

function App() {
    const [petName, setPetName] = useState("");

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route 
                        path="/ProfileSignUp" 
                        element={<ProfileSignUp setPetName={setPetName} />} 
                    />
                    <Route path="/Register" element={<Register />} />
                    <Route 
                        path="/AddPhoto" 
                        element={<AddPhoto petName={petName} />} 
                    />
                    <Route path="/SignupPage" element={<SignupPage />} />
                    <Route path="/Transition" element={<Transition />} />
                    <Route path="/Matching" element={<Matching />} />
<<<<<<< HEAD
=======
                    <Route path="/MyProfile" element={<MyProfile />} />
                    <Route path="/OtherProfile" element={<OtherProfile />} />
>>>>>>> 946c759 (putting 4 pages(profilesignup, photos, characters, redflag) in one url)
                </Routes>
            </div>
        </Router>
    );
}

export default App;