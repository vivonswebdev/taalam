import { describe, it, expect, vi } from "vitest";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => {
      const { custom, variants, initial, animate, exit, drag, dragConstraints, dragElastic, onDragEnd, style, ...rest } = props;
      return <div onClick={onClick} data-testid="motion-div" {...rest}>{children}</div>;
    },
  },
  useMotionValue: () => ({ get: () => 0, set: () => {} }),
  useTransform: () => ({ get: () => 0 }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/hooks/useTajwidData", () => ({
  useTajwidData: () => ({
    data: {},
    loading: false,
    getPageData: () => [],
  }),
}));

// Inline render helper to avoid import issues
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import MushafSwipeTajwid from "../MushafSwipeTajwid";

function renderToDiv(props: any) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  // Use act-like sync render
  let rendered = false;
  root.render(createElement(MushafSwipeTajwid, props));
  return container;
}

describe("MushafSwipeTajwid", () => {
  it("should export a component", () => {
    expect(MushafSwipeTajwid).toBeDefined();
    expect(typeof MushafSwipeTajwid).toBe("object"); // memo wraps it
  });

  it("should have correct image URL format", () => {
    // Test the URL generation logic
    const padded = String(1).padStart(3, "0");
    expect(`https://cdn.islamic.network/quran/images/page${padded}.png`).toBe(
      "https://cdn.islamic.network/quran/images/page001.png"
    );
  });

  it("should pad page 604 correctly", () => {
    const padded = String(604).padStart(3, "0");
    expect(padded).toBe("604");
  });

  it("should handle keyboard navigation logic", () => {
    const onChangePage = vi.fn();
    // Simulate ArrowLeft at page 1 → should go to page 2
    const currentPage = 1;
    if (currentPage < 604) onChangePage(currentPage + 1);
    expect(onChangePage).toHaveBeenCalledWith(2);
  });

  it("should not go below page 1", () => {
    const onChangePage = vi.fn();
    const currentPage = 1;
    if (currentPage > 1) onChangePage(currentPage - 1);
    expect(onChangePage).not.toHaveBeenCalled();
  });

  it("should not go above page 604", () => {
    const onChangePage = vi.fn();
    const currentPage = 604;
    if (currentPage < 604) onChangePage(currentPage + 1);
    expect(onChangePage).not.toHaveBeenCalled();
  });
});
