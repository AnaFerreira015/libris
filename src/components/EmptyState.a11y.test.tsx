import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState accessibility", () => {
  it("does not report basic accessibility violations for a neutral state", async () => {
    const { container, getByRole } = render(
      <EmptyState title="Nenhum livro encontrado" description="Tente outra busca." />,
    );

    expect(getByRole("status")).toHaveTextContent("Nenhum livro encontrado");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("supports alert semantics for error states", async () => {
    const { container, getByRole } = render(
      <EmptyState
        role="alert"
        title="Não foi possível buscar"
        description="Tente novamente em instantes."
      />,
    );

    expect(getByRole("alert")).toHaveTextContent("Não foi possível buscar");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});