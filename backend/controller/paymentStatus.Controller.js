const Order = require("../model/order.model");

const updatePaymentStatus = async (req ,res)=>{
    try{
        const {paymentStatus , paymentId} = req.body;

        const allowedStatuses = [
            "pending",
            "paid",
            "failed",
            "refunded"
        ];

        if(!paymentStatus || !allowedStatuses.includes(paymentStatus)){
            return res.status(400).json({
                message:"Invalied payment status"
            })
        }

        const order = await Order.findById(req.params.id);

        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }

        // payment flow
        const paymentFlow={
            pending : ['paid' , 'failed'],
            paid : ['refunded'],
            failed : [],
            refunded : [],
        };

        // Check whether status change is allowed
        if(!paymentFlow[order.paymentStatus].includes(paymentStatus)){
            return res.status(400).json({
                message: `Cannnot change payment status from ${order.paymentStatus} to ${paymentStatus}`
            })
        }

        order.paymentStatus = paymentStatus;

        // save payment Id if provided
        if(paymentId){
            order.paymentId = paymentId;
        }

        await order.save();

        return res.status(200).json({
            message:"Payment status Updated successfully",
            order
        })
    }catch(error){
        console.log("Updated payment status error: ",error);

        return res.status(500).json({
            message: "Error updating payment status",
            error: error.message,
        })
    }
}

module.exports = {updatePaymentStatus}