module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'a1-generated.s3.us-east-1.amazonaws.com',
      'a1-generated-test.s3.amazonaws.com',
      'a1-generated.s3.amazonaws.com',
      'd26j0ayly12e8r.cloudfront.net',
      'image.civitai.com',
      "imagedelivery.net",
      "customer-9umgeogkb7wnnub8.cloudflarestream.com"
    ]
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
  }
};
