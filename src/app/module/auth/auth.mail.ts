// Verify Account Email Data
export const verifyAccountEmailData = {

    subject: "Verify Your Email Address — {{APP_NAME}}",

    text: `Hello {{NAME}},

        Thank you for creating an account with {{APP_NAME}}.

        Please verify your email address by clicking the link below:

        {{VERIFY_URL}}

        This verification link will expire in 15 minutes.

        If the link above doesn't work, copy and paste it into your browser.

        If you did not create an account with {{APP_NAME}}, you can safely ignore this email. No further action is required.

        This is an automated message. Please do not reply to this email.

        Best regards,
        {{APP_NAME}} Team

        © {{YEAR}} {{APP_NAME}}. All rights reserved.`,

    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Verify Your Email Address</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:Arial, Helvetica, sans-serif; color:#18181b;">

            <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%; margin:0; padding:0; background-color:#f4f4f5;"
            >
                <tr>
                    <td align="center" style="padding:40px 20px;">

                        <!-- Main Container -->
                        <table
                            role="presentation"
                            width="600"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="width:100%; max-width:600px; background-color:#ffffff;"
                        >
                            <tr>
                                <td style="padding:40px;">

                                    <!-- Heading -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <h1
                                                    style="margin:0 0 24px 0; padding:0; font-size:24px; line-height:32px; font-weight:600; color:#18181b;"
                                                >
                                                    Verify Your Email Address
                                                </h1>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Greeting -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 16px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Hello {{NAME}},
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Introduction -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 16px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Thank you for creating an account with {{APP_NAME}}.
                                                </p>

                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Please verify your email address by clicking the button below:
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Verify Button -->
                                    <table
                                        role="presentation"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="margin:0 0 24px 0;"
                                    >
                                        <tr>
                                            <td
                                                align="center"
                                                style="background-color:#18181b;"
                                            >
                                                <a
                                                    href="{{VERIFY_URL}}"
                                                    target="_blank"
                                                    style="display:inline-block; padding:13px 24px; font-size:14px; line-height:20px; font-weight:600; color:#ffffff; text-decoration:none; background-color:#18181b;"
                                                >
                                                    Verify Email Address
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Expiration -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 12px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    This verification link will expire in
                                                    <strong>15 minutes</strong>.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Fallback URL -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 12px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    If the button above doesn't work, copy and paste the following link into your browser:
                                                </p>

                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:13px; line-height:20px; word-break:break-all;"
                                                >
                                                    <a
                                                        href="{{VERIFY_URL}}"
                                                        target="_blank"
                                                        style="color:#2563eb; text-decoration:underline;"
                                                    >
                                                        {{VERIFY_URL}}
                                                    </a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Security Notice -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    If you did not create an account with {{APP_NAME}}, you can safely ignore this email. No further action is required.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Divider -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td
                                                style="height:1px; line-height:1px; font-size:1px; background-color:#e4e4e7;"
                                            >
                                                &nbsp;
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Footer -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td style="padding-top:24px;">

                                                <p
                                                    style="margin:0 0 8px 0; padding:0; font-size:12px; line-height:18px; color:#71717a;"
                                                >
                                                    This is an automated message. Please do not reply to this email.
                                                </p>

                                                <p
                                                    style="margin:0; padding:0; font-size:12px; line-height:18px; color:#71717a;"
                                                >
                                                    &copy; {{YEAR}} {{APP_NAME}}. All rights reserved.
                                                </p>

                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `
};


// Login OTP Email Data
export const loginOtpEmailData = {
    
    subject: "Your Login Verification Code — {{APP_NAME}}",

    text: `Hello {{NAME}},

        We received a request to sign in to your {{APP_NAME}} account.

        Your login verification code is:

        {{OTP}}

        This verification code will expire in 15 minutes.

        For your security, please do not share this code with anyone.

        If you did not attempt to sign in to your {{APP_NAME}} account, you can safely ignore this email and consider changing your password if you believe your account may be at risk.

        This is an automated message. Please do not reply to this email.

        Best regards,
        {{APP_NAME}} Team

        © {{YEAR}} {{APP_NAME}}. All rights reserved.`,

    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Login Verification Code</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:Arial, Helvetica, sans-serif; color:#18181b;">

            <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%; margin:0; padding:0; background-color:#f4f4f5;"
            >
                <tr>
                    <td align="center" style="padding:40px 20px;">

                        <!-- Main Container -->
                        <table
                            role="presentation"
                            width="600"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="width:100%; max-width:600px; background-color:#ffffff;"
                        >
                            <tr>
                                <td style="padding:40px;">

                                    <!-- Heading -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <h1
                                                    style="margin:0 0 24px 0; padding:0; font-size:24px; line-height:32px; font-weight:600; color:#18181b;"
                                                >
                                                    Login Verification Code
                                                </h1>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Greeting -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 16px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Hello {{NAME}},
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Introduction -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 16px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    We received a request to sign in to your {{APP_NAME}} account.
                                                </p>

                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Use the verification code below to complete your login:
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- OTP -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="margin:0 0 24px 0;"
                                    >
                                        <tr>
                                            <td align="center">

                                                <div
                                                    style="display:inline-block; padding:16px 28px; background-color:#f4f4f5; border:1px solid #e4e4e7; font-size:30px; line-height:36px; font-weight:700; letter-spacing:8px; color:#18181b;"
                                                >
                                                    {{OTP}}
                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Expiration -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 12px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    This verification code will expire in
                                                    <strong>15 minutes</strong>.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Security Notice -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    For your security, please do not share this verification code with anyone.
                                                </p>

                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    If you did not attempt to sign in to your {{APP_NAME}} account, you can safely ignore this email and consider changing your password if you believe your account may be at risk.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Divider -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td
                                                style="height:1px; line-height:1px; font-size:1px; background-color:#e4e4e7;"
                                            >
                                                &nbsp;
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Footer -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td style="padding-top:24px;">

                                                <p
                                                    style="margin:0 0 8px 0; padding:0; font-size:12px; line-height:18px; color:#71717a;"
                                                >
                                                    This is an automated message. Please do not reply to this email.
                                                </p>

                                                <p
                                                    style="margin:0; padding:0; font-size:12px; line-height:18px; color:#71717a;"
                                                >
                                                    &copy; {{YEAR}} {{APP_NAME}}. All rights reserved.
                                                </p>

                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `
};


