import { Router } from "express";
import { getElement, getElementMarketData, getElements, researchElementDetails } from "../controllers/elementsController.js";

const router = Router();

router.get("/", getElements);
router.get("/:atomicNumber/research", researchElementDetails);
router.get("/:atomicNumber/market", getElementMarketData);
router.get("/:atomicNumber", getElement);

export default router;
