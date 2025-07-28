import { generateSecretKey, getPublicKey, finalizeEvent, nip04, nip19 } from "nostr-tools"

export async function sendNostrDM(recipientNpub: string, message: string, relays: string[] = []) {
  try {
    // Generate a temporary key pair for this message
    const senderPrivateKey = generateSecretKey()
    const senderPublicKey = getPublicKey(senderPrivateKey)

    // Decode recipient npub to hex
    let recipientPubkeyHex: string
    try {
      if (recipientNpub.startsWith("npub")) {
        const decoded = nip19.decode(recipientNpub)
        if (decoded.type === "npub") {
          recipientPubkeyHex = decoded.data
        } else {
          throw new Error("Invalid npub format")
        }
      } else {
        recipientPubkeyHex = recipientNpub
      }
    } catch (error) {
      throw new Error("Failed to decode recipient npub")
    }

    // Encrypt the message
    const encryptedMessage = await nip04.encrypt(senderPrivateKey, recipientPubkeyHex, message)

    // Create the DM event (kind 4)
    const dmEvent = finalizeEvent(
      {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", recipientPubkeyHex]],
        content: encryptedMessage,
      },
      senderPrivateKey,
    )

    // Send to relays
    const defaultRelays = ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine", "wss://nos.lol"]

    const relaysToUse = relays.length > 0 ? relays : defaultRelays
    const publishPromises = relaysToUse.map(async (relayUrl) => {
      try {
        const ws = new WebSocket(relayUrl)

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            ws.close()
            reject(new Error(`Timeout connecting to ${relayUrl}`))
          }, 10000)

          ws.onopen = () => {
            clearTimeout(timeout)
            // Send the event
            ws.send(JSON.stringify(["EVENT", dmEvent]))

            // Close after a short delay
            setTimeout(() => {
              ws.close()
              resolve()
            }, 1000)
          }

          ws.onerror = (error) => {
            clearTimeout(timeout)
            ws.close()
            reject(new Error(`Failed to connect to ${relayUrl}`))
          }

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data)
              if (data[0] === "OK" && data[1] === dmEvent.id) {
                if (data[2] === true) {
                  console.log(`Message successfully sent to ${relayUrl}`)
                } else {
                  console.warn(`Message rejected by ${relayUrl}:`, data[3])
                }
              }
            } catch (error) {
              console.warn(`Error parsing response from ${relayUrl}:`, error)
            }
          }
        })
      } catch (error) {
        console.error(`Error with relay ${relayUrl}:`, error)
        throw error
      }
    })

    // Wait for at least one relay to succeed
    try {
      await Promise.any(publishPromises)
      console.log("Message sent successfully to at least one relay")
    } catch (error) {
      // If all relays fail, try to get partial success
      const results = await Promise.allSettled(publishPromises)
      const successful = results.filter((result) => result.status === "fulfilled")

      if (successful.length === 0) {
        throw new Error("Failed to send message to any relay")
      } else {
        console.log(`Message sent to ${successful.length}/${relaysToUse.length} relays`)
      }
    }

    return {
      success: true,
      eventId: dmEvent.id,
      senderPubkey: senderPublicKey,
    }
  } catch (error) {
    console.error("Error sending Nostr DM:", error)
    throw error
  }
}
