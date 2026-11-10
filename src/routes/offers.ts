import { Router } from "express";
import { ObjectId } from "mongodb";
import { listingsCollection, offersCollection, usersCollection } from "../db";
import type { Offer } from "../types";

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

router.post("/", async (req, res) => {
    const body: unknown = req.body;

    if (!isRecord(body)) {
        res.status(400).json({ error: "El body debe ser un objeto" });
        return;
    }

    if (
        typeof body.listingId !== "string" ||
        !ObjectId.isValid(body.listingId) ||
        typeof body.buyerId !== "string" ||
        !ObjectId.isValid(body.buyerId)
    ) {
        res.status(400).json({ error: "listingId y buyerId deben ser ObjectId válidos" });
        return;
    }

    if (
        typeof body.amount !== "number" ||
        !Number.isFinite(body.amount) ||
        body.amount <= 0
    ) {
        res.status(400).json({ error: "amount debe ser un número mayor que 0" });
        return;
    }

    const listingId = new ObjectId(body.listingId);
    const buyerId = new ObjectId(body.buyerId);

    const listing = await listingsCollection().findOne({ _id: listingId });
    if (!listing) {
        res.status(400).json({ error: "No existe ningún anuncio con ese listingId" });
        return;
    }

    const buyer = await usersCollection().findOne({ _id: buyerId });
    if (!buyer) {
        res.status(400).json({ error: "No existe ningún usuario con ese buyerId" });
        return;
    }

    if (listing.status !== "AVAILABLE") {
        res.status(409).json({ error: "El anuncio no está disponible para recibir ofertas" });
        return;
    }

    const offer: Offer = {
        amount: body.amount,
        status: "PENDING",
        createdAt: new Date(),
        listing: { id: listingId, title: listing.title, price: listing.price },
        buyer: { id: buyerId, name: buyer.name },
    };

    const result = await offersCollection().insertOne(offer);
    res.status(201).json({ _id: result.insertedId, ...offer });
});

export default router;
