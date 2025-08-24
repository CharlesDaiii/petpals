const ProfileStats = ({ followers, following, showEditProfile }) => {
    const handleNavigate = (path) => {
      window.location.href = path;
    };
  
    // show Edit Profile is true, show the edit profile button and divider
    return (
      <div className="shots-followers">
        {showEditProfile && (
          <>
            <button 
              className="edit-profile" 
              onClick={() => handleNavigate('/ProfileSignUp?from=MyProfile')}
            >
              Edit Profile
            </button>
            <div className="divider"></div>
          </>
        )}
        {(
          <>
            <div 
              className="followers-section" 
              onClick={() => handleNavigate('/Friends')}
            >
              <div className="count">{followers.length}</div>
              <div className="label">Followers</div>
            </div>

            <div className="divider"></div>
            
            <div 
              className="following-section" 
              onClick={() => handleNavigate('/Friends')}
            >
              <div className="count">{following.length}</div>
              <div className="label">Following</div>
            </div>
          </>
        )}
      </div>
    );
  };

  export default ProfileStats;