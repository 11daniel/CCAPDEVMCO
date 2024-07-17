document.addEventListener('DOMContentLoaded', () => {
    const profilePicForm = document.getElementById('profilePicForm');
    const bioForm = document.getElementById('bioForm');
    const usernameForm = document.getElementById('usernameForm');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const confirmChangesBtn = document.getElementById('confirmChangesBtn');

    changePhotoBtn.addEventListener('click', () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', () => {
        if (profilePictureInput.files.length > 0) {
            confirmChangesBtn.style.display = 'block';
        }
    });

    profilePicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(profilePicForm);
        fetch('/updateProfilePicture', {
            method: 'POST',
            body: formData,
        }).then(response => response.json()).then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Failed to update profile picture');
            }
        });
    });

    bioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetch('/updateBio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bio: bioForm.bio.value }),
        }).then(response => response.json()).then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Failed to update bio');
            }
        });
    });

    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetch('/updateUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usernameForm.username.value }),
        }).then(response => response.json()).then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Failed to update username');
            }
        });
    });

    confirmChangesBtn.addEventListener('click', () => {
        const formData = new FormData();
        if (profilePictureInput.files.length > 0) {
            formData.append('profilePicture', profilePictureInput.files[0]);
        }

        formData.append('bio', bioForm.bio.value);
        formData.append('username', usernameForm.username.value);

        fetch('/updateProfile', {
            method: 'POST',
            body: formData,
        }).then(response => response.json()).then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Failed to update profile');
            }
        });
    });
});
