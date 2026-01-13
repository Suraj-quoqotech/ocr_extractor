// notificationHelper.js
// Helper functions for browser notifications

export const showNotification = (title, body, icon = '📄') => {
  // Check if notifications are enabled in localStorage
  const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
  
  if (!notificationsEnabled) {
    return;
  }

  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  // Check notification permission
  if (Notification.permission === 'granted') {
    // Create notification
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico', // You can replace with your app icon
      badge: '/favicon.ico',
      tag: 'ocr-notification',
      requireInteraction: false,
      silent: false
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  } else if (Notification.permission !== 'denied') {
    // Request permission
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification(title, body, icon);
      }
    });
  }
};

export const notifyUploadSuccess = (filename) => {
  showNotification(
    '✅ Processing Complete!',
    `"${filename}" has been successfully processed and is ready for download.`,
    '✅'
  );
};

export const notifyUploadError = (filename) => {
  showNotification(
    '❌ Processing Failed',
    `Failed to process "${filename}". Please try again or contact support.`,
    '❌'
  );
};

export const notifyBulkComplete = (successCount, failCount) => {
  const total = successCount + failCount;
  showNotification(
    '📊 Bulk Processing Complete',
    `Processed ${total} files: ${successCount} successful, ${failCount} failed.`,
    '📊'
  );
};