export async function GET() {
  const adsTxtContent = `google.com, pub-9123438903601975, DIRECT, f08c47fec0942fa0

# HopPhim - Phim hay cả hộp
# This file verifies your ownership of the site for Google AdSense
# Replace pub-XXXXXXXXXXXXXXXX with your actual AdSense publisher ID

# Additional ad networks (optional)
# example.com, 12345, DIRECT, f08c47fec0942fa0`;

  return new Response(adsTxtContent, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
