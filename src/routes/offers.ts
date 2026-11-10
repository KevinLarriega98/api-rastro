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

    if (listing.seller.id.equals(buyerId)) {
        res.status(400).json({ error: "No puedes ofertar por tu propio anuncio" });
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

router.patch("/:id", async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: "El id de la oferta no es válido" });
        return;
    }

    const body: unknown = req.body;
    if (!isRecord(body) || body.status !== "ACCEPTED") {
        res.status(400).json({ error: "status debe ser ACCEPTED" });
        return;
    }

    const offerId = new ObjectId(id);
    const offer = await offersCollection().findOne({ _id: offerId });
    if (!offer) {
        res.status(404).json({ error: "Oferta no encontrada" });
        return;
    }

    if (offer.status !== "PENDING") {
        res.status(409).json({ error: "La oferta ya no está pendiente" });
        return;
    }

    const updatedOffer = await offersCollection().findOneAndUpdate(
        { _id: offerId, status: "PENDING" },
        { $set: { status: "ACCEPTED" } },
        { returnDocument: "after" },
    );

    if (!updatedOffer) {
        res.status(409).json({ error: "La oferta ya no está pendiente" });
        return;
    }

    await listingsCollection().updateOne(
        { _id: offer.listing.id },
        { $set: { status: "RESERVED" } },
    );

    res.json(updatedOffer);
});

export default router;
