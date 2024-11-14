const { UserModel } = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { transport } = require("../Config/emailConfig");
const {sendEmailVerificationOTP} = require("../Utils/sendEmailVerificationOTP");
const { EmailVerificationModel } = require("../Models/emailVerification");

const registerUser = async (req, res) => {
  try {
    const { fullName, password, email, recaptchaValue } = req.body;

    if (!fullName || !password || !email || !recaptchaValue) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered with this email",
      });
    }

    const output = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaValue}`
    );

    if (output.data.success) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Attempt to create the user
      const newUser = await UserModel.create({
        fullName,
        password: hashedPassword,
        email,
      });

      sendEmailVerificationOTP(newUser)

      newUser.password = undefined;

      // const token = await jwt.sign(
      //   { userId: newUser._id },
      //   process.env.JWT_SECRET_KEY,
      //   { expiresIn: "1d" }
      // );

      res.status(201).json({
        success: true,
        message: "User registered successfully, Please Verify Your Account Now",
        newUser,
        userId: newUser._id,
        userName: newUser.fullName,
        userEmail: newUser.email,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "reCaptcha verification failed" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const verifyEmail = async (req,res)=>{
  try {
    const {email, otp} = req.body

    
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email doesn't exist",
      });
    }

    // check if email is already verified
    if(existingUser.isVerified){
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }
   
    // check if there is a matching email verification otp
    const emailVerification = await EmailVerificationModel.findOne({userId: existingUser._id,otp})

    if(!emailVerification){
      if(!existingUser.isVerified){
        await sendEmailVerificationOTP(existingUser)
        return res.status(400).json({success:false, message:"Invalid OTP, New OTP has been sent to your email"})
      }
      return res.status(400).json({success:false, message:"Invalid OTP"})
    }

    const currentTime = new Date()

    // 15*60*1000 calculates the expiration time in milliseconds (15 minutes)
    const expirationTime = new Date(emailVerification.createdAt.getTime()+ 15*60*1000)

    if(currentTime > expirationTime){
      await sendEmailVerificationOTP(existingUser)
      return res.status(400).json({success:false, message:"OTP expired, New OTP has been sent to your email"})
    }

    // OTP is valid and not expired, mark email as verified
    existingUser.isVerified = true,
    await existingUser.save()

    // delete email verification document
    await EmailVerificationModel.deleteMany({userId: existingUser._id})

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
}
}

const loginUser = async (req, res) => {
  try {
    const { password, email, recaptchaValue } = req.body;
    if (!password || !email ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if(!existingUser.isVerified){
      return res.status(401).json({
        success: false,
        message: "Your account is not verified, Please verify it first",
      });
    }

    const passwordChecking = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordChecking) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    } else {
      // const output = await axios.post(
      //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaValue}`
      // );
      const token = await jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );
      res.status(200).json({
        success: true,
        message: "User login successfully",
        token,
        userId: existingUser._id,
        userName: existingUser.fullName,
        userEmail: existingUser.email,
        isAuth:true
      });

      // if (output.data.success) {
      //   const token = await jwt.sign(
      //     { userId: existingUser._id },
      //     process.env.JWT_SECRET_KEY,
      //     { expiresIn: "1d" }
      //   );
      //   res.status(200).json({
      //     success: true,
      //     message: "User login successfully",
      //     token,
      //     userId: existingUser._id,
      //     userName: existingUser.fullName,
      //     userEmail: existingUser.email,
      //     isAuth:true
      //   });
      // } 
      // else {
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "reCaptcha verification failed" });
      // }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loggedUserController = async (req, res) => {
  try {
    res.status(200).json({ user: req.user, success: true });
  } catch (error) {
    // console.log(error);
    res.status(400).json({ success: false, message: "Internal server error" });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { password, password_confirmation } = req.body;
    if (!password || !password_confirmation) {
      return res.send({ status: "failed", message: "All Fields Are Required" });
    } else {
      if (password === password_confirmation) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: hashedPassword },
        });
        return res.send({
          success: true,
          message: "Password Changed Successfully",
        });
      } else {
        return res.send({
          success: false,
          message: "Credentials Don't Match",
        });
      }
    }
  } catch (error) {
    res.status(400).json({ success: false, message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { _id } = req.user;
    await UserModel.findByIdAndDelete(_id);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const sendUserResetPasswordEmail = async (req,res)=>{
  try {
    const {email} = req.body
    if(!email){
      return  res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = await UserModel.findOne({email})

    if(!user){
      return res.status(404).json({ success: false, message: "Email doesn't exist" });
    } 

    const secret = user._id + process.env.JWT_SECRET_KEY
    const token = await jwt.sign({userId : user._id},secret,{expiresIn:"15m"})

    const link = `http://127.0.0.1:5173/api/v1/user/reset/${user._id}/${token}`

    // send email
    let info = await transport.sendMail({
      from:process.env.EMAIL_FROM,
      to: user.email,
      subject:"Blog-App, Password Reset Link",
      html:`<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f4f4f4; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="color: #555;">Namaste</p>
      <p style="color: #555;">We received a request to reset your password. Click the button below to set a new password.</p>
      <a href="${link}" style="display: inline-block; padding: 12px 20px; margin: 20px 0; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p style="color: #555;">If you didn’t request this, please ignore this email.</p>
      <p style="color: #555;">Thank you, <br>The Blog-App Team</p>
    </div>`
    })

    res.status(200).json({success:true, message:"Password Reset Email Sent, Please Check Your Email", info})

  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

const userPasswordReset = async (req,res)=>{
  try {
    const {password, confirmPassword} = req.body
    const {id,token} = req.params

    if(!password || !confirmPassword){
      return  res.status(400).json({ success: false, message: "Password & Confirm password are required" });
     }

    if(password !== confirmPassword){
     return  res.status(400).json({ success: false, message: "Password & Confirm password don't match" });
    }

    const user = await UserModel.findById(id)
    if(user){
      const newSecret = user._id + process.env.JWT_SECRET_KEY

      const output = await jwt.verify(token, newSecret)
  
      if(output){
        const newHashPassword = await bcrypt.hash(password, 10)
  
         await UserModel.findByIdAndUpdate(user._id,{
          $set : {password:newHashPassword}
         })

         return res.status(200).json({success:true, message:"Password has been reset successfully"})
      }else{
        return res.status(400).json({success:false, message:"Invalid Link"})
      }
    }else{
      return res.status(400).json({success:false, message:"User not found in the database"})
    }
   
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  loggedUserController,
  changeUserPassword,
  deleteUser,
  sendUserResetPasswordEmail,
  userPasswordReset
};
