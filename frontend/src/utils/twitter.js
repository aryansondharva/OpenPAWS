// Twitter API integration for direct posting
let bearerToken = null;
let isInitialized = false;

// Initialize Twitter API with OAuth or Bearer Token
export function initializeTwitterAPI(token) {
  bearerToken = token;
  isInitialized = true;
}

// Post a single tweet
export async function postTweet(text) {
  if (!isInitialized) {
    throw new Error('Twitter API not initialized. Call initializeTwitterAPI() first.');
  }

  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to post tweet');
    }

    const data = await response.json();
    return {
      success: true,
      tweetId: data.data.id,
      text: data.data.text,
      url: `https://x.com/aryansondharva/status/${data.data.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Post a thread (multiple tweets as a thread)
export async function postThread(tweets) {
  if (!isInitialized) {
    throw new Error('Twitter API not initialized. Call initializeTwitterAPI() first.');
  }

  const results = [];
  let lastTweetId = null;

  for (let i = 0; i < tweets.length; i++) {
    const tweetText = tweets[i];
    
    // Add thread indicator for subsequent tweets
    if (i > 0 && lastTweetId) {
      const replyText = `${tweetText}\n\n(${i + 1}/${tweets.length})`;
      const result = await postReply(replyText, lastTweetId);
      results.push(result);
      if (result.success) {
        lastTweetId = result.tweetId;
      } else {
        // If one fails, stop the thread
        results.push(...tweets.slice(i + 1).map(tweet => ({
          success: false,
          error: 'Thread stopped due to previous error'
        })));
        break;
      }
    } else {
      const result = await postTweet(tweetText);
      results.push(result);
      if (result.success) {
        lastTweetId = result.tweetId;
      }
    }

    // Add delay between tweets to avoid rate limiting
    if (i < tweets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

// Post a reply to an existing tweet
export async function postReply(text, replyToTweetId) {
  if (!isInitialized) {
    throw new Error('Twitter API not initialized. Call initializeTwitterAPI() first.');
  }

  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        reply: {
          in_reply_to_tweet_id: replyToTweetId
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to post reply');
    }

    const data = await response.json();
    return {
      success: true,
      tweetId: data.data.id,
      text: data.data.text,
      url: `https://x.com/aryansondharva/status/${data.data.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Check if API is ready
export function isTwitterReady() {
  return isInitialized && bearerToken;
}

// Quick post to @aryansondharva with one click
export async function quickPostToAryan(content) {
  try {
    initializeTwitterAPI(bearerToken);
    const result = await postTweet(content);
    
    if (result.success) {
      // Auto-open the posted tweet in new tab
      window.open(result.url, '_blank');
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
