import sanitize from "mongo-sanitize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { TryCatch } from "../../middleware/TryCatch.js";
import { forgotPasswordSchema, googleLoginSchema, loginSchema, registerSchema, resendOtpSchema, resetPasswordSchema, verifyAccountSchema, verifyOtpSchema } from "./auth.validation.js";
import { responseHandler } from "../../utils/responseHandler.js";
import { User } from "../user/user.model.js";
import { config } from "../../config/config.js";
import { redisClient } from "../../config/redis.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import { forgotPasswordOtpEmailData, loginOtpEmailData, verifyAccountEmailData } from "./auth.mail.js";
import { sendMail } from "../../config/nodemailer.js";
import { googleClient } from "../../config/google.js";
import { createUserAccount, findUserByEmail, findUserByEmailWithPassword, findUserById } from "../user/user.service.js";
import { deleteRedisData, getRedisCooldown, getRedisData, setRedisData } from "../../services/redis.service.js";
// Register User
export const registerUser = TryCatch(async (req, res) => {
    // Zod Validation
    const validation = registerSchema.safeParse(req.body);
    if (!validation?.success) {
        return zodErrorHandler(res, validation);
    }
    // Sanitize Data
    const { name, email, password } = sanitize(validation?.data);
    // User Exists
    const user = await findUserByEmail(email);
    if (user) {
        return responseHandler(res, 409, "This email is already registered");
    }
    // Redis User Data Key
    const userDataKey = `VERIFY_ACCOUNT:${email}`;
    // Regestration Request Exist
    const existingRequest = await getRedisData(userDataKey);
    if (existingRequest) {
        return responseHandler(res, 409, "A verification email has already been sent to this email address");
    }
    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate Verify Account Token
    const verifyAccountToken = jwt.sign({
        type: "VERIFY_ACCOUNT",
        email
    }, config.jwtVerifySecret, {
        expiresIn: "15m"
    });
    // Data
    const userData = {
        name,
        email,
        password: hashedPassword,
        token: verifyAccountToken
    };
    // Save Data To Redis
    await setRedisData(userDataKey, userData, 900);
    // Send Email
    let subject = verifyAccountEmailData?.subject
        .replace("{{APP_NAME}}", config.appName);
    let text = verifyAccountEmailData?.text
        .replaceAll("{{NAME}}", name)
        .replaceAll("{{APP_NAME}}", config.appName)
        .replaceAll("{{VERIFY_URL}}", `${config.clientUrl}/verify-account/${verifyAccountToken}`)
        .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
    let html = verifyAccountEmailData?.html
        .replaceAll("{{NAME}}", name)
        .replaceAll("{{APP_NAME}}", config.appName)
        .replaceAll("{{VERIFY_URL}}", `${config.clientUrl}/verify-account/${verifyAccountToken}`)
        .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
    await sendMail(res, email, subject, text, html);
    return responseHandler(res, 200, "Registration successful. Please check your email to verify your account.");
});
// Verify Acount
export const verifyAccount = TryCatch(async (req, res) => {
    // Validation
    const validation = verifyAccountSchema.safeParse(req.body);
    if (!validation?.success) {
        return zodErrorHandler(res, validation);
    }
    // Sanitize Data
    const { token } = sanitize(validation?.data);
    // Decode Token
    let payload;
    try {
        payload = jwt.verify(token, config.jwtVerifySecret);
    }
    catch (err) {
        return responseHandler(res, 400, "Invalid or expired verification token");
    }
    // Validate Token Payloads
    if (!payload || payload?.type !== "VERIFY_ACCOUNT" || !payload?.email) {
        return responseHandler(res, 400, "Invalid verification token");
    }
    // User Already Exists
    const user = await findUserByEmail(payload?.email);
    if (user) {
        return responseHandler(res, 409, "This email is already registered");
    }
    // Redis User Data Key
    const redisUserDataKey = `VERIFY_ACCOUNT:${payload?.email}`;
    // Get User Data From Redis
    const userData = await getRedisData(redisUserDataKey);
    if (!userData) {
        return responseHandler(res, 400, "The verification link is invalid or has expired");
    }
    // Compare Token
    if (userData?.token !== token) {
        return responseHandler(res, 400, "Invalid verification token");
    }
    // Create User
    await createUserAccount({
        name: userData?.name,
        email: userData?.email,
        password: userData?.password,
        provider: "CREDENTIALS"
    });
    // Delete User Data From Redis
    await deleteRedisData(redisUserDataKey);
    return responseHandler(res, 201, "Account verified successfully");
});
// Login User
export const loginUser = TryCatch(async (req, res) => {
    // Validation
    const validation = loginSchema.safeParse(req.body);
    if (!validation?.success) {
        return zodErrorHandler(res, validation);
    }
    // Sanitize Data
    const { email, password, rememberMe } = sanitize(validation.data);
    // Redis Key
    const redisLoginResendOtpCooldown = `RESEND_OTP_COOLDOWN:LOGIN:${email}`;
    const redisVerifyOtpKey = `VERIFY_LOGIN_OTP:${email}`;
    // Check Login Request Already Exists
    const redisLoginData = await getRedisData(redisVerifyOtpKey);
    if (redisLoginData) {
        return responseHandler(res, 409, "A login verification code has already been sent to this email address");
    }
    // Find User
    const user = await findUserByEmailWithPassword(email);
    if (!user) {
        return responseHandler(res, 401, "Invalid email or password");
    }
    // Check Deleted Account
    if (user.isDeleted) {
        return responseHandler(res, 403, "This account has been deleted");
    }
    // Check Blocked Account
    if (user.isBlocked) {
        return responseHandler(res, 403, "This account has been blocked");
    }
    // Check Provider
    if (user?.provider !== "CREDENTIALS") {
        return responseHandler(res, 400, "This account cannot be logged in with email and password");
    }
    // Compare Password
    const isPasswordMatch = await bcrypt.compare(password, user?.password);
    if (!isPasswordMatch) {
        return responseHandler(res, 401, "Invalid email or password");
    }
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999);
    // Generate Verify Otp Token
    const token = jwt.sign({
        type: "LOGIN",
        email,
        rememberMe
    }, config.jwtVerifySecret, {
        expiresIn: "15m"
    });
    // Save Login Data & Resend OTP Cooldown To Redis
    await setRedisData(redisLoginResendOtpCooldown, "1", 120);
    await setRedisData(redisVerifyOtpKey, {
        email,
        otp,
        token
    }, 900);
    // Send OTP Email
    const subject = loginOtpEmailData?.subject
        .replaceAll("{{APP_NAME}}", config.appName);
    const text = loginOtpEmailData?.text
        .replaceAll("{{NAME}}", user?.name)
        .replaceAll("{{APP_NAME}}", config.appName)
        .replaceAll("{{OTP}}", otp?.toString())
        .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
    const html = loginOtpEmailData?.html
        .replaceAll("{{NAME}}", user?.name)
        .replaceAll("{{APP_NAME}}", config.appName)
        .replaceAll("{{OTP}}", otp?.toString())
        .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
    await sendMail(res, email, subject, text, html);
    return responseHandler(res, 200, "A verification code has been sent to your email", {
        token
    });
});
// Forgot Password
export const forgotPassword = TryCatch(async (req, res) => {
    // Validation
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation?.success) {
        return zodErrorHandler(res, validation);
    }
    // Sanitize Body Data
    const { email } = sanitize(validation?.data);
    // Redis Key
    const redisForgotPasswordResendOtpCooldown = `RESEND_OTP_COOLDOWN:FORGOT_PASSWORD:${email}`;
    const redisVerifyOtpKey = `VERIFY_FORGOT_PASSWORD_OTP:${email}`;
    // Check Forgot Password Request Already Exists
    const redisForgotPasswordData = await getRedisData(redisVerifyOtpKey);
    if (redisForgotPasswordData) {
        return responseHandler(res, 409, "A password reset verification code has already been sent to this email address");
    }
    // Find User
    const user = await findUserByEmail(email);
    if (!user) {
        return responseHandler(res, 401, "Invalid email address");
    }
    // Check Deleted / Blocked Account
    if (user.isDeleted || user.isBlocked) {
        return responseHandler(res, 403, "This account cannot reset password");
    }
    // Check Provider
    if (user?.provider !== "CREDENTIALS") {
        return responseHandler(res, 400, "This account cannot reset password using email");
    }
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999);
    // Generate Verify Otp Token
    const token = jwt.sign({
        type: "FORGOT_PASSWORD",
        email
    }, config.jwtVerifySecret, {
        expiresIn: "15m"
    });
    // // Save Forgot Password Data & Resend OTP Cooldown To Redis
    await setRedisData(redisForgotPasswordResendOtpCooldown, "1", 120);
    await setRedisData(redisVerifyOtpKey, {
        email,
        otp,
        token
    }, 900);
    // Send OTP Email
    const subject = forgotPasswordOtpEmailData?.subject
        .replaceAll("{{APP_NAME}}", config.appName);
    const text = forgotPasswordOtpEmailData?.text
        .replaceAll("{{NAME}}", user?.name)
        .replaceAll("{{APP_NAME}}", config.appName)
        .replaceAll("{{OTP}}", otp?.toString())
        .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
    const html = forgotPasswordOtpEmailData?.html
        .replaceAll("{{NAME}}", user?.name)
        .replaceAll("{{APP_NAME}}", config.appName)
        .replaceAll("{{OTP}}", otp?.toString())
        .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
    await sendMail(res, email, subject, text, html);
    return responseHandler(res, 200, "A verification code has been sent to your email", {
        token
    });
});
// Resend Otp
export const resendOtp = TryCatch(async (req, res) => {
    // Validate
    const validate = resendOtpSchema.safeParse(req.body);
    if (!validate?.success) {
        return zodErrorHandler(res, validate);
    }
    // Sanitize Data
    const { token } = sanitize(validate.data);
    // Decode Token
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwtVerifySecret);
    }
    catch (err) {
        return responseHandler(res, 401, "Invalid or expired verification token");
    }
    // Type Check
    if (decoded.type !== "LOGIN" && decoded.type !== "FORGOT_PASSWORD") {
        return responseHandler(res, 400, "Invalid verification token");
    }
    // Find User
    const user = await findUserByEmail(decoded?.email);
    if (!user) {
        return responseHandler(res, 401, "User not found or invalid email address");
    }
    // Check Deleted / Blocked Account
    if (user.isDeleted || user.isBlocked) {
        return responseHandler(res, 403, "This account cannot be used");
    }
    // Check Provider
    if (user?.provider !== "CREDENTIALS") {
        return responseHandler(res, 400, "This account cannot reset password using email");
    }
    // Cooldown Check
    const cooldownKey = `RESEND_OTP_COOLDOWN:${decoded.type}:${decoded.email}`;
    const cooldown = await getRedisData(cooldownKey);
    if (cooldown) {
        return responseHandler(res, 429, "Please wait before requesting another verification code");
    }
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999);
    // Resend OTP
    if (decoded.type === "LOGIN") {
        // Verify Login OTP Data
        const verifyLoginOTPData = await getRedisData(`VERIFY_LOGIN_OTP:${decoded.email}`);
        if (!verifyLoginOTPData) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Token Check
        if (verifyLoginOTPData?.token !== token) {
            return responseHandler(res, 400, "Invalid verification token");
        }
        // Verify Login OTP Cooldown
        const verifyLoginOTPCooldown = await getRedisCooldown(`VERIFY_LOGIN_OTP:${decoded.email}`);
        if (verifyLoginOTPCooldown < 1) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Save Login Data & Resend OTP Cooldown To Redis
        await setRedisData(`RESEND_OTP_COOLDOWN:LOGIN:${decoded.email}`, "1", 120);
        await setRedisData(`VERIFY_LOGIN_OTP:${decoded.email}`, {
            email: decoded.email,
            otp,
            token
        }, verifyLoginOTPCooldown);
        // Send OTP Email
        const subject = loginOtpEmailData?.subject
            .replaceAll("{{APP_NAME}}", config.appName);
        const text = loginOtpEmailData?.text
            .replaceAll("{{NAME}}", user?.name)
            .replaceAll("{{APP_NAME}}", config.appName)
            .replaceAll("{{OTP}}", otp?.toString())
            .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
        const html = loginOtpEmailData?.html
            .replaceAll("{{NAME}}", user?.name)
            .replaceAll("{{APP_NAME}}", config.appName)
            .replaceAll("{{OTP}}", otp?.toString())
            .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
        await sendMail(res, decoded.email, subject, text, html);
    }
    else {
        // Verify Forgot Password OTP Data
        const verifyForgotPasswordOTPData = await getRedisData(`VERIFY_FORGOT_PASSWORD_OTP:${decoded.email}`);
        if (!verifyForgotPasswordOTPData) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Token Check
        if (verifyForgotPasswordOTPData?.token !== token) {
            return responseHandler(res, 400, "Invalid verification token");
        }
        // Verify Forgot Password OTP Cooldown
        const verifyForgotPasswordOTPCooldown = await getRedisCooldown(`VERIFY_FORGOT_PASSWORD_OTP:${decoded.email}`);
        if (verifyForgotPasswordOTPCooldown < 1) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Save Forgot Password Data & Resend OTP Cooldown To Redis
        await setRedisData(`RESEND_OTP_COOLDOWN:FORGOT_PASSWORD:${decoded.email}`, "1", 120);
        await setRedisData(`VERIFY_FORGOT_PASSWORD_OTP:${decoded.email}`, {
            email: decoded.email,
            otp,
            token
        }, verifyForgotPasswordOTPCooldown);
        // Send OTP Email
        const subject = forgotPasswordOtpEmailData?.subject
            .replaceAll("{{APP_NAME}}", config.appName);
        const text = forgotPasswordOtpEmailData?.text
            .replaceAll("{{NAME}}", user?.name)
            .replaceAll("{{APP_NAME}}", config.appName)
            .replaceAll("{{OTP}}", otp?.toString())
            .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
        const html = forgotPasswordOtpEmailData?.html
            .replaceAll("{{NAME}}", user?.name)
            .replaceAll("{{APP_NAME}}", config.appName)
            .replaceAll("{{OTP}}", otp?.toString())
            .replaceAll("{{YEAR}}", String(new Date().getFullYear()));
        await sendMail(res, decoded.email, subject, text, html);
    }
    return responseHandler(res, 200, "A new verification code has been sent to your email");
});
// Verify Otp
export const verifyOtp = TryCatch(async (req, res) => {
    // Validate
    const validate = verifyOtpSchema.safeParse(req.body);
    if (!validate?.success) {
        return zodErrorHandler(res, validate);
    }
    // Sanitize Data
    const { token, otp } = sanitize(validate.data);
    // Decode Token
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwtVerifySecret);
    }
    catch (err) {
        return responseHandler(res, 401, "Invalid or expired verification token");
    }
    // Token Type Check
    if (decoded.type !== "LOGIN" && decoded.type !== "FORGOT_PASSWORD") {
        return responseHandler(res, 400, "Invalid verification token");
    }
    // Find User
    const user = await findUserByEmail(decoded?.email);
    if (!user) {
        return responseHandler(res, 401, "User not found or invalid email address");
    }
    // Check Deleted / Blocked Account
    if (user.isDeleted || user.isBlocked) {
        return responseHandler(res, 403, "This account cannot be used");
    }
    // Check Provider
    if (user?.provider !== "CREDENTIALS") {
        return responseHandler(res, 400, "This account cannot reset password using email");
    }
    // Login User / Send Reset Password Token
    if (decoded.type === "LOGIN") {
        // Verify Login OTP Data
        const verifyLoginOTPData = await getRedisData(`VERIFY_LOGIN_OTP:${decoded.email}`);
        if (!verifyLoginOTPData) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Token Check
        if (verifyLoginOTPData?.token !== token) {
            return responseHandler(res, 400, "Invalid verification token");
        }
        // Compare OTP
        if (verifyLoginOTPData?.otp !== Number(otp)) {
            return responseHandler(res, 400, "Invalid verification code");
        }
        // Verify Login OTP Cooldown
        const verifyLoginOTPCooldown = await getRedisCooldown(`VERIFY_LOGIN_OTP:${decoded.email}`);
        if (verifyLoginOTPCooldown < 1) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Generate Tokens
        const accessToken = jwt.sign({
            userId: user._id
        }, config.jwtAccessSecret, {
            expiresIn: "15m"
        });
        const refreshToken = jwt.sign({
            userId: user._id
        }, config.jwtRefreshSecret, {
            expiresIn: decoded?.rememberMe ? "15d" : "1d"
        });
        // Redis User Data Key
        const redisUserDataKey = `USER_SESSION:${user._id}`;
        // Save User Data To Redis
        await setRedisData(redisUserDataKey, {
            userId: user._id,
            refreshToken
        }, decoded.rememberMe ? 15 * 24 * 60 * 60 : 1 * 24 * 60 * 60);
        // Delete Login Otp Data From Redis
        await deleteRedisData(`VERIFY_LOGIN_OTP:${decoded.email}`);
        await deleteRedisData(`RESEND_OTP_COOLDOWN:LOGIN:${decoded.email}`);
        // Client Type
        const clientType = req.headers["x-client-type"];
        if (typeof clientType !== "string" || !["web", "mobile"].includes(clientType)) {
            return responseHandler(res, 400, "Invalid client type");
        }
        // Response
        if (clientType === "web") {
            // Set Refresh Token To Cookies
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: config.cookieSameSite,
                path: "/",
                ...(decoded.rememberMe && {
                    maxAge: 15 * 24 * 60 * 60 * 1000
                })
            });
            return responseHandler(res, 200, "Login successful", {
                type: "LOGIN",
                accessToken,
                user
            });
        }
        else {
            return responseHandler(res, 200, "Login successful", {
                type: "LOGIN",
                accessToken,
                refreshToken,
                user
            });
        }
    }
    else {
        // Verify Forgot Password OTP Data
        const verifyForgotPasswordOTPData = await getRedisData(`VERIFY_FORGOT_PASSWORD_OTP:${decoded.email}`);
        if (!verifyForgotPasswordOTPData) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Token Check
        if (verifyForgotPasswordOTPData?.token !== token) {
            return responseHandler(res, 400, "Invalid verification token");
        }
        // Compare OTP
        if (verifyForgotPasswordOTPData?.otp !== Number(otp)) {
            return responseHandler(res, 400, "Invalid verification code");
        }
        // Verify Forgot Password OTP Cooldown
        const verifyForgotPasswordOTPCooldown = await getRedisCooldown(`VERIFY_FORGOT_PASSWORD_OTP:${decoded.email}`);
        if (verifyForgotPasswordOTPCooldown < 1) {
            return responseHandler(res, 400, "Verification code has expired or is no longer available");
        }
        // Redis Reset Password Data Key
        const redisResetPasswordDataKey = `RESET_PASSWORD:${decoded.email}`;
        // Already Exists Reset Req
        const redisResetPasswordData = await getRedisData(redisResetPasswordDataKey);
        if (redisResetPasswordData) {
            return responseHandler(res, 409, "A password reset request is already in progress");
        }
        // Generate JWT Token
        const resetToken = jwt.sign({
            type: "RESET_PASSWORD",
            email: user.email
        }, config.jwtVerifySecret, {
            expiresIn: "15m"
        });
        // Set Reset Password Data To Redis
        await setRedisData(redisResetPasswordDataKey, {
            email: user.email,
            token: resetToken
        }, 900);
        // Delete Redis Forgot Password Data
        await deleteRedisData(`VERIFY_FORGOT_PASSWORD_OTP:${decoded.email}`);
        await deleteRedisData(`RESEND_OTP_COOLDOWN:FORGOT_PASSWORD:${decoded.email}`);
        return responseHandler(res, 200, "OTP verified successfully", {
            type: "FORGOT_PASSWORD",
            token: resetToken
        });
    }
});
// Reset Password
export const resetPassword = TryCatch(async (req, res) => {
    // Validation
    const validate = resetPasswordSchema.safeParse(req.body);
    if (!validate.success) {
        return zodErrorHandler(res, validate);
    }
    // Sanitize Data
    const { token, password } = sanitize(validate.data);
    // Decode Token
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwtVerifySecret);
    }
    catch (err) {
        return responseHandler(res, 401, "Invalid or expired verification token");
    }
    // Type Check
    if (decoded.type !== "RESET_PASSWORD") {
        return responseHandler(res, 400, "Invalid verification token");
    }
    // Find User
    const user = await findUserByEmailWithPassword(decoded?.email);
    if (!user) {
        return responseHandler(res, 401, "User not found or invalid email address");
    }
    // Check Deleted / Blocked Account
    if (user.isDeleted || user.isBlocked) {
        return responseHandler(res, 403, "This account cannot be used");
    }
    // Check Provider
    if (user?.provider !== "CREDENTIALS") {
        return responseHandler(res, 400, "This account cannot reset password using email");
    }
    // Redis Reset Password Data Key
    const redisResetPasswordDataKey = `RESET_PASSWORD:${decoded.email}`;
    // Get Reset Password Data From Redis
    const resetPasswordData = await getRedisData(redisResetPasswordDataKey);
    if (!resetPasswordData) {
        return responseHandler(res, 401, "Invalid or expired password reset request");
    }
    // Reset Password JSON Data
    if (resetPasswordData?.token !== token) {
        return responseHandler(res, 401, "Invalid password reset request");
    }
    // Check New Password Is Same As Previous Password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
        return responseHandler(res, 400, "New password must be different from your previous password");
    }
    // Hash New Password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update Password
    user.password = hashedPassword;
    await user.save();
    // Delete Data From Redis
    await deleteRedisData(redisResetPasswordDataKey);
    return responseHandler(res, 200, "Your password has been reset successfully");
});
// Login User By Google
export const loginUserByGoogle = TryCatch(async (req, res) => {
    // Validate Google ID Token
    const validate = googleLoginSchema.safeParse(req.body);
    if (!validate.success) {
        return zodErrorHandler(res, validate);
    }
    // Sanitize
    const { idToken } = sanitize(validate.data);
    // Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: [
            config.googleAuthWebClientId,
            config.googleAuthAndroidClientId,
            config.googleAuthIosClientId
        ]
    });
    // Get Google Payload
    const payload = ticket.getPayload();
    if (!payload) {
        return responseHandler(res, 401, "Invalid Google verification token");
    }
    // Get Google User Information
    const { email, email_verified, name = "" } = payload;
    // Check Google Email
    if (!email || !email_verified) {
        return responseHandler(res, 401, "Google account email is not verified");
    }
    // Normalize Email
    const normalizedEmail = email?.toLowerCase()?.trim();
    // User
    let user = await findUserByEmail(normalizedEmail);
    if (user) {
        // Check Deleted / Blocked Account
        if (user.isDeleted || user.isBlocked) {
            return responseHandler(res, 403, "This account cannot be used");
        }
        // Check Provider
        if (user?.provider !== "GOOGLE") {
            return responseHandler(res, 409, "An account already exists with this email. Please login using your password.");
        }
    }
    // No User
    if (!user) {
        user = await createUserAccount({
            name,
            email: normalizedEmail,
            provider: "GOOGLE",
            role: "USER",
        });
    }
    // Generate Tokens
    const accessToken = jwt.sign({
        userId: user._id
    }, config.jwtAccessSecret, {
        expiresIn: "15m"
    });
    const refreshToken = jwt.sign({
        userId: user._id
    }, config.jwtRefreshSecret, {
        expiresIn: "15d"
    });
    // Redis User Data Key
    const redisUserDataKey = `USER_SESSION:${user._id}`;
    // Save User Data To Redis
    await setRedisData(redisUserDataKey, {
        userId: user._id,
        refreshToken
    }, 15 * 24 * 60 * 60);
    // Client Type
    const clientType = req.headers["x-client-type"];
    if (typeof clientType !== "string" || !["web", "mobile"].includes(clientType)) {
        return responseHandler(res, 400, "Invalid client type");
    }
    // Response
    if (clientType === "web") {
        // Set Refresh Token To Cookies
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.cookieSameSite,
            path: "/",
            maxAge: 15 * 24 * 60 * 60 * 1000
        });
        return responseHandler(res, 200, "Login successful", {
            user,
            accessToken
        });
    }
    else {
        return responseHandler(res, 200, "Login successful", {
            accessToken,
            refreshToken
        });
    }
});
// Refresh Access Token
export const refreshAccessToken = TryCatch(async (req, res) => {
    // Client Type From Headers
    const clientType = req.headers["x-client-type"];
    if (typeof clientType !== "string" || !["web", "mobile"].includes(clientType)) {
        return responseHandler(res, 400, 'Invalid client type');
    }
    // Refresh Token
    let refreshToken = null;
    // Get Refresh Token
    if (clientType === "web") {
        refreshToken = req.cookies?.refreshToken;
    }
    else {
        refreshToken = req.body?.refreshToken;
    }
    // Validate
    if (!refreshToken?.trim()) {
        return responseHandler(res, 401, "Refresh token is required");
    }
    // Decode Token
    let payload;
    try {
        payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
    }
    catch (err) {
        return responseHandler(res, 401, "Invalid or expired refresh token.");
    }
    // User ID
    const userId = payload?.userId;
    if (!userId) {
        return responseHandler(res, 401, "Invalid refresh token.");
    }
    // Find User By ID
    const user = await findUserById(userId);
    if (!user) {
        return responseHandler(res, 404, "User not found.");
    }
    // Check Deleted / Blocked Account
    if (user.isDeleted || user.isBlocked) {
        return responseHandler(res, 403, "This account cannot be used");
    }
    // Redis Keys
    const redisUserSessionKey = `USER_SESSION:${user._id}`;
    // Redis User Session Data
    const redisUserData = await getRedisData(redisUserSessionKey);
    const redisUserDataTtl = await getRedisCooldown(redisUserSessionKey);
    // Validate Redis Data
    if (!redisUserData) {
        return responseHandler(res, 401, "Refresh session not found or expired.");
    }
    if (redisUserDataTtl < 1) {
        return responseHandler(res, 401, "Refresh session has expired.");
    }
    // Redis User Json Data
    if (redisUserData?.userId !== userId) {
        return responseHandler(res, 401, "Invalid refresh token.");
    }
    // Generate New Tokens
    const newAccessToken = jwt.sign({
        userId: user._id
    }, config.jwtAccessSecret, {
        expiresIn: "15m"
    });
    const newRefreshToken = jwt.sign({
        userId: user._id
    }, config.jwtRefreshSecret, {
        expiresIn: redisUserDataTtl
    });
    // Redis User Data Key
    const redisUserDataKey = `USER_SESSION:${user._id}`;
    // Save User Data To Redis
    await setRedisData(redisUserDataKey, {
        userId: user._id,
        refreshToken: newRefreshToken
    }, redisUserDataTtl);
    // Response
    if (clientType === "web") {
        // Set Refresh Token To Cookies
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.cookieSameSite,
            path: "/",
            maxAge: redisUserDataTtl * 1000
        });
        return responseHandler(res, 200, "Access token refreshed successfully", {
            accessToken: newAccessToken
        });
    }
    else {
        return responseHandler(res, 200, "Access token refreshed successfully", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
});
// Logout User
export const logoutUser = TryCatch(async (req, res) => {
    // My ID
    const myId = req.user?._id;
    // Redis Key
    const redisUserSessionKey = `USER_SESSION:${myId}`;
    // Delete Settion Data From Redis
    await deleteRedisData(redisUserSessionKey);
    // Client Type From Headers
    const clientType = req.headers["x-client-type"];
    if (typeof clientType !== "string" || !["web", "mobile"].includes(clientType)) {
        return responseHandler(res, 400, 'Invalid client type');
    }
    // Remove Cookie
    if (clientType === "web") {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.cookieSameSite,
            path: "/"
        });
    }
    return responseHandler(res, 200, "Logout successful");
});
// Get Current Session
export const getCurrentSession = TryCatch(async (req, res) => {
    // Refresh Token
    let refreshToken = req?.headers?.refreshtoken ? req?.headers?.refreshtoken : null;
    // Validate Token
    if (!refreshToken) {
        return responseHandler(res, 200, "Unauthenticated", {
            isAuth: false,
            role: null
        });
    }
    // Payload
    let payload;
    // Verify Token
    try {
        payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
    }
    catch (error) {
        return responseHandler(res, 200, "Unauthenticated", {
            isAuth: false,
            role: null
        });
    }
    // Validate Payload
    if (!payload || !payload?.userId) {
        return responseHandler(res, 200, "Unauthenticated", {
            isAuth: false,
            role: null
        });
    }
    // Find User
    const user = await User.findOne({
        _id: payload?.userId,
        isBlocked: false,
        isDeleted: false
    });
    if (!user) {
        return responseHandler(res, 200, "Unauthenticated", {
            isAuth: false,
            role: null
        });
    }
    return responseHandler(res, 200, "Authenticated", {
        isAuth: true,
        role: user?.role
    });
});
//# sourceMappingURL=auth.controller.js.map