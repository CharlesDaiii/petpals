const getCSRFToken = async () => {
    const name = 'csrftoken';
    let cookieValue = null;
    
    // First try to get from cookie
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    
    // If no cookie found, try to get from API
    if (!cookieValue) {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/csrf/`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                cookieValue = data.csrfToken;
            }
        } catch (error) {
            console.warn('Failed to get CSRF token from API:', error);
        }
    }
    
    return cookieValue;
};

export default getCSRFToken;