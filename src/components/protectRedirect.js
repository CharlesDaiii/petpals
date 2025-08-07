const protectRedirect = (curPage, nextPage, params = {}) => {
    let backendRedirectUrl = `${process.env.REACT_APP_BACKEND_URL}/auth/redirect/?next=${nextPage}`;

    if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params).toString();
        backendRedirectUrl += `&${queryParams}`;
    }

    fetch(backendRedirectUrl, { method: "GET", credentials: "include" })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 401) {
            window.location.href = `/Register?next=${nextPage}`;
        } else {
            throw new Error("Unexpected response");
        }
    })
    .then(data => {
        if (data && curPage !== nextPage) {
            window.location.href = nextPage;
        }
    })
    .catch(error => console.error("Error:", error));
};

export default protectRedirect;