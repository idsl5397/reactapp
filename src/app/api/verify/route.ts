import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'

const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
// const secret = process.env.NODE_ENV === "development"
//     ? "1x00000000000000000000AA"
//     : '0x4AAAAAABA44gNc3NqsoRehU2sCGN2LbjA';


const secret = '0x4AAAAAABBGGK34l6tBNwjIvSnP1JVXfaY';

export async function POST(request: Request) {
    const { token } = (await request.json()) as { token: string }
    const res = await fetch(verifyEndpoint, {
        method: 'POST',
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    })
    const data = (await res.json()) as TurnstileServerValidationResponse
    return new Response(JSON.stringify(data), {
        status: data.success ? 200 : 400,
        headers: {
            'content-type': 'application/json'
        }
    })
}