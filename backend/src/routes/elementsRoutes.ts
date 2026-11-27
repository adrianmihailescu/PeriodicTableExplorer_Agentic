import { Router } from "express";
import {
  getElement,
  getElementMarketData,
  getElements,
  getMarketCoverage,
  researchElementDetails,
} from "../controllers/elementsController.js";

const router = Router();

router.get("/", getElements);
router.get("/market-coverage", getMarketCoverage);
router.get("/:atomicNumber/research", researchElementDetails);
router.get("/:atomicNumber/market", getElementMarketData);
router.get("/:atomicNumber", getElement);

export default router;
