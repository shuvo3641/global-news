import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { createContactMessage, deleteContactMessage, getContactMessages, getSingleContactMessage, markContactMessageAsRead } from "./contact.controller.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";

// Router
const router = express.Router()



// Get Contact Messages
router.get("/",
    verifyAuth,
    authorizedRoles("ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 30, "GET_CONTACT_MESSAGES"),
    getContactMessages
) 


// Create Contact Message
router.post("/", 
    verifyAuth, 
    authorizedRoles("USER", "JOURNALIST", "EDITOR", "MODERATOR"), 
    rateLimiter(3600, 5, "CREATE_CONTACT_MESSAGE"),
    createContactMessage
)


// Delete Contact Message
router.delete("/:contactMessageId",
    verifyAuth, 
    authorizedRoles("ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 5, "DELETE_CONTACT_MESSAGE"),
    deleteContactMessage
)


// Mark Contact Message As Read
router.patch("/:contactMessageId/read",
    verifyAuth,
    authorizedRoles("ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 20, "MARK_CONTACT_READ"),
    markContactMessageAsRead
)


// Get Single Contact Message
router.get("/:contactMessageId",
    verifyAuth, 
    authorizedRoles("ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 30, "GET_SINGLE_CONTACT_MESSAGE"),
    getSingleContactMessage
)








export const contactRouter = router;