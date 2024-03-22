import { useEffect, useRef, useState } from "react";

function TestResultsView() {
  const iframe = useRef<HTMLIFrameElement>(null);

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) {
      return;
    }

    let handle = setTimeout(function refresh() {
      const contentWindow = iframe.current?.contentWindow;

      if (contentWindow === null || contentWindow === undefined) {
        return;
      }

      contentWindow.location.href = "http://localhost:5665";

      handle = setTimeout(refresh, 200);
    }, 200);

    return () => {
      clearTimeout(handle);
    };
  }, [hasLoaded]);

  const handleError = () => {
    console.log("error");
  };

  function handleLoad() {
    setHasLoaded(iframe?.current?.contentDocument === null);
  }

  return (
    <iframe
      ref={iframe}
      width="100%"
      height="100%"
      src="http://localhost:5665"
      title="Test Results"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

export { TestResultsView };
