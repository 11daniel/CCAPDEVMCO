const sampleUsers = [
    { username: 'user1', email: 'user1@example.com', password: 'password123' },
    { username: 'user2', email: 'user2@example.com', password: 'password456' },
    { username: 'user3', email: 'user3@example.com', password: 'password789' }
];


if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(sampleUsers));
}


document.getElementById('toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        this.innerHTML = '<i class="fas fa-eye"></i>';
    }
});


