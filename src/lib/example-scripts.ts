import dedent from "dedent";


// Auhtentication/Authorization

export const BASIC_AUTHENTICATION = dedent`
import encoding from 'k6/encoding'
import http from 'k6/http'
import { check } from 'k6'

const username = 'user'
const password = 'passwd'

export const options = {}

export default function () {
  const credentials = \`\${username}:\${password}\`

  // Passing username and password as part of the URL will
  // allow us to authenticate using HTTP Basic Auth.
  const url = \`https://\${credentials}@httpbin.test.k6.io/basic-auth/\${username}/\${password}\`

  let res = http.get(url)

  // Verify response
  check(res, {
    'status is 200': (r) => r.status === 200,
    'is authenticated': (r) => r.json().authenticated === true,
    'is correct user': (r) => r.json().user === username,
  })

  // Alternatively you can create the header yourself to authenticate
  // using HTTP Basic Auth
  const encodedCredentials = encoding.b64encode(credentials)
  const options = {
    headers: {
      Authorization: \`Basic \${encodedCredentials}\`,
    },
  }

  res = http.get(
    \`https://httpbin.test.k6.io/basic-auth/\${username}/\${password}\`,
    options
  )

  // Verify response (checking the echoed data from the httpbin.test.k6.io
  // basic auth test API endpoint)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'is authenticated': (r) => r.json().authenticated === true,
    'is correct user': (r) => r.json().user === username,
  })
}
`;

export const DIGEST_AUTHENTICATION = dedent`
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 10,
  duration: '5m',
}

const username = 'user'
const password = 'passwd'

export default function () {
  // Passing username and password as part of URL plus the auth option will authenticate using HTTP Digest authentication
  let res = http.get(
    \`http://\${username}:\${password}@httpbin.org/digest-auth/auth/\${username}/\${password}\`,
    {
      auth: 'digest',
    }
  )

  // Verify response (checking the echoed data from the httpbin.org digest auth test API endpoint)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'is authenticated': (r) => r.json().authenticated === true,
    'is correct user': (r) => r.json().user === username,
  })
  sleep(1)
}
`;

// API CRUD operations

export const CORE_K6_API = dedent`
import http from 'k6/http'
import { check, group } from 'k6'

export const options = {}

// Create a random string of given length
function randomString(length, charset = 'abcdefghijklmnopqrstuvwxyz') {
  let res = ''
  while (length--) {
    res += charset[Math.floor(Math.random() * charset.length)]
  }
  return res
}

// Set your own email or \`\${randomString(10)}@example.com\`;
const USERNAME = \`\${randomString(10)}@example.com\`
const PASSWORD = 'superCroc2019'

const BASE_URL = 'https://test-api.k6.io'

// Register a new user and retrieve authentication token for subsequent API requests
export function setup() {
  const res = http.post(\`\${BASE_URL}/user/register/\`, {
    first_name: 'Crocodile',
    last_name: 'Owner',
    username: USERNAME,
    password: PASSWORD,
  })

  check(res, { 'created user': (r) => r.status === 201 })

  const loginRes = http.post(\`\${BASE_URL}/auth/token/login/\`, {
    username: USERNAME,
    password: PASSWORD,
  })

  const authToken = loginRes.json('access')
  check(authToken, { 'logged in successfully': () => authToken !== '' })

  return authToken
}

export default (authToken) => {
  // set the authorization header on the session for the subsequent requests
  const requestConfigWithTag = (tag) => ({
    headers: {
      Authorization: \`Bearer \${authToken}\`,
    },
    tags: Object.assign(
      {},
      {
        name: 'PrivateCrocs',
      },
      tag
    ),
  })

  let URL = \`\${BASE_URL}/my/crocodiles/\`

  group('01. Create a new crocodile', () => {
    const payload = {
      name: \`Name \${randomString(10)}\`,
      sex: 'F',
      date_of_birth: '2023-05-11',
    }

    const res = http.post(
      URL,
      payload,
      requestConfigWithTag({ name: 'Create' })
    )

    if (check(res, { 'Croc created correctly': (r) => r.status === 201 })) {
      URL = \`\${URL}\${res.json('id')}/\`
    } else {
      console.log(\`Unable to create a Croc \${res.status} \${res.body}\`)
      return
    }
  })

  group('02. Fetch private crocs', () => {
    const res = http.get(
      \`\${BASE_URL}/my/crocodiles/\`,
      requestConfigWithTag({ name: 'Fetch' })
    )
    check(res, { 'retrieved crocs status': (r) => r.status === 200 })
    check(res.json(), { 'retrieved crocs list': (r) => r.length > 0 })
  })

  group('03. Update the croc', () => {
    const payload = { name: 'New name' }
    const res = http.patch(
      URL,
      payload,
      requestConfigWithTag({ name: 'Update' })
    )
    const isSuccessfulUpdate = check(res, {
      'Update worked': () => res.status === 200,
      'Updated name is correct': () => res.json('name') === 'New name',
    })

    if (!isSuccessfulUpdate) {
      console.log(\`Unable to update the croc \${res.status} \${res.body}\`)
      return
    }
  })

  group('04. Delete the croc', () => {
    const delRes = http.del(URL, null, requestConfigWithTag({ name: 'Delete' }))

    const isSuccessfulDelete = check(null, {
      'Croc was deleted correctly': () => delRes.status === 204,
    })

    if (!isSuccessfulDelete) {
      console.log(\`Croc was not deleted properly\`)
      return
    }
  })
}
`;

