export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();

    // Read the secret token from Cloudflare environment variables
    const pinataJwt = context.env.PINATA_SECRET_JWT;
    if (!pinataJwt) {
      return new Response(
        JSON.stringify({ error: "PINATA_SECRET_JWT environment variable is not configured." }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Call Pinata's pinning API
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${pinataJwt}`
      },
      body: JSON.stringify({
        pinataContent: payload,
        pinataMetadata: {
          name: "vaultone-encrypted-secret",
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Pinata API error: ${errText}` }),
        { 
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const resData = await response.json();
    
    // Return Pinata's response (which contains the IPFS Hash/CID)
    return new Response(
      JSON.stringify({ cid: resData.IpfsHash }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
