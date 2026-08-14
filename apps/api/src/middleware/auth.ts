import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../utils/jwt";
import { Role } from "@prisma/client";

// Extend Express Request interface to hold auth payload
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}


// agar shi JWT token h toh req.user m data return krdeta h else 401 error dega
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {  // ya toh authheader ho hi na ya bearer se start na hota ho 

      return res.status(401).json({ message: "Authentication token missing or invalid format" });
    }

    const token = authHeader.split(" ")[1]; // bearer k baad ka token pick krlo 
    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your login session has expired. Please log in again." });
  }
}



export function requireRole(allowedRoles: Role | Role[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: requires role hierarchy of [${roles.join(", ")}]`,
      });
    }

    next();
  };
}