// Cookies

export const COOKIES_HEADER = dedent`
import http from 'k6/http'
import { check } from 'k6'

export const options = {}

export default function () {
  // Since this request redirects the \`res.cookies\` property won't contain the cookies
  const res = http.get(
    'https://httpbin.test.k6.io/cookies/set?name1=value1&name2=value2'
  )
  check(res, {
    'status is 200': (r) => r.status === 200,
  })

  // Make sure cookies have been added to VU cookie jar
  const vuJar = http.cookieJar()
  const cookiesForURL = vuJar.cookiesForURL(res.url)
  check(null, {
    "vu jar has cookie 'name1'": () => cookiesForURL.name1.length > 0,
    "vu jar has cookie 'name2'": () => cookiesForURL.name2.length > 0,
  })
}
`;

export const COOKIES_LOG_RESPONSE = dedent`
// Example showing two methods how to log all cookies (with attributes) from a HTTP response.

import http from 'k6/http'

function logCookie(cookie) {
  // Here we log the name and value of the cookie along with additional attributes.
  // For full list of attributes see: https://grafana.com/docs/k6/latest/using-k6/cookies/#properties-of-a-response-cookie-object
  console.log(
    \`\${cookie.name}: \${cookie.value}\n\tdomain: \${cookie.domain}\n\tpath: \${cookie.path}\n\texpires: \${cookie.expires}\n\thttpOnly: \${cookie.http_only}\`
  )
}

export const options = {}

export default function () {
  const res = http.get('https://www.google.com/')

  // Method 1: Use for-loop and check for non-inherited properties
  for (const name in res.cookies) {
    if (res.cookies.hasOwnProperty(name) !== undefined) {
      logCookie(res.cookies[name][0])
    }
  }

  // Method 2: Use ES6 Map to loop over Object entries
  new Map(Object.entries(res.cookies)).forEach((v, k) => logCookie(v[0]))
}
`;

export const COOKIES_SET_JAR = dedent`
import http from 'k6/http'
import { check } from 'k6'

export const options = {}

export default function () {
  // Get VU cookie jar and add a cookie to it providing the parameters
  // that a request must match (domain, path, HTTPS or not etc.)
  // to have the cookie attached to it when sent to the server.
  const jar = http.cookieJar()
  jar.set('https://httpbin.test.k6.io/cookies', 'my_cookie', 'hello world', {
    domain: 'httpbin.test.k6.io',
    path: '/cookies',
    secure: true,
    max_age: 600,
  })

  // As the following request is matching the above cookie in terms of domain,
  // path, HTTPS (secure) and will happen within the specified "age" limit, the
  // cookie will be attached to this request.
  const res = http.get('https://httpbin.test.k6.io/cookies')
  check(res, {
    'has status 200': (r) => r.status === 200,
    "has cookie 'my_cookie'": (r) => r.json().cookies.my_cookie !== null,
    'cookie has correct value': (r) =>
      r.json().cookies.my_cookie === 'hello world',
  })
}
`;

// Correlation

export const EXTRACT_JSON = dedent`
import http from 'k6/http'
import { check } from 'k6'

export const options = {}

export default function () {
  // Make a request that returns some JSON data
  const res = http.get('https://httpbin.test.k6.io/json')

  // Extract data from that JSON data by first parsing it
  // using a call to "json()" and then accessing properties by
  // navigating the JSON data as a JS object with dot notation.
  const slide1 = res.json().slideshow.slides[0]
  check(slide1, {
    'slide 1 has correct title': (s) => s.title === 'Wake up to WonderWidgets!',
    'slide 1 has correct type': (s) => s.type === 'all',
  })

  // Now we could use the "slide1" variable in subsequent requests...
}
`;
