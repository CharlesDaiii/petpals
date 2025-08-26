const handleLogout = async (isLogin, setIsLogin, setUsername, getCSRFToken) => {
    if (!isLogin) {
        window.location.href = "/Register";
    } else {
        try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logout/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": await getCSRFToken(),
            },
            credentials: "include",
        });
        
        if (response.ok) {
            setIsLogin(false);
            setUsername("");
            if (typeof(Storage) !== "undefined") {
            sessionStorage.clear();
            localStorage.clear();
            }
        } else {
            console.error('Logout failed:', response.status, response.statusText);
        }
        } catch (error) {
        console.error('Logout error:', error);
        }
    }
};

const handlePhotoUpload = async (event, photos, setPhotos, getCSRFToken) => {
    const files = event.target.files;
    if (!files.length) return;

    // 创建FormData
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append("photos", file);
    });

    try {
        // 显示上传中的状态（可选）
        console.log(`Uploading ${files.length} photo(s) to Cloudinary...`);
        
        const csrfToken = await getCSRFToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload-photos/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: 'include',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Upload successful, Cloudinary URLs:", data.photos);
            
            // 直接将Cloudinary URLs添加到photos数组中
            const updatedPhotos = [...photos];
            
            data.photos.forEach(cloudinaryUrl => {
                const firstEmptyIndex = updatedPhotos.findIndex(photo => photo === null);
                if (firstEmptyIndex !== -1) {
                    updatedPhotos[firstEmptyIndex] = cloudinaryUrl;
                }
            });
            
            setPhotos(updatedPhotos);
            console.log("Photos updated with Cloudinary URLs:", updatedPhotos);
            
        } else {
            const errorData = await response.json();
            console.error("Upload failed:", errorData);
            alert(`Upload failed: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("Photo upload error:", error);
        alert('Error uploading photos. Please check your connection and try again.');
    }
    
    event.target.value = '';
};

export { handleLogout, handlePhotoUpload };