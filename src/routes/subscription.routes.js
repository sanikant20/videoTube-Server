import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getSubscriberListOfChannel,
    toggleSubscription,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";


const router = Router()
router.route(verifyJWT) //apply middleware to all routes

router
    .route("/channel/:channelId")
    .post(toggleSubscription)
    .get(getSubscriberListOfChannel)

router.route("/user/:subscriptionId").get(getSubscribedChannels)

export default router