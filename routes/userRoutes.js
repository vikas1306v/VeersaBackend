const express = require('express');
const User = require('../modals/user.js');
const router = express.Router();


router.put("/update/:id", async (req, res) => {
    const { mobileNumber,name,expoToken,profileImage, address, longitude,lattitude } = req.body;
    try{
        const user=await User
        .findByIdAndUpdate(req.params.id,{
            mobileNumber:mobileNumber,
            name:name,
            profileImage:profileImage,
            address:address,
            longitude:longitude,
            lattitude:lattitude,
            expoToken:expoToken
        },{new:true});
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"User updated successfully",
            user:user,
            success:true
        });
    }catch(error){
        return res.status(400).json({message:error.message});
    }
});


router.get('/findNearestDoctors', async (req, res) => {
    const { longitude, latitude, categoryId } = req.query;

    try {
        if (!longitude || !latitude || !categoryId) {
            return res.status(400).json({
                message: "Longitude, latitude, and categoryId are required",
                success: false
            });
        }
        const parsedLongitude = parseFloat(longitude);
        const parsedLatitude = parseFloat(latitude);
        const nearestDoctors = await Doctor.find({
            categoryId: categoryId,
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parsedLongitude, parsedLatitude]
                    }
                }
            }
        }).sort({ location: 'asc' }); 

        if (!nearestDoctors || nearestDoctors.length === 0) {
            return res.status(404).json({
                message: "No doctors found near the specified location and category",
                success: false
            });
        }

        return res.status(200).json({
            message: "Nearest doctors found successfully",
            doctors: nearestDoctors,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to find nearest doctors",
            error: error.message,
            success: false
        });
    }
});


module.exports = router;