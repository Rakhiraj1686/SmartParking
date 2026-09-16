// Verifies the X-IOT-API-KEY header sent by the Arduino / ESP8266 / ESP32
// gateway. This is a shared-secret check, not a JWT — the device doesn't
// log in as a user.
function verifyIotKey(req, res, next) {
  const key = req.headers['x-iot-api-key'];

  if (!process.env.IOT_API_KEY) {
    console.warn('[iot] IOT_API_KEY is not set in .env — rejecting all IoT requests');
    return res.status(500).json({ success: false, message: 'IoT API key not configured on server' });
  }

  if (!key || key !== process.env.IOT_API_KEY) {
    return res.status(401).json({ success: false, message: 'Invalid or missing IoT API key' });
  }

  next();
}

module.exports = verifyIotKey;
