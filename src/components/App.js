import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Register from './Register';
import Transition from './Transition';
import Matching from './Matching';
import ProfileSignUp from './ProfileSignUp';
import MyProfile from './Profile/MyProfile';
import OtherProfile from './Profile/OtherProfile';
import Friends from './Friends';
import ChatLayout from './ChatLayout';
import Chat from './Chat';
function App() {
    const [petName, setPetName] = useState("");

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/ProfileSignUp" 
                        element={<ProfileSignUp setPetName={setPetName} />} 
                    />
                    <Route path="/Register" element={<Register />} />
                    <Route path="/Transition" element={<Transition />} />
                    <Route path="/Matching" element={<Matching />} />
                    <Route path="/MyProfile" element={<MyProfile />} />
                    <Route path="/OtherProfile/:id" element={<OtherProfile />} />
                    <Route path="/Friends" element={<Friends />} />
                    <Route path="/chat" element={<ChatLayout />}>
                        <Route index element={<div style={{padding:24,color:"#888"}}>Select a chat</div>} />
                        <Route path=":id" element={<Chat />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;