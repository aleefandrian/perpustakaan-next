export async function GET() {
  return Response.json({
    app: "Libra Library Management System",
    version: "2.4 Pro",
    status: "Online",
  });
}
