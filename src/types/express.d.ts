import { UserModel } from "../generated/prisma/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
      csrfToken(): string;
    }
  }
}
