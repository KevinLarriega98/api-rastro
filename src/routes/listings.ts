import { Router } from "express";
import { listingsCollection, offersCollection, usersCollection } from "../db";
import { ObjectId, type Filter } from "mongodb";
import type { Listing } from "../types";

const router = Router();

const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

function isNonEmptyText(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

router.get("/:id/offers", async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "El id del anuncio no es válido" });
        return;
    }

    const listingId = new ObjectId(id);
    const listing = await listingsCollection().findOne({ _id: listingId });
    if (!listing) {
        res.status(404).json({ error: "Anuncio no encontrado" });
        return;
    }

    const offers = await offersCollection().find({ "listing.id": listingId }).toArray();
    res.json(offers);
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

router.post("/", async (req, res) => {
    const body: unknown = req.body;

    if (!isRecord(body)) {
        res.status(400).json({ error: "El body debe ser un objeto" });
        return;
    }

    if (
        !isNonEmptyText(body.title) ||
        !isNonEmptyText(body.description) ||
        !isNonEmptyText(body.category) ||
        !isNonEmptyText(body.city)
    ) {
        res.status(400).json({ error: "Falta un campo de texto obligatorio" });
        return;
    }

    if (
        typeof body.price !== "number" ||
        !Number.isFinite(body.price) ||
        body.price < 0
    ) {
        res.status(400).json({ error: "price debe ser un número mayor o igual que 0" });
        return;
    }

    if (typeof body.sellerId !== "string" || !ObjectId.isValid(body.sellerId)) {
        res.status(400).json({ error: "sellerId no tiene un formato válido" });
        return;
    }

    const seller = await usersCollection().findOne({
        _id: new ObjectId(body.sellerId),
    });

    if (!seller) {
        res.status(400).json({ error: "No existe ningún usuario con ese sellerId" });
        return;
    }

    const attributes = body.attributes;
    if (attributes !== undefined && !isRecord(attributes)) {
        res.status(400).json({ error: "attributes debe ser un objeto" });
        return;
    }

    const listing: Listing = {
        title: body.title,
        description: body.description,
        price: body.price,
        category: body.category,
        city: body.city,
        status: "AVAILABLE",
        publishedAt: new Date(),
        views: 0,
        seller: { id: new ObjectId(body.sellerId), name: seller.name },
        photos: [],
        attributes: attributes ?? {},
    };

    const result = await listingsCollection().insertOne(listing);
    res.status(201).json({ _id: result.insertedId, ...listing });
});

router.patch("/:id", async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "El id del anuncio no es válido" });
        return;
    }

    const body: unknown = req.body;

    if (!isRecord(body)) {
        res.status(400).json({ error: "El body debe ser un objeto" });
        return;
    }

    if (
        typeof body.price !== "number" ||
        !Number.isFinite(body.price) ||
        body.price < 0
    ) {
        res.status(400).json({ error: "price debe ser un número mayor o igual que 0" });
        return;
    }

    const listing = await listingsCollection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { price: body.price } },
        { returnDocument: "after" },
    );

    if (!listing) {
        res.status(404).json({ error: "Anuncio no encontrado" });
        return;
    }

    res.json(listing);
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "El id del anuncio no es válido" });
        return;
    }

    const result = await listingsCollection().deleteOne({
        _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
        res.status(404).json({ error: "Anuncio no encontrado" });
        return;
    }

    res.status(204).send();
});

export default router;
