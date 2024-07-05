$(document).ready(function() {
  // Initial posts
  const initialPosts = [
    {
      user: 'JohnDoe',
      avatar: 'user-avatar.jpg',
      title: 'Help Needed with CSS Flexbox',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl ac ultrices aliquam, nunc nunc lacinia nunc, id aliquet nunc nunc vitae nunc. Sed euismod, nisl ac ultrices aliquam, nunc nunc lacinia nunc, id aliquet nunc nunc vitae nunc.',
      timestamp: '2 hours ago',
      comments: ['Great post!', 'Very helpful, thanks!']
    },
    {
      user: 'BobRoss',
      avatar: 'user-avatar.jpg',
      title: 'How to Use JavaScript Promises',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl ac ultrices aliquam, nunc nunc lacinia nunc, id aliquet nunc nunc vitae nunc. Sed euismod, nisl ac ultrices aliquam, nunc nunc lacinia nunc, id aliquet nunc nunc vitae nunc.',
      timestamp: '2 days ago',
      comments: []
    },
    {
      user: 'JaneSmith',
      avatar: 'user-avatar.jpg',
      title: 'Best Practices for Responsive Web Design',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl ac ultrices aliquam, nunc nunc lacinia nunc, id aliquet nunc nunc vitae nunc. Sed euismod, nisl ac ultrices aliquam, nunc nunc lacinia nunc, id aliquet nunc nunc vitae nunc.',
      timestamp: '5 weeks ago',
      comments: []
    }
  ];

  // Function to render posts
  function renderPosts() {
    const postList = $('#post-list');
    postList.empty();
    initialPosts.forEach((post, index) => {
      const postElement = `
        <li class="post" data-index="${index}">
          <div class="user">
            <img src="${post.avatar}" alt="User Avatar">
            <span>${post.user}</span>
          </div>
          <div class="content">
            <h3><a target='_blank'>${post.title}</a></h3>
            <p>Posted by ${post.user} | ${post.timestamp}</p>
            <p>${post.content}</p>
            <div class="comment-section">
              <ul class="comment-list">
                ${post.comments.map(comment => `<li class="comment">${comment}</li>`).join('')}
              </ul>
              <form class="comment-form">
                <textarea name="commentText" placeholder="Add a comment..."></textarea>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        </li>
      `;
      postList.append(postElement);
    });
  }

  // Function to handle new post submission
  function handleNewPost(event) {
    event.preventDefault();
    const newPost = {
      user: 'NewUser',
      avatar: 'user-avatar.jpg',
      title: $('#new-post-title').val(),
      content: $('#new-post-content').val(),
      timestamp: 'Just now',
      comments: []
    };
    initialPosts.push(newPost);
    renderPosts();
  }

  // Function to handle new comment submission
  function handleNewComment(event) {
    event.preventDefault();
    const commentText = $(this).find('textarea[name="commentText"]').val();
    const postIndex = $(this).closest('.post').data('index');
    if (commentText) {
      initialPosts[postIndex].comments.push(commentText);
      renderPosts();
    }
  }

  // Initial render of posts
  renderPosts();

  // Event listener for new post submission
  $('#new-post-form').on('submit', handleNewPost);

  // Event listener for new comment submission
  $('#post-list').on('submit', '.comment-form', handleNewComment);
});
