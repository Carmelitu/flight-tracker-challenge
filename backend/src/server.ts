import app from './app';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Flight Tracker API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`✈️  Flight API: http://localhost:${PORT}/api/flights`);
});