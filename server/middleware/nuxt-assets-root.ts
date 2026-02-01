import { defineEventHandler, setResponseStatus } from 'h3'

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''

  if (url === '/_nuxt' || url === '/_nuxt/') {
    setResponseStatus(event, 204)
    return ''
  }
})
