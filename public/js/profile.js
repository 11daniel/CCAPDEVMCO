const user = {
    name: 'Josh Laxa',
    profileImage: 'JoshProfile.jpg',
    occupation: 'Software Developer',
    joinedDate: 'January 2020'
};

const posts = [
    {
        date: '2024-07-01',
        title: 'My first post',
        content: 'This is the content of my first post.',
        upvotes: 10,
        downvotes: 2,
        comments: 5
    },
    {
        date: '2024-07-02',
        title: 'Second post',
        content: 'This is some more content.',
        upvotes: 20,
        downvotes: 1,
        comments: 8
    }
];

// Function to render the profile page using Handlebars.js
function renderProfile() {
    // Compile the template
    const source = document.getElementById('profile-template').innerHTML;
    const template = Handlebars.compile(source);

    // Combine user data and posts
    const context = { user, posts };

    // Generate the HTML
    const html = template(context);

    // Insert the generated HTML into the DOM
    document.getElementById('profile-content').innerHTML = html;
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    renderProfile();
});
