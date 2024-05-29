const bcrypt = require("bcrypt");
const randToken = require('rand-token');

const authMethod = require("../methods/auth");
const User = require('../models/user');
const UserVerify = require('../models/userverify');

const jwtVariable = require("../variables/jwt");
const { SALT_ROUNDS } = require("../variables/auth");

const validateEmail = require('../validate/email')
const sendMail = require('../methods/sendmail');
const { token } = require("morgan");
require('dotenv').config();


exports.postSendOtp = async (req, res, next) => {
  const email = req.body.email;
  const otp = `${(100000 + Math.random() * 900000).toFixed(0)}`
  if (!validateEmail(email)) {
    return res.status(400).json({ message: `Validate email fail!` });
  }
  const user = await User.getUserbyEmail(email);
  if (!user) {
    return res.status(409).json({ message: "Không tìm thấy email này trên hệ thống" })
  }
  const existEmail = await UserVerify.getUserVerifybyEmail(email);
  if (existEmail) {
    return res.status(409).json({ message: "Email này đang chờ để nhập mã xác thực, vui lòng thử lại sau 5 phút" })
  }
  const result = sendMail(email, otp);
  if (result) {
    res.json({ message: 'success', email: email });
  } else {
    res.json({ message: 'fail' })
  }
}

exports.postVerifyOtp = async (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const verify = await UserVerify.verifyEmail(email, otp);
  const user = await User.getUserbyEmail(email);
  if (verify) {
    const verifySuccess = await UserVerify.verifySuccess(email);
    if (verifySuccess) {
      await User.updateOne({ _id: user._id }, { emailVerify: true });
      res.status(200).json({ success: true, message: `OTP vefified successfully!` });
    }
    else {
      res.status(400).json({ message: `Something went wrong!` });
    }
  } else {
    res.status(400).json({ success: false, message: `OTP vefified fail!` });
  }
}

exports.postForgot = async (req, res, next) => {
  const NewPassword = req.body.password;
  const email = req.body.email;

  const hashPassword = bcrypt.hashSync(NewPassword, SALT_ROUNDS);
  const user = await User.getUserbyEmail(email);
  try {
    await User.updateOne({ _id: user._id }, { password: hashPassword })
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công." });
  } catch (error) {
    res.status(400).json({ message: `Đổi mật khẩu không thành công.` });
  }
}

exports.postRegister = async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  if (!validateEmail(email)) {
    return res.status(400).json({ message: `Validate email fail!` });
  }
  const user = await User.getUserbyEmail(email);
  if (user) res.status(409).json({ message: "Email này đã dùng để đăng kí tài khoản." });
  else {
    const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
    const newUser = {
      name: name,
      email: email,
      password: hashPassword,
    };
    try {
      const createUser = await User.createUser(newUser);
      if (!createUser) {
        return res
          .status(400)
          .josn({ message: "Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại." });
      } else {
        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
        const dataForAccessToken = {
          email: email,
          userid: createUser._id,
        };
        //Tạo access Token
        const accessToken = await authMethod.generateToken(
          dataForAccessToken,
          accessTokenSecret,
          accessTokenLife
        );
        let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên
        return res.status(201).json({
          user: {
            ...createUser,
            token: accessToken,
            refreshToken: refreshToken
          }
        });
      }
    } catch (err) {
      return res.status(409).json({ err: err });
    }
  }

}

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.getUserbyEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Email không tồn tại." });
  }
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Mật khẩu không chính xác." });
  }

  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
  const dataForAccessToken = {
    email: user.email,
    userid: user._id,
  };
  //Tạo access Token
  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res.status(401).json({ message: 'Đăng nhập không thành công, vui lòng thử lại.' });
  }

  let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên
  if (!user.refreshToken) {
    // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
    await User.updateRefreshToken(user._id, refreshToken);
  } else {
    // Nếu user này đã có refresh token thì lấy refresh token đó từ database
    refreshToken = user.refreshToken;
  }
  const resData = user.toObject();
  delete resData.password;
  return res.json({
    message: 'Đăng nhập thành công.',
    user: {
      ...resData,
      token: accessToken,
      refreshToken: refreshToken
    }
  });
}


exports.postReset = async (req, res, next) => {
  const oldpassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const user = await User.findById(req.body.userId);
  if (!user) {
    return res.status(401).json({ message: "Tài khoản không tồn tại." });
  }
  const isPasswordValid = bcrypt.compareSync(oldpassword, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Mật khẩu không chính xác." });
  } else {
    const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
    await User.updateOne({ _id: req.body.userId }, { password: hashPassword })
    res.status(200).json({ message: "Đổi mật khẩu thành công." });
  }
}

exports.refreshToken = async (req, res) => {
  // Lấy access token từ header
  const authHeader = req.headers['authorization'];
  const accessTokenFromHeader = authHeader && authHeader.split(' ')[1];
  if (!accessTokenFromHeader) {
    return res.status(400).json({ message: 'Không tìm thấy access token.' });
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).json({ message: 'Không tìm thấy refresh token.' });
  }

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
  const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

  // Decode access token đó
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret,
  );
  if (!decoded) {
    return res.status(400).json({ message: 'Access token không hợp lệ.' });
  }

  const email = decoded.payload.email; // Lấy username từ payload

  const user = await User.getUserbyEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'User không tồn tại.' });
  }

  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).json({ message: 'Refresh token không hợp lệ.' });
  }

  // Tạo access token mới
  const dataForAccessToken = {
    email: user.email,
    userid: user._id
  };

  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife,
  );
  if (!accessToken) {
    return res
      .status(400)
      .json({ message: 'Tạo access token không thành công, vui lòng thử lại.' });
  }
  return res.json({
    accessToken
  });
};