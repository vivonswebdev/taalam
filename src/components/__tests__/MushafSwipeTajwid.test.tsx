import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import MushafSwipeTajwid, { type MushafSwipeTajwidProps } from "../MushafSwipeTajwid";

const dragStartSpy = vi.fn();
let latestMotionProps: Record<string, any> | null = null;

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      latestMotionProps = props;
      return createElement("div", { "data-testid": "motion-div" }, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
  useDragControls: () => ({ start: dragStartSpy }),
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useTransform: () => "none",
}));

vi.mock("@/hooks/useTajwidData", () => ({
  useTajwidData: () => ({ getPageData: () => [] }),
}));

function mount(props: Partial<MushafSwipeTajwidProps> = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  const defaultProps: MushafSwipeTajwidProps = {
    currentPage: 1,
    onChangePage: vi.fn(),
    isBookmarked: false,
    onToggleBookmark: vi.fn(),
    t: (key: string) => key,
    showTajwid: false,
    ...props,
  };

  act(() => {
    root.render(createElement(MushafSwipeTajwid, defaultProps));
  });

  return { container, root, props: defaultProps };
}

describe("MushafSwipeTajwid", () => {
  beforeEach(() => {
    latestMotionProps = null;
    dragStartSpy.mockClear();
  });

  it("swipe drag > 80 déclenche page+1 et pointer touch démarre dragControls", () => {
    const onChangePage = vi.fn();
    mount({ currentPage: 1, onChangePage });

    expect(latestMotionProps).toBeTruthy();

    act(() => {
      latestMotionProps?.onPointerDown({ pointerType: "touch" });
    });
    expect(dragStartSpy).toHaveBeenCalled();

    act(() => {
      latestMotionProps?.onDragEnd({} as PointerEvent, { offset: { x: -100 } });
    });

    expect(onChangePage).toHaveBeenCalledWith(2);
  });

  it("ArrowLeft avance (+1) et ArrowRight recule (-1)", () => {
    const onChangePage = vi.fn();
    mount({ currentPage: 10, onChangePage });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });

    expect(onChangePage).toHaveBeenCalledWith(11);
    expect(onChangePage).toHaveBeenCalledWith(9);
  });

  it("respecte les limites page 1 et page 604", () => {
    const onChangeStart = vi.fn();
    mount({ currentPage: 1, onChangePage: onChangeStart });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(onChangeStart).not.toHaveBeenCalled();

    const onChangeEnd = vi.fn();
    mount({ currentPage: 604, onChangePage: onChangeEnd });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    });
    expect(onChangeEnd).not.toHaveBeenCalled();
  });
});
