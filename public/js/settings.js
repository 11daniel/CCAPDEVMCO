document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('profileBtn');
    const postsBtn = document.getElementById('postsBtn');
    const commentsBtn = document.getElementById('commentsBtn');
    
    const profileContent = document.getElementById('profileContent');
    const postsContent = document.getElementById('postsContent');
    const commentsContent = document.getElementById('commentsContent');

    function showContent(content) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        content.classList.add('active');
    }

    function activateButton(button) {
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.classList.remove('active');
        });
        button.classList.add('active');
    }

    profileBtn.addEventListener('click', () => {
        showContent(profileContent);
        activateButton(profileBtn);
    });

    postsBtn.addEventListener('click', () => {
        showContent(postsContent);
        activateButton(postsBtn);
    });

    commentsBtn.addEventListener('click', () => {
        showContent(commentsContent);
        activateButton(commentsBtn);
    });
});
