$(document).ready(function () {
  // Function to render posts
  function renderPosts(posts) {
      const postList = $('#post-list');
      postList.empty();
      posts.forEach(post => {
          const postElement = createPostElement(post);
          postList.append(postElement);
      });
  }

  // Function to create post element
  function createPostElement(post) {
      return `
          <li class="post" data-id="${post._id}">
              <div class="user">
                  <img src="/path/to/avatar.jpg" alt="User Avatar"> <!-- Adjust the avatar path -->
                  <span>${post.user}</span>
              </div>
              <div class="content">
                  <h3><a href="#">${post.title}</a></h3>
                  <p>Posted by ${post.user} | ${new Date(post.createdAt).toLocaleString()}</p>
                  <p>${post.content}</p>
                  <div class="voting">
                      <button class="upvote-button">Upvote</button>
                      <span class="upvote-counter">${post.upvotes}</span>
                      <button class="downvote-button">Downvote</button>
                      <span class="downvote-counter">${post.downvotes}</span>
                  </div>
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
  }

  // Function to handle new post submission
  function handleNewPost(event) {
      event.preventDefault();
      const title = $('#new-post-title').val();
      const content = $('#new-post-content').val();

      $.ajax({
          type: 'POST',
          url: '/createPost',
          data: { title, content },
          success: function(newPost) {
              $('#new-post-title').val('');
              $('#new-post-content').val('');
              const newPostElement = createPostElement(newPost);
              $('#post-list').prepend(newPostElement); // Prepend to the list
          },
          error: function(err) {
              console.log('Error creating post:', err);
          }
      });
  }

  $('#new-post-form').on('submit', handleNewPost);

  // Function to handle new comment submission
  function handleNewComment(event) {
      event.preventDefault();
      const commentText = $(this).find('textarea[name="commentText"]').val();
      const postIndex = $(this).closest('.post').data('index');
      if (commentText) {
          initialPosts[postIndex].comments.push(commentText);
          renderPosts(initialPosts);
      }
  }

  // Initial render of posts
  $.get('/api/posts', function(data) {
      renderPosts(data.posts);
  });

  // Event listener for new comment submission
  $('#post-list').on('submit', '.comment-form', handleNewComment);

  // Function to handle upvote
  function handleUpvote(event) {
      event.preventDefault();
      const postIndex = $(this).closest('.post').data('index');
      const post = initialPosts[postIndex];

      if (post.voted === 'up') {
          post.upvotes--;
          post.voted = null;
      } else {
          if (post.voted === 'down') {
              post.downvotes--;
          }
          post.upvotes++;
          post.voted = 'up';
      }

      renderPosts(initialPosts);
  }

  // Function to handle downvote
  function handleDownvote(event) {
      event.preventDefault();
      const postIndex = $(this).closest('.post').data('index');
      const post = initialPosts[postIndex];

      if (post.voted === 'down') {
          post.downvotes--;
          post.voted = null;
      } else {
          if (post.voted === 'up') {
              post.upvotes--;
          }
          post.downvotes++;
          post.voted = 'down';
      }

      renderPosts(initialPosts);
  }

  // Event listener for upvote button
  $('#post-list').on('click', '.upvote-button', handleUpvote);

  // Event listener for downvote button
  $('#post-list').on('click', '.downvote-button', handleDownvote);

  // Show back-to-top button when scrolled down
  $(window).scroll(function() {
      if ($(this).scrollTop() > 300) {
          $('#back-to-top').fadeIn();
      } else {
          $('#back-to-top').fadeOut();
      }
  });

  // Scroll back to top when button is clicked
  $('#back-to-top').click(function() {
      $('html, body').animate({scrollTop: 0}, 600);
      return false;
  });

  // Event listeners for filter buttons
  $('#latest-posts').click(function() {
      const latestPosts = initialPosts.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      renderPosts(latestPosts);
  });

  $('#popular-posts').click(function() {
      const popularPosts = initialPosts.slice().sort((a, b) => b.upvotes - a.upvotes);
      renderPosts(popularPosts);
  });

  // Function to format timestamp
  function formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const timeDiff = now - date;

      const seconds = Math.floor(timeDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);

      if (seconds < 60) {
          return `${seconds} seconds ago`;
      } else if (minutes < 60) {
          return `${minutes} minutes ago`;
      } else if (hours < 24) {
          return `${hours} hours ago`;
      } else if (days < 7) {
          return `${days} days ago`;
      } else {
          return `${weeks} weeks ago`;
      }
  }
});
