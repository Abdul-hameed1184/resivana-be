import bcrypt = require("bcrypt");

export const generateOtp = async () => {
    // get a 4 digit hashed otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    return { otp, hashedOtp };
};

