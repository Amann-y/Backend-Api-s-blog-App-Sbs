
require("dotenv").config()

const {transport} = require("../Config/emailConfig")
const { EmailVerificationModel } = require("../Models/emailVerification")

const sendEmailVerificationOTP = async (user) => {
  // Generate a random 4 digit number
  const otp = Math.floor(1000 + Math.random() * 9000)

  // save otp in database
  await new EmailVerificationModel({userId:user._id,otp}).save()

  // otp verification link
  const otpVerificationLink = `${process.env.FRONTEND_HOST}/account/verify-email`

  await transport.sendMail({
    from : process.env.EMAIL_FROM,
    to : user.email,
    subject: "Verify Your Account",
    html:`  <h1>Email Verification</h1>
      <p>Hi ${user.fullName || "User"},</p>
      <p>Your verification code is <strong>${otp}</strong>.</p>
      <p>Please enter this code on the verification page or click the link below:</p>
      <a href="${otpVerificationLink}">Verify your email</a>
      <p>This OTP is valid for 15 minutes only,If you did not request this, please ignore this email.</p>
      `
  })

  return otp
}

module.exports = {sendEmailVerificationOTP}