const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const axios = require('axios')
const { defineSecret } = require('firebase-functions/params')

const BEAUTIFY_GPT_REQUESTS = {
    PLAIN: `Given the following text, please write a more polished and professional version of it.
    Keep the text concise and to the point, while keeping it in the same language as the input text.
    Do not translate, modify, or change the language of the provided text.
    Do not change the context.`,
    EMAIL: `Given the following text, please write a formal and professional email that maintains the original meaning, tone, and context.
    Keep the text concise and to the point, while keeping it in the same language as the input text.
    Do not translate, modify, or change the language of the provided text.
    Do not change the context.`,
    PRODUCT_DESCRIPTION: `Given the following text, please write a concise and informative product description that maintains the original meaning, tone, and context.
    If the text is already a product description, please enhance it to make it more appealing and informative.
    Keep the text concise and to the point, while keeping it in the same language as the input text.
    Do not translate, modify, or change the language of the provided text.
    Do not change the context.`,
}

const BEAUTIFY_ADDITONS = {
    FORMAT_AS_HTML: `Given the result, please format it as HTML code to be ready for implementation inside existing html page. Use inline styling. Return only raw HTML code.`,
}

const keySecret = defineSecret('openai-key')

const handleRequest = (request, response, apiKey) => {
    // check for OPTIONS request
    if (request.method === 'OPTIONS') {
        response.set('Access-Control-Allow-Origin', '*')
        response.set('Access-Control-Allow-Methods', 'POST')
        response.set('Access-Control-Allow-Headers', 'Content-Type')
        response.status(204).send('')
        return
    }

    // check if the request is a POST request
    if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed')
        return
    }

    const text = request.body.text
    const messages = []
    messages.push({
        role: 'user',
        content: text,
    })
    messages.push({
        role: 'system',
        content: BEAUTIFY_GPT_REQUESTS[request.body.type],
    })
    if (request.body.formatAsHtml && request.body.formatAsHtml === true)
        messages.push({
            role: 'system',
            content: BEAUTIFY_ADDITONS.FORMAT_AS_HTML,
        })

    axios
        .post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini', // Use the desired OpenAI model
                messages: messages,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey.value()}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        .then((res) => {
            response.send(res.data.choices[0].message.content)
        })
}

// handleRequest(
//     {
//         method: 'POST',
//         body: {
//             text: 'Gips karton ploce za izradu suve gradnje',
//             type: 'PRODUCT_DESCRIPTION',
//             formatAsHtml: false,
//         },
//     },
//     { send: console.log }
// )
exports.beautify = onRequest(
    { secrets: [keySecret], cors: true },
    (request, response) => {
        handleRequest(request, response, keySecret)
    }
)
