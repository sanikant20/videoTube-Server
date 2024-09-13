import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // the one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,    // The one who is subcribed
        ref: "User"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)