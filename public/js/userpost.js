$(document).ready(function () {
    // Initial posts
    const initialPosts = [
      {
        user: 'Joshy',
        avatar: 'user-avatar.jpg',
        title: 'Help Needed with CSS',
        content: 'Whats the best design for this',
        timestamp: '2 hours ago',
        comments: ['Great post!', 'Very helpful, thanks!'],
        upvotes: 10,
        downvotes: 2,
        voted: null // null: no vote, 'up': upvoted, 'down': downvoted
      },
      {
        user: 'Carly',
        avatar: 'user-avatar.jpg',
        title: 'How to Use JavaScript',
        content: 'I cant seem to make this work',
        timestamp: '2 days ago',
        comments: [],
        upvotes: 5,
        downvotes: 1,
        voted: null
      },
      {
        user: 'Danny',
        avatar: 'user-avatar.jpg',
        title: 'Can someone guide me on my CCAPDEV',
        content: 'I have been absent for 3 sessions and I need to keep up with the lessons',
        timestamp: '5 weeks ago',
        comments: [],
        upvotes: 3,
        downvotes: 0,
        voted: null
      }
    ];
  
    // Function to render posts
    function renderPosts(posts) {
      const postList = $('#post-list');
      postList.empty();
      posts.forEach((post, index) => {
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
              <div class="voting">
                <button class="upvote-button">${post.voted === 'up' ? 'Upvoted' : 'Upvote'}</button>
                <span class="upvote-counter">${post.upvotes}</span> <!-- Upvote counter element -->
                <button class="downvote-button">${post.voted === 'down' ? 'Downvoted' : 'Downvote'}</button>
                <span class="downvote-counter">${post.downvotes}</span> <!-- Downvote counter element -->
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
        comments: [],
        upvotes: 0,
        downvotes: 0,
        voted: null
      };
      initialPosts.push(newPost);
      renderPosts(initialPosts);
    }
  
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
    renderPosts(initialPosts);
  
    // Event listener for new post submission
    $('#new-post-form').on('submit', handleNewPost);
  
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
  });
  