import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'
import { Child, FC } from 'hono/jsx';

const app = new Hono()

app.use(logger())

app.use('/static/*', serveStatic({ root: './' }))

type PageType = { title: string, children: Child }
const Page:FC<PageType> = (props: PageType) => {
  const { title, children } = props
  return (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{ title }</title>
      <link rel="stylesheet" href="/static/css/main.css" />
      <script src="/static/js/alpine.js" defer></script>
      <script src="/static/js/htmx.js" defer></script>
    </head>
    <body>
      { children }
    </body>
    <script src="/static/js/main.js"></script>
  </html>
  )
}

type AlpineComponentType = { message: string }
const AlpineComponent: FC<AlpineComponentType> = (props: AlpineComponentType) => {
  const { message } = props;
  return (
    <section x-data={`{message: '${ message }'}`}>
      <h2>Alpine Component</h2>
      <p x-text="message"></p>
    </section>
  )
}

const HtmxComponent: FC = (props) => {
  return (
    <section className="fade-out" id="htmx-test">
      <h2>HTMX Component</h2>
      <p>Get some <abbr title="Hyper Text Markup Language">HTML</abbr> from the server</p>
      <button hx-get="/htmx-test" hx-swap="outerHTML swap:500ms" hx-target="#htmx-test" hx-push-url="true">Get Data</button>
    </section>
  )
}

const HtmxSuccess:FC = (props) => {
  return (
    <section className="fade-in" id="htmx-test">
      <h2>HTMX Success</h2>
      <p>Wow! We got some <abbr title="Hyper Text Markup Language">HTML</abbr> from the server!</p>
      <script src="/static/js/htmx-success.js"></script>
    </section>
  )
}

type DemoPageType = { title: string, message: string, children: Child }
const DemoPage: FC<DemoPageType> = (props: DemoPageType) => {
  const { title, message, children } = props
  return (
    <Page title={ title }>
      <div className="container">
        <h1>Hello Hono!</h1>
        <AlpineComponent message={ message } />
        { children }
      </div>
    </Page>
  )
}

app.get('/', (c) => {
  return c.html(
  <DemoPage title="Hono" message="Data via Alpine.js">
    <HtmxComponent />
  </DemoPage>)
})

app.get('/htmx-test', (c) => {
  const hasHxRequest = c.req.header('HX-Request')
  if (hasHxRequest) {
    return c.html(<HtmxSuccess />)
  }
  return c.html(
    <DemoPage title="Hono" message="Data via Alpine.js">
      <HtmxSuccess />
    </DemoPage>
  )
})

serve({
  fetch: app.fetch,
  port: 5000,
  hostname: '127.0.0.1'
})
