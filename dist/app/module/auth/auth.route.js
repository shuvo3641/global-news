import { Router } from "express";
import { forgotPassword, getCurrentSession, loginUser, loginUserByGoogle, logoutUser, refreshAccessToken, registerUser, resendOtp, resetPassword, verifyAccount, verifyOtp } from "./auth.controller.js";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
// Router
const router = Router();
// Register User
router.post("/register", rateLimiter(3600, 5, "AUTH_REGISTER"), registerUser);
// Verify Account
router.post("/verify-account", rateLimiter(600, 5, "AUTH_VERIFY_ACCOUNT"), verifyAccount);
// Login User
router.post("/login", rateLimiter(900, 5, "AUTH_LOGIN"), loginUser);
// Forgot Password
router.post("/forgot-password", rateLimiter(3600, 3, "AUTH_FORGOT_PASSWORD"), forgotPassword);
// Resend Otp
router.post("/resend-otp", rateLimiter(600, 3, "AUTH_RESEND_OTP"), resendOtp);
// Verify Otp
router.post("/verify-otp", rateLimiter(600, 5, "AUTH_VERIFY_OTP"), verifyOtp);
// Reset Password
router.post("/reset-password", rateLimiter(900, 5, "AUTH_RESET_PASSWORD"), resetPassword);
// Login User By Google
router.post("/login/google", rateLimiter(900, 10, "AUTH_GOOGLE_LOGIN"), loginUserByGoogle);
// Refresh Access Token
router.post("/refresh-token", rateLimiter(60, 30, "AUTH_REFRESH_TOKEN"), refreshAccessToken);
// Logout User
router.post("/logout", verifyAuth, rateLimiter(60, 10, "AUTH_LOGOUT"), logoutUser);
// Session
router.post("/session", rateLimiter(60, 30, "AUTH_SESSION"), getCurrentSession);
export const authRouter = router;
//# sourceMappingURL=auth.route.js.map