import { Router } from "express";
import { getElement, getElements, researchElementDetails } from "../controllers/elementsController.js";

const router = Router();

router.get("/", getElements);
router.get("/:atomicNumber/research", researchElementDetails);
router.get("/:atomicNumber", getElement);

export default router;
