const router= require('express').Router();
const Category = require('../modals/category');


router.post('/create',async(req,res)=>{
    try{
        const {name,description,image}=req.body;
        const category =await Category.create({
            name,
            description,
            image
        })
        res.status(200).json({
            message:"Category created successfully",
            category:category,
            success:true
        });
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        });

    }
})
router.get("/all",async(req,res)=>{
    try{
        const categories=await Category.find({});
        res.status(200).json({
            message:"All categories",
            categories:categories,
            success:true
        });
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        });
    }
})
module.exports=router;