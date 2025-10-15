// Assign the `subscriber` role automatically on signup/accept-invite
// Netlify triggers this function on Identity signup events.

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const user = payload && (payload.user || payload);

    // You can enforce domain checks or paid status here if needed
    // For now, everyone who signs up gets the subscriber role

    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          roles: ['subscriber']
        }
      })
    };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({}) };
  }
};

