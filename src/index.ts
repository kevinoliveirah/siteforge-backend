import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { aiService } from "./services/aiservice";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const projectSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  description: z.string().optional(),
  objective: z.string().optional(),
  audience: z.string().optional(),
  style: z.string().optional(),
  frontend: z.string().optional(),
  styling: z.string().optional(),
  backend: z.string().optional(),
  database: z.string().optional(),
  language: z.string().optional(),
  primaryColor: z.string().optional(),
});

// Middleware para verificar token
const authenticate = (req: any, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Routes

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "SiteForge API is running!" });
});

// Register
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email já registrado" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
app.get("/api/users/me", authenticate, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all projects for user
app.get(
  "/api/projects",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const projects = await prisma.project.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: "desc" },
      });

      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Create project
app.post(
  "/api/projects",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const data = projectSchema.parse(req.body);

      const project = await (prisma.project as any).create({
        data: {
          ...data,
          userId: req.userId,
        },
      });

      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get project by id
app.get(
  "/api/projects/:id",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });

      if (!project || project.userId !== req.userId) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update project
app.put(
  "/api/projects/:id",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });

      if (!project || project.userId !== req.userId) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }

      const data = projectSchema.partial().parse(req.body);

      const updated = await (prisma.project as any).update({
        where: { id: req.params.id },
        data,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete project
app.delete(
  "/api/projects/:id",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });

      if (!project || project.userId !== req.userId) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }

      await prisma.project.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Projeto deletado" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Generate site with AI
app.post(
  "/api/projects/:id/generate",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });

      if (!project || project.userId !== req.userId) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }

      // Preparar prompt rico
      const richPrompt = `
        Projeto: ${project.name}.
        Objetivo: ${project.objective}.
        Público: ${project.audience}.
        Stack: ${project.frontend}, ${project.styling}, ${project.backend}, ${project.database}.
        Cores: ${project.primaryColor}.
      `;
      
      // Gerar código
      const generatedCode = await aiService.generateSite(
        richPrompt, 
        project.type, 
        project.style || "Moderno"
      );

      // Salvar
      const updated = await (prisma.project as any).update({
        where: { id: project.id },
        data: {
          generatedCode,
          status: "generated"
        }
      }) as any;
      console.log("[GENERATION] Projeto atualizado no banco de dados.");

      res.json(updated);
    } catch (error: any) {
      console.error("[GENERATION ERROR]", error);
      res.status(500).json({ error: error.message || "Erro ao gerar site" });
    }
  }
);

// Refine site with AI
app.post(
  "/api/projects/:id/refine",
  authenticate,
  async (req: any, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });

      if (!project || project.userId !== req.userId || !project.generatedCode) {
        return res.status(404).json({ error: "Projeto ou código não encontrado" });
      }

      const { prompt: adjustmentPrompt } = req.body;
      if (!adjustmentPrompt) {
        return res.status(400).json({ error: "Prompt de ajuste é obrigatório" });
      }

      const updatedCode = await aiService.refineSite(
        project.generatedCode,
        adjustmentPrompt
      );

      const updated = await (prisma.project as any).update({
        where: { id: project.id },
        data: {
          generatedCode: updatedCode,
          status: "refined"
        }
      }) as any;

      res.json(updated);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Erro ao refinar site" });
    }
  }
);

// Start server
app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});
