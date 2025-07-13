import { Router } from "express";
import { BasicInformation, DashboardStats, LectureStats, WordStats } from "../controllers/statisticsController";

const routes = Router();

routes.get("/", BasicInformation);
routes.get("/dashboard", DashboardStats);
routes.get("/lectures", LectureStats);
routes.get("/words", WordStats);

export default routes;
