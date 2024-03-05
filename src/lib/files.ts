import dedent from "dedent";
import { EMPTY_BLOCK_TEST } from "./stores/blocks/constants";
import type { Test } from "./stores/blocks/model/loose";
import type { OpenFile } from "./stores/editor";

const NEW_BLOCKS_TEST = JSON.stringify(EMPTY_BLOCK_TEST);

const NEW_SCRIPT = dedent`
  import { sleep } from 'k6'
  import http from 'k6/http'

  // See https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/
  export const options = {
    stages: [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 20 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_failed: ['rate<0.02'], // http errors should be less than 2%
      http_req_duration: ['p(95)<2000'], // 95% requests should be below 2s
    },
    ext: {
      loadimpact: {
        distribution: {
          'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 },
        },
      },
    },
  }

  export default function main() {
    let response = http.get('https://test-api.k6.io/public/crocodiles/')
    sleep(1)
  }
`;

function loadContent(file: OpenFile): string {
  const data = sessionStorage.getItem(file.handle);

  if (data === null) {
    if (file.path.type === "new") {
      switch (file.type) {
        case "block":
          return NEW_BLOCKS_TEST;

        case "script":
          return NEW_SCRIPT;
      }
    }

    return file.path.original;
  }

  return data;
}

function storeContent(file: OpenFile, content: Test | string) {
  sessionStorage.setItem(
    file.handle,
    typeof content === "string" ? content : JSON.stringify(content),
  );
}

export { loadContent, storeContent };
