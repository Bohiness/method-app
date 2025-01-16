// app.config.js

export default {
  expo: {
    extra: {
      appName: process.env.APP_NAME || 'Method do',
      logstashHost: process.env.LOGSTASH_HOST || 'localhost',
      logstashPort: process.env.LOGSTASH_PORT || 5000,
      logstashEnabled: process.env.LOGSTASH_ENABLED === 'true',
    },
  },
};
