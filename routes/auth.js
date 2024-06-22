const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../modals/user.js');
const router = express.Router();
const transporter = require('../service/mailService.js');
const JWT_SECRET = process.env.JWT_SECRET;
const Otp = require('../modals/userOtp.js');
//send otp
router.post('/sendotp', async (req, res) => {
    const user=await User.find({ email: req.body.email})
    if(user.length>0){
        return res.status(400).json({
            success: false,
            error: "User already exists",
            message: "User already exists"
        })
    }
    try {
        const { email } = req.body;
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000;
        const option = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "OTP for Registeration",
            text: "Your OTP is " + otp + " and it will expire in 5 minutes"
        }
        transporter.sendMail(option, async (error, info) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    error: error,
                    message: "Internal Server Error"
                })
            }
            await Otp.create({
                otp: otp,
                otpExpires: otpExpires,
                email: email,

            })

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully"
            })
        })
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e,
            message: "Internal Server Error"
        })
    }
})



router.post('/signup', async (req, res) => {
    const { firstname, lastname, email, password, mobileNumber } = req.body;
    try {
        let user = await User.find({ email: email });


        if (user != null && user.length > 0) {
            return res.status(400).json({
                success: false,
                error: "User already exists",
                message: "User already exists"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await User.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            mobileNumber: mobileNumber,
            address: "update your address",

        })
        const token = jwt.sign({ user_id: user._id, user_role: user.role }, JWT_SECRET, { expiresIn: '1d' });


        return res.status(200).json({
            success: true,
            message: "User created successfully",
            token: token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                mobileNumber: user.mobileNumber,
                address: user.address,
                role: user.role
            }
        })


    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e,
            message: "Internal Server Error"
        })
    }
})

//login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "Please enter all the fields",
            message: "Please enter all the fields"
        })
    }
    try {
        let user = await User.findOne({ email });
        if (user.isBlocked) {
            return res.status(400).json({
                success: false,
                error: "User is blocked",
                message: "User is blocked"
            })
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "User does not exists Create an account",
                message: "User does not exists Create an account"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: "Invalid Credentials",
                message: "Invalid Credentials"
            })
        }
        const token = jwt.sign({ user_id: user._id, user_role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     maxAge: 72 * 60 * 60 * 1000,
        //     });
        let wishlist = []
        for (let i = 0; i < user.wishlist.length; i++) {

            let product = await Product.findById(user.wishlist[i].toString())
            wishlist.push(product)
        }
        let products = []
        let cart = await Cart.findOne({ orderby: user._id })
        if (cart) {
            for (let i = 0; i < cart.products.length; i++) {
                const prod = await Product.findById(cart.products[i].product.toString());
                products.push({
                    _id: prod._id,
                    title: prod.title,
                    price: prod.price,
                    description: prod.description,
                    brand: prod.brand,
                    images: prod.images,
                    categoryName: prod.categoryName,

                })
            }
        }
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                mobileNumber: user.mobileNumber,
                address: user.address,
                role: user.role,
                wishlist: wishlist,
                products: products,
                cartTotal: cart ? cart.cartTotal : 0,
                totalAfterDiscount: cart ? cart.totalAfterDiscount : 0

            }
        })

    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e,
            message: "Internal Server Error"
        })
    }
})
router.get('/logout', async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    })
})

router.post('/googleauth', async (req, res) => {
    const { email, name, avatar } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            error: "Please enter all the fields",
            message: "Please enter all the fields"
        })
    }
    try {
        const user = await User.findOne({ email: email });
        if (user.isBlocked) {
            return res.status(400).json({
                success: false,
                error: "User is blocked",
                message: "User is blocked"
            })
        }
        if (user) {
            const token = jwt.sign({ user_id: user._id, user_role: user.role }, JWT_SECRET, { expiresIn: '1d' });
            let wishlist = []
            for (let i = 0; i < user.wishlist.length; i++) {
                let product = await product.findById(user.wishlist[i])
                wishlist.push(product)
            }
            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                token: token,
                user: {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    address: user.address,
                    role: user.role,
                    wishlist: wishlist
                }
            })
        } else {
            const salt = await bcrypt.genSalt(10);
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);
            const user = await User.create({
                firstname: name,
                lastname: name,
                address: "update your address",
                email: email,
                password: hashedPassword,

            })
            const token = jwt.sign({ user_id: user._id, user_role: user.role }, JWT_SECRET, { expiresIn: '1d' });
            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                token: token,
                user: {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    address: user.address,
                    role: user.role,
                    wishlist: user.wishlist
                }
            })
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            error: e,
            message: "Internal Server Error"
        })

    }
})
