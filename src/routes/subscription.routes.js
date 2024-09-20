import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getMyChannelSubscriberList,
    toggleSubscription,
    getChannelListToWhomISubscribed
} from "../controllers/subscription.controller.js";


const router = Router()
router.use(verifyJWT) //apply middleware to all routes

router.route("/toggle-subscription/:channelId").post(toggleSubscription)
router.route("/subscribers").get(getMyChannelSubscriberList)
router.route("/channels").get(getChannelListToWhomISubscribed)

export default router