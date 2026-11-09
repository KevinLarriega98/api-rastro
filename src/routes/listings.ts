import { Router } from "express";
import { listingsCollection } from "../db";
import { ObjectId, type Filter } from "mongodb";
import type { Listing } from "../types";

const router = Router();

const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

router.get("/", async (req, res) => {
    const filter: Filter<Listing> = {};

    if (typeof req.query.category === "string") {
        filter.category = req.query.category;
    }

    if (typeof req.query.city === "string") {
        filter.city = req.query.city;
    }

    if (req.query.maxPrice !== undefined) {
        const rawMaxPrice = req.query.maxPrice;

        if (typeof rawMaxPrice !== "string" || rawMaxPrice.trim() === "") {
            res.status(400).json({ error: "maxPrice debe ser un número" });
            return;
        }

        const maxPrice = Number(rawMaxPrice);

        if (!Number.isFinite(maxPrice)) {
            res.status(400).json({ error: "maxPrice debe ser un número" });
            return;
        }

        filter.price = { $lte: maxPrice };
    }

    const listings = await listingsCollection()
        .find(filter)
        .project(LIST_FIELDS)
        .sort({ publishedAt: -1 })
        .toArray();

    res.json(listings);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "El id del anuncio no es válido" });
        return;
    }

    const listing = await listingsCollection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 } },
        { returnDocument: "after" },
    );

    if (!listing) {
        res.status(404).json({ error: "Anuncio no encontrado" });
        return;
    }

    res.json(listing);
});

export default router;