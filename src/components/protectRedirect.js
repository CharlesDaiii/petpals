const protectRedirect = (curPage, nextPage, params = {}, redirect = true) => {
    console.log("Current Page:", curPage);
    console.log("Next Page:", nextPage);
    let backendRedirectUrl = `${process.env.REACT_APP_BACKEND}/auth/redirect/?next=${nextPage}`;
    console.log(backendRedirectUrl);

    if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params).toString();
        backendRedirectUrl += `&${queryParams}`;
    }

    return fetch(backendRedirectUrl, { method: "GET", credentials: "include" })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 401) {
            if (redirect) {
                window.location.href = `/Register?next=${nextPage}`;
            }
            return { "isAuthenticated": false };
        } else {
            throw new Error("Unexpected response");
        }
    })
    .then(data => {
        console.log("Data:", data);
        if (data.isAuthenticated && curPage !== nextPage) {
            window.location.href = nextPage;
        }
        return data;
    })
    .catch(error => {
        console.error("Error:", error);
        return { isAuthenticated: false };
    });

};

export default protectRedirect;