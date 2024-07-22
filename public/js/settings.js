document.addEventListener('DOMContentLoaded', () => {
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const confirmChangesBtn = document.getElementById('confirmChangesBtn');
    const bioForm = document.getElementById('bioForm');
    const usernameForm = document.getElementById('usernameForm');
    const profilePic = document.querySelector('.profile-pic img');

    changePhotoBtn.addEventListener('click', () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', () => {
        if (profilePictureInput.files.length > 0) {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                profilePic.src = e.target.result;
            };
            fileReader.readAsDataURL(profilePictureInput.files[0]);
            confirmChangesBtn.style.display = 'block';
        }
    });

    confirmChangesBtn.addEventListener('click', (e) => {
        e.preventDefault();

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
                alert('Failed to update profile: ' + (data.message || 'Unknown error'));
            }
        }).catch(error => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + error.message);
        });
    });
});
