import { cleanup, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { afterEach } from "vitest";
import en from "../../../messages/en.json";

afterEach(cleanup);

export function renderWithIntl(element: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
      {element}
    </NextIntlClientProvider>,
  );
}
