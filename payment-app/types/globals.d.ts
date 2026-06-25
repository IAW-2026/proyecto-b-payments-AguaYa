export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      roles?: string[];
      lastRole?: "buyer" | "seller";
    };
  }

}
