export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studyhub.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/quiz/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
