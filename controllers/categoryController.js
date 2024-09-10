import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(401).send({ message: "Name is required" });
        }
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(200).send({
                success: true,
                message: "Category Already exists",
            });
        }
        const category = await new categoryModel({ name, slug: slugify(name) }).save();
        res.status(201).send({
            success: true,
            message: "New Category Created",

            category,
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


export const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        if (!name) {
            return res.status(401).send({ message: "Name is required" });
        }

        const category = await categoryModel.findByIdAndUpdate(id, { name, slug: slugify(name) }, { new: true });
        res.status(200).send({
            success: true,
            message: "Category Updated Successfully",
            category
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
}
export const getAllCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        res.status(200).send({
            success: true,
            message: "All Categories List",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
}

export const getCategoryController = async (req, res) => {
    try {

        const category = await categoryModel.findOne({ slug: req.params.slug })
        res.status(200).send({
            success: false,
            message: "Single Category",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
}

export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params
        const category = await categoryModel.findByIdAndDelete(id)
        res.status(200).send({
            success: true,
            message: "Delete Successfully",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
}