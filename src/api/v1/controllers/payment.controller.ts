import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import axios from "axios";
import { sendSuccess } from "../../../utils/response";
import { AppError } from "../../../utils/AppError";
import { prisma } from "../../../lib/prisma";


const COMMISSION_PERCENT = parseFloat(process.env.COMMISSION_PERCENT || "5");


const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
};

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const { email, amount, metadata } = req.body;

    const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
            email,
            amount: amount * 100, // in kobo
            metadata,
        },
        { headers }
    );

})

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {

    const { reference } = req.params;

    try {
        const { data } = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers }
        );

        if (data?.status && data?.data?.status === "success") {

            sendSuccess(res, {
                message: "Payment verified successfully",
                data: data.data,
                statusCode: 200,
            });
        }

        throw new AppError("Payment verification failed", 400, "BAD_REQUEST");
    } catch (error) {
        throw new AppError("Payment verification failed", 400, "BAD_REQUEST");
    }

})

export const transferToAgent = asyncHandler(async (req: Request, res: Response) => {
    const { amount, account_number, bank_code, email } = req.body;

    if (!amount || !account_number || !bank_code || !email) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const amountInKobo = amount * 100;
    const commission = (COMMISSION_PERCENT / 100) * amountInKobo;
    const amountToTransfer = amountInKobo - commission;

    try {
        const recipientRes = await axios.post(
            "https://api.paystack.co/transferrecipient",
            {
                type: "nuban",
                name: email,
                account_number,
                bank_code,
                currency: "NGN",
            },
            { headers }
        );

        if (!recipientRes.data || !recipientRes.data.data || !recipientRes.data.data.recipient_code) {
            throw new AppError("Failed to create transfer recipient", 500, "INTERNAL_SERVER_ERROR");
        }

        const recipientCode = recipientRes.data.data.recipient_code;

        const transferRes = await axios.post(
            "https://api.paystack.co/transfer",
            {
                source: "balance",
                amount: Math.floor(amountToTransfer),
                recipient: recipientCode,
                reason: "Property Payment Payout",
            },
            { headers }
        );

        if (!transferRes.data || !transferRes.data.data) {
            throw new AppError("Failed to initiate transfer", 500, "INTERNAL_SERVER_ERROR");
        }

        sendSuccess(res, {
            message: "Transfer initiated successfully",
            data: transferRes.data.data,
            statusCode: 200,
        });
    } catch (error) {
        throw new AppError("Failed to initiate transfer", 500, "INTERNAL_SERVER_ERROR");
    }
})
