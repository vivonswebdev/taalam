import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import MushafSwipeTajwid from "../MushafSwipeTajwid";

const dragStartSpy = vi.fn();
let latestMotionProps: any = null;

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

function mount(props: Partial<React.ComponentProps<typeof MushafSwipeTajwid>> = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(
    createElement(MushafSwipeTajwid, {
      currentPage: 1,
      onChangePage: vi.fn(),
      isBookmarked: false,
      onToggleBookmark: vi.fn(),
      t: (key: string) => key,
      showTajwid: false,
      ...props,
    })
  );

  return { container, root };
}

describe("MushafSwipeTajwid", () => {
  beforeEach(() => {
    latestMotionProps = null;
    dragStartSpy.mockClear();
  });

  it("swipe drag > seuil déclenche page+1 et pointer touch démarre dragControls", () => {
    const onChangePage = vi.fn();
    mount({ currentPage: 1, onChangePage });

    expect(latestMotionProps).toBeTruthy();

    latestMotionProps.onPointerDown({ pointerType: "touch" });
    expect(dragStartSpy).toHaveBeenCalled();

    latestMotionProps.onDragEnd({}, { offset: { x: -100 } });
    expect(onChangePage).toHaveBeenCalledWith(2);
  });

  it("ArrowLeft avance (+1) et ArrowRight recule (-1)", () => {
    const onChangePage = vi.fn();
    mount({ currentPage: 10, onChangePage });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    expect(onChangePage).toHaveBeenCalledWith(11);
    expect(onChangePage).toHaveBeenCalledWith(9);
  });

  it("respecte les limites page 1 et page 604", () => {
    const onChangeStart = vi.fn();
    mount({ currentPage: 1, onChangePage: onChangeStart });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(onChangeStart).not.toHaveBeenCalled();

    const onChangeEnd = vi.fn();
    mount({ currentPage: 604, onChangePage: onChangeEnd });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(onChangeEnd).not.toHaveBeenCalled();
  });
});
