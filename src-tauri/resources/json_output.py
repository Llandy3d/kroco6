from mitmproxy import http
from mitmproxy.tools.web.app import flow_to_json


def request(flow: http.HTTPFlow) -> None:

    data = flow_to_json(flow)
    # print(data)


# we flush it as we want to catch it as soon as it's emitted
print("Proxy Started~", flush=True)
