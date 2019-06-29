const composeHeader = (csrfToken = null, token = null, cookie = null) => {
	return {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest', // for security reasons
		...(csrfToken && {'X-CSRFToken': csrfToken}),
		...(token && {'ServiceInfoAuthorization': `token ${token}`}),
		...(cookie && {'Cookie': cookie}),
	}
};

export default composeHeader;
