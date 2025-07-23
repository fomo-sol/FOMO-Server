// fcmService.js
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.resolve(__dirname, "../config/firebase-service-account.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.sendNotificationToToken = async (token, title, body) => {
  const message = {
    token,
    notification: { title, body },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ 푸시 전송 성공:", {
      token,
      title,
      body,
      response
    });
    return response;
  } catch (error) {
    console.error("❌ 푸시 전송 실패:", {
      token,
      title,
      body,
      error
    });
    throw error;
  }
};
