import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "../layout";

test("RootLayout", () => {
  render(
    <RootLayout>
      <>children</>
    </RootLayout>
  );
  expect(screen.getByText("children")).toBeDefined();
});
