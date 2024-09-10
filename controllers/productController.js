import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from '../models/orderModel.js'
import slugify from "slugify";
import fs from 'fs';
import braintree from "braintree";
import dotenv from 'dotenv'

dotenv.config()

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res, next) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        // Validation
        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!description) return res.status(400).json({ error: 'Description is required' });
        if (!price || isNaN(price)) return res.status(400).json({ error: 'Valid price is required' });
        if (!category) return res.status(400).json({ error: 'Category is required' });
        if (!quantity || isNaN(quantity)) return res.status(400).json({ error: 'Valid quantity is required' });
        if (photo && photo.size > 1000000) {
            return res.status(400).json({ error: "Photo should be less than 1MB" });
        }

        // Create new product
        const product = new productModel({
            name,
            slug: slugify(name),
            description,
            price,
            category,
            quantity,
            shipping: shipping === 'true' ? true : (shipping === 'false' ? false : Boolean(shipping)), // Handle various cases
        });

        // Handle photo if exists
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        });

    } catch (error) {
        console.error(error);
        next(error); // Pass error to the centralized error handler
    }
};

export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            message: "All Products",
            products,
            totalCount: products.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message:
                "Something Went Wrong",

        })
    }
}

export const getSingleProductController = async (req, res) => {
    try {
        const products = await productModel.findOne({ slug: req.params.slug }).select("-photo").populate('category')
        res.status(200).send({
            success: true,
            message: "Single  Product Fetched",
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong"
        })
    }
}


export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo");
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found",
            });
        }
        if (product.photo && product.photo.data) {
            res.set('Content-Type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        } else {
            return res.status(404).send({
                success: false,
                message: "Photo not found",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const deleteProductcontroller = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success: true,
            message: "Product Deleted Successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
        });
    }
}
export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        // Validation
        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!description) return res.status(400).json({ error: 'Description is required' });
        if (!price) return res.status(400).json({ error: 'Price is required' });
        if (!category) return res.status(400).json({ error: 'Category is required' });
        if (!quantity) return res.status(400).json({ error: 'Quantity is required' });
        if (photo && photo.size > 1000000) {
            return res.status(400).json({ error: "Photo is required and should be less than 1MB" });
        }

        // Create new product
        const product = await productModel.findByIdAndUpdate(req.params.pid,
            { ...req.fields, slug: slugify(name) }, { new: true }
        )

        // Handle photo if exists
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        });

    } catch (error) {
        console.error(error);
        next(error); // Pass error to the centralized error handler
    }
}
export const productFiltersController = async (req, res) => {
    try {
        const { checked, radio } = req.body
        let args = {};

        if (checked.length > 0) args = { ...args, category: checked };

        if (radio.length > 0) {
            args = { ...args, price: { $gte: radio[0], $lte: radio[1] } };
        }
        const products = await productModel.find(args).select("-photo").populate('category');
        res.status(200).send({
            success: true,
            message: "All Products Fetched",
            products
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error while filtering products',
            error
        })
    }
}


export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success: true,
            total,
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }

}

export const productListController = async (req, res) => {
    try {
        const perPage = 10;
        const page = req.params.page ? parseInt(req.params.page) : 1;
        const skipCount = (page - 1) * perPage; // Correctly skip the products from previous pages

        const products = await productModel
            .find({})
            .select('-photo')
            .skip(skipCount) // Skip already fetched products
            .limit(perPage)  // Limit to perPage
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
export const searchController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const result = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ]
        }).select("-photo")
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error in search",
            error
        });
    }
};


export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid },
        }).select("-photo").limit(5).populate("category");

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error in fetching related products",
            error,
        });
    }
};

export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        const product = await productModel.find({ category }).populate('category')
        res.status(200).send({
            success: true,
            message: "success",
            category,
            product
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error while fetching product category",
            error
        })
    }
}

export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(response)
            }
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error while fetching product category",
            error
        })
    }
}

export const braintreePaymentsController = async (req, res) => {
    try {
        const { cart, nonce } = req.body
        let total = cart.reduce((sum, item) => sum + item.price, 0)

        gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, async function (err, result) {
            if (result) {
                const order = new orderModel({
                    products: cart,
                    payment: result,
                    buyer: req.user._id
                })
                await order.save()
                res.json({ ok: true })
            } else {
                res.status(500).send(err)
            }
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error while processing payment",
            error
        })
    }
}