import { Router } from "express";
import apiRoutes from "./api";
import gameContentRoutes from "./gameContents";

export const registerRoutes = (app) => {
  app.use("/api", apiRoutes);
  app.use("/api/game", gameContentRoutes);
};
