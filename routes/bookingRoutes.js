const { default: mongoose } = require('mongoose');
const Booking=require('../modals/booking');
const router=require('express').Router();
const User=require('../modals/user');


router.post('/book', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, doctorId, date, slotId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Invalid userId or doctorId",
                success: false
            });
        }
        const currentDate = new Date();
        const queryDate = new Date(date);

        if (queryDate < currentDate.setHours(0, 0, 0, 0)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Invalid date. Date should be today or in the future.",
                success: false
            });
        }
        const booking = await Booking.create(
            [{
                user: userId,
                doctor: doctorId,
                date: queryDate,
                slot: slotId,
                status: "pending",
                isBooked: false
            }],
            { session: session }
        );
        await User.findByIdAndUpdate(userId, { $push: { bookings: booking[0]._id } }, { session: session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Booking successful",
            booking: booking[0], // Assuming single booking is created, extract first element
            success: true
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: "Failed to book appointment",
            error: error.message,
            success: false
        });
    }
});

//confirm booking from doctor side
router.put('/confirmBooking/:id',async(req,res)=>{
    try{
        const booking=await Booking.findByIdAndUpdate(req.params.id,{
            status:"approved",
            isBooked:true
        },{new:true});
        if(!booking){
            return res.status(404).json({
                message:"Booking not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Booking confirmed",
            booking:booking,
            success:true
        });
    }catch(e){
        return res.status(400).json({message:e.message});
    }
}
)

module.exports=router;