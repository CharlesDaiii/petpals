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

// upload photo event handler function
const handlePhotoUpload = async (event, photos, setPhotos, getCSRFToken) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    const updatedPhotos = [...photos];
    Array.from(files).forEach((file, index) => {
        formData.append("photos", file);
        
        // 找到第一个空位置放置预览图片
        const firstEmptyIndex = updatedPhotos.indexOf(null);
        if (firstEmptyIndex !== -1) {
            updatedPhotos[firstEmptyIndex] = URL.createObjectURL(file);
        }
    });

    // 立即更新状态显示预览图片
    setPhotos(updatedPhotos);

    try {
        const csrfToken = await getCSRFToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload-photos/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: 'include',
            body: formData, // upload files
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Upload successful, photo URLs:", data.photos);
            // 用服务器返回的URL替换本地预览URL
            const finalPhotos = [...photos];

            const blobIndexes = [];
            finalPhotos.forEach((photo, index) => {
                if (photo && photo.startsWith('blob:')) {
                    blobIndexes.push(index);
                }
            });

            data.photos.forEach((serverUrl, index) => {
                if (blobIndexes[index] !== undefined) {
                    finalPhotos[blobIndexes[index]] = serverUrl;
                }
            });
            setPhotos(finalPhotos);
        } else {
            console.error("Failed to upload photos.");
            setPhotos(photos);
        }
    } catch (error) {
        console.error("Photo upload error:", error);
        setPhotos(photos);
    }
};

export { handleLogout, handlePhotoUpload };