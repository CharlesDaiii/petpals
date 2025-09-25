import React from "react";
import "../../styles/MyProfile.css";
import useUserData from "./useUserData";
import usePetData from "./usePetData";
import useFriendsData from "./useFriendsData";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import Header from "../Header";
import ProfilePhoto from "./ProfilePhoto";
import PetInfo from "./PetInfo";
import ProfileStats from "./ProfileStats";

const OtherProfile = () => {
  const { isLogin, setIsLogin, username, setUsername } = useUserData();
  const { petData, error } = usePetData();
  const { followers, following } = useFriendsData();

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!petData) {
    return <LoadingState />;
  }

  return (
    <div className="profile">
      <Header 
        username={username}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        setUsername={setUsername}
      />
      
      <div className="text-wrapper-6">{petData.name}'s Profile</div>
      
      <ProfilePhoto 
        photos={petData.photos} 
        name={petData.name} 
      />
      
      <PetInfo petData={petData} />
      
      <ProfileStats 
        followers={followers} 
        following={following} 
      />
    </div>
  );
};

export default OtherProfile;