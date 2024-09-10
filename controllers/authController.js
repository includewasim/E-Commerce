import { comparePassword, hashPassword } from '../helpers/authHelper.js'
import userModel from '../models/userModels.js'
import orderModel from '../models/orderModel.js'
import JWT from 'jsonwebtoken'

//REGISTER
export const registerContoller = async (req, res) => {
    try {
        const { name, email, password, phone, address, question } = req.body

        //VALIDATION
        if (!name) {
            return res.send({
                message: 'Name is required'
            })
        }
        if (!email) {
            return res.send({
                message: 'E-mail is required'
            })
        }
        if (!password) {
            return res.send({
                message: 'Password is required'
            })
        }
        if (!phone) {
            return res.send({
                message: 'Phone is required'
            })
        }
        if (!address) {
            return res.send({
                message: 'Address is required'
            })
        }
        if (!question) {
            return res.send({
                message: 'Answer is required'
            })
        }

        //Existing User
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(200).send({
                success: true,
                message: 'Already Registered Please Login'
            })
        }

        const hashedPassword = await hashPassword(password)

        const user = await new userModel({ name, email, phone, address, password: hashedPassword, question }).save()
        res.status(201).send({
            success: true,
            message: 'User registration successfully',
            user
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error in register",
            error
        })
    }

}


export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Invalid Email or Password"
            })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            })
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password"
            })
        }

        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({
            success: true,
            message: 'Login Sucessfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error in Login",
            error
        })
    }
}

//FORGOT PASSWORD
export const forgotPasswordController = async (req, res) => {
    try {
        // Destructure the request body correctly as an object
        const { email, question, newPassword } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }
        if (!question) {
            return res.status(400).send({ message: "Security question answer is required" });
        }
        if (!newPassword) {
            return res.status(400).send({ message: "New Password is required" });
        }

        // Find user by email and security question answer
        const user = await userModel.findOne({ email, question });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Wrong Email or Security Answer'
            });
        }

        // Hash the new password and update the user
        const hashedPassword = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

        // Respond with success
        res.status(200).send({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Something went wrong',
            error
        });
    }
};

export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body
        const user = await userModel.findById(req.user._id)
        if (password && password.length < 6) {
            return res.json({ error: "Password must be at least 6 characters long" })
        }
        const hashedPassword = password ? await hashPassword(password) : undefined
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, { name: name || user.name, password: hashedPassword || user.password, phone: phone || user.phone, address: address || user.address }, { new: true })
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updatedUser
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Something went wrong',
            error
        });
    }
}

export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id })
            .populate('products', '-photo')
            .populate('buyer', 'name')
            .sort({ createdAt: -1 }) // Add this line to sort by most recent first
        res.json(orders)
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching orders',
            error
        });
    }
}

export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .populate('products', '-photo')
            .populate('buyer', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching orders',
            error
        });
    }
};


export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error fetching orders',
            error
        });
    }
}