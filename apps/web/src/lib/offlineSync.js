
/**
 * Utility for queuing API requests when offline and syncing them when online.
 */

const QUEUE_KEY = 'tms_offline_queue';

export const queueRequest = (request) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ 
      ...request, 
      id: crypto.randomUUID(),
      timestamp: Date.now() 
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Failed to queue request:', error);
    return false;
  }
};

export const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const processQueue = async (apiClient) => {
  const queue = getQueue();
  if (queue.length === 0) return true;

  let successCount = 0;
  const failedQueue = [];

  for (const req of queue) {
    try {
      const res = await apiClient.fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : undefined
      });
      
      if (res.ok) {
        successCount++;
      } else {
        // If it's a 4xx error (bad request), don't retry it later
        if (res.status >= 400 && res.status < 500) {
          console.error('Queued request failed permanently:', req.url, res.status);
        } else {
          failedQueue.push(req);
        }
      }
    } catch (err) {
      // Network error, keep in queue
      failedQueue.push(req);
    }
  }

  if (failedQueue.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failedQueue));
    return false;
  } else {
    clearQueue();
    return true;
  }
};