// Forgot Password OTP Email Data
export const forgotPasswordOtpEmailData = {

    subject: "Your Password Reset Verification Code — {{APP_NAME}}",

    text: `Hello {{NAME}},

        We received a request to reset the password for your {{APP_NAME}} account.

        Your password reset verification code is:

        {{OTP}}

        This verification code will expire in 15 minutes.

        For your security, please do not share this code with anyone.

        If you did not request a password reset, you can safely ignore this email. Your password will not be changed unless the verification process is completed.

        This is an automated message. Please do not reply to this email.

        Best regards,
        {{APP_NAME}} Team

        © {{YEAR}} {{APP_NAME}}. All rights reserved.`,

    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Password Reset Verification Code</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:Arial, Helvetica, sans-serif; color:#18181b;">

            <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%; margin:0; padding:0; background-color:#f4f4f5;"
            >
                <tr>
                    <td align="center" style="padding:40px 20px;">

                        <!-- Main Container -->
                        <table
                            role="presentation"
                            width="600"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="width:100%; max-width:600px; background-color:#ffffff;"
                        >
                            <tr>
                                <td style="padding:40px;">

                                    <!-- Heading -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <h1
                                                    style="margin:0 0 24px 0; padding:0; font-size:24px; line-height:32px; font-weight:600; color:#18181b;"
                                                >
                                                    Password Reset Verification Code
                                                </h1>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Greeting -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 16px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Hello {{NAME}},
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Introduction -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 16px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    We received a request to reset the password for your {{APP_NAME}} account.
                                                </p>

                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:15px; line-height:24px; color:#18181b;"
                                                >
                                                    Use the verification code below to continue with the password reset process:
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- OTP -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="margin:0 0 24px 0;"
                                    >
                                        <tr>
                                            <td align="center">

                                                <div
                                                    style="display:inline-block; padding:16px 28px; background-color:#f4f4f5; border:1px solid #e4e4e7; font-size:30px; line-height:36px; font-weight:700; letter-spacing:8px; color:#18181b;"
                                                >
                                                    {{OTP}}
                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Expiration -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 12px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    This verification code will expire in
                                                    <strong>15 minutes</strong>.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Security Notice -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td>
                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    For your security, please do not share this verification code with anyone.
                                                </p>

                                                <p
                                                    style="margin:0 0 24px 0; padding:0; font-size:14px; line-height:22px; color:#3f3f46;"
                                                >
                                                    If you did not request a password reset, you can safely ignore this email. Your password will not be changed unless the verification process is completed.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Divider -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td
                                                style="height:1px; line-height:1px; font-size:1px; background-color:#e4e4e7;"
                                            >
                                                &nbsp;
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Footer -->
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td style="padding-top:24px;">

                                                <p
                                                    style="margin:0 0 8px 0; padding:0; font-size:12px; line-height:18px; color:#71717a;"
                                                >
                                                    This is an automated message. Please do not reply to this email.
                                                </p>

                                                <p
                                                    style="margin:0; padding:0; font-size:12px; line-height:18px; color:#71717a;"
                                                >
                                                    &copy; {{YEAR}} {{APP_NAME}}. All rights reserved.
                                                </p>

                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `
};