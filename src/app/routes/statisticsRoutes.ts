import { Router } from "express";
import { BasicInformation } from "../controllers/statisticsController";

const routes = Router();

routes.get("/", BasicInformation);

export default routes;
