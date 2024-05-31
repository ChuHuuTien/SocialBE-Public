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
  const otp = `${(100000 + Math.random() * 900000).toFixed(0)}`;
  const user = await User.getUserbyEmail(email);
  if (!user) {
    return res.status(400).json({ data: "This email was not found on the system" })
  } else {
    const result = sendMail(email, otp);
    if (result) {
      res.status(200).json({ data: 'success send OTP to email ' + email });
    } else {
      res.status(400).json({ data: 'error send OTP to email ' + + email })
    }
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
      res.status(200).json({ data: `OTP vefified successfully!` });
    }
    else {
      res.status(400).json({ data: `Something went wrong!` });
    }
  } else {
    res.status(400).json({ data: `OTP vefified fail!` });
  }
}

exports.postForgot = async (req, res, next) => {
  const newPassword = req.body.password;
  const email = req.body.email;

  const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
  const user = await User.getUserbyEmail(email);
  try {
    if (user) {
      await User.updateOne({ _id: user._id }, { password: hashPassword })
      res.status(200).json({ data: "Your password has been changed successfully" });
    } else {
      res.status(400).json({ data: `This email was not found on the system` });
    }
  } catch (error) {
    res.status(400).json({ data: `There was an error during processing` });
  }
}

exports.postRegister = async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const user = await User.getUserbyEmail(email);
  if (user) res.status(400).json({ data: "This email already exists on the system" });
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
          .json({ data: "There was an error creating the account, please try again" });
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
        return res.status(200).json({
          data: {
            ...createUser,
            token: accessToken,
            refreshToken: refreshToken
          }
        });
      }
    } catch (err) {
      return res.status(400).json({ data: err });
    }
  }

}

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.getUserbyEmail(email);
  if (!user) {
    return res.status(400).json({ data: "This email was not found on the system" });
  }
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ data: "Incorrect password" });
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
    return res.status(400).json({ data: 'Login failed, please try again' });
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
  return res.status(200).json({
    data: {
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
    return res.status(400).json({ data: "Account does not exist" });
  }
  const isPasswordValid = bcrypt.compareSync(oldpassword, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ data: "Incorrect password" });
  } else {
    const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
    await User.updateOne({ _id: req.body.userId }, { password: hashPassword })
    res.status(200).json({ data: "Password changed successfully" });
  }
}

exports.refreshToken = async (req, res) => {
  // Lấy access token từ header
  const authHeader = req.headers['authorization'];
  const accessTokenFromHeader = authHeader && authHeader.split(' ')[1];
  if (!accessTokenFromHeader) {
    return res.status(400).json({ data: 'Access token not found' });
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).json({ data: 'No refresh token found' });
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
    return res.status(400).json({ data: 'Access token is invalid' });
  }

  const email = decoded.payload.email; // Lấy username từ payload

  const user = await User.getUserbyEmail(email);
  if (!user) {
    return res.status(400).json({ data: 'User does not exist' });
  }

  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).json({ data: 'Refresh token is not valid' });
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

  let refreshToken = randToken.generate(jwtVariable.refreshTokenSize);

  if (!accessToken) {
    return res
      .status(400)
      .json({ data: 'Creating access token failed' });
  }
  return res.status(200).json({
    data: {
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  });
};