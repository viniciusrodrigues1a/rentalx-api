import express, { Response } from "express";
import "express-async-errors";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";

import "./database";
import { AppError } from "./errors/AppError";
import { router } from "./routes";
import "./shared/container";
import swaggerConfig from "./swagger.json";

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.use(router);

app.use((err: Error, _, response: Response, __) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({ message: err.message });
  }

  return response.status(500).json({
    status: "error",
    message: `Internal server error - ${err.message}`,
  });
});

app.listen(3333, () => console.log("Server is running"));
