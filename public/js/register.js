document.getElementById('register-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.email === email)) {
        alert('Email already registered.');
        return;
    }

    if (users.some(user => user.username === username)) {
        alert('Username already taken.');
        return;
    }

    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful!');
});
