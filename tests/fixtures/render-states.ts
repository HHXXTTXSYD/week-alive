import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Loading from "../../src/app/loading";
import ErrorPage from "../../src/app/error";

// Use React's JSX runtime; Playwright's component transform is not an SSR renderer.
process.stdout.write(
  JSON.stringify([
    [
      "error",
      renderToStaticMarkup(createElement(ErrorPage, { retry: () => {} })),
    ],
    ["loading", renderToStaticMarkup(createElement(Loading))],
  ]),
);
