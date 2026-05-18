import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { BookCover } from "./BookCover";

describe("BookCover accessibility", () => {
  it("does not report basic accessibility violations when the cover image exists", async () => {
    const { container, getByRole } = render(
      <BookCover
        src="https://example.com/capa.jpg"
        title="A hora da estrela"
      />,
    );

    expect(
      getByRole("img", { name: "Capa do livro A hora da estrela" }),
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("does not report basic accessibility violations when the cover is missing", async () => {
    const { container, getByRole } = render(
      <BookCover title="Livro sem capa" />,
    );

    expect(
      getByRole("img", { name: "Capa indisponível para Livro sem capa" }),
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});