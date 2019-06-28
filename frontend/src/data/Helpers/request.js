const composeHeader = (csrfToken, token) => {
	return {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		'ServiceInfoAuthorization': `token ${token}`,
		'X-CSRFToken': csrfToken,
		'X-Requested-With': 'XMLHttpRequest' // for security reasons
	}
};

export default composeHeader;