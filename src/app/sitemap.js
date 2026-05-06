export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studyhub.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // The internal dashboard and quizzes are not indexed since they require auth
  ];
}
