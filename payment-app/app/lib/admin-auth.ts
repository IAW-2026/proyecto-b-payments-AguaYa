export function verifyControlPlaneToken(request: Request): boolean {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  return !!process.env.CONTROL_PLANE_API_KEY && token === process.env.CONTROL_PLANE_API_KEY;
}
