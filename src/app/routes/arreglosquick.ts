import { Router } from "express";
import { arreglosmaricasrapidos } from "../controllers/labsController";

const routes = Router();

routes.get("/", arreglosmaricasrapidos);

export default routes;
