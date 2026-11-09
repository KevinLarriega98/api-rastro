import { Router } from "express";
import { listingsCollection } from "../db";
import { ObjectId } from "mongodb";

const router = Router();

const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

router.get("/", async (_req, res) => {
    const listings = await listingsCollection()
        .find()
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