import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MushafSwipeTajwid from "../MushafSwipeTajwid";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} data-testid="motion-div">{children}</div>
    ),
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

const defaultProps = {
  currentPage: 1,
  onChangePage: vi.fn(),
  isBookmarked: false,
  onToggleBookmark: vi.fn(),
  t: (key: string) => key,
  showTajwid: false,
};

describe("MushafSwipeTajwid", () => {
  it("renders with correct page number", () => {
    render(<MushafSwipeTajwid {...defaultProps} />);
    expect(screen.getByText("1 / 604")).toBeInTheDocument();
  });

  it("renders page image with correct alt text", () => {
    render(<MushafSwipeTajwid {...defaultProps} />);
    const img = screen.getByAlt("mushaf.page 1");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://cdn.islamic.network/quran/images/page001.png");
  });

  it("has correct aria-label", () => {
    render(<MushafSwipeTajwid {...defaultProps} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "mushaf.page 1");
  });

  it("navigates on keyboard ArrowLeft", () => {
    const onChangePage = vi.fn();
    render(<MushafSwipeTajwid {...defaultProps} onChangePage={onChangePage} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onChangePage).toHaveBeenCalledWith(2);
  });

  it("navigates on keyboard ArrowRight at page > 1", () => {
    const onChangePage = vi.fn();
    render(<MushafSwipeTajwid {...defaultProps} currentPage={5} onChangePage={onChangePage} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onChangePage).toHaveBeenCalledWith(4);
  });

  it("does not go below page 1", () => {
    const onChangePage = vi.fn();
    render(<MushafSwipeTajwid {...defaultProps} currentPage={1} onChangePage={onChangePage} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onChangePage).not.toHaveBeenCalled();
  });

  it("does not go above page 604", () => {
    const onChangePage = vi.fn();
    render(<MushafSwipeTajwid {...defaultProps} currentPage={604} onChangePage={onChangePage} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onChangePage).not.toHaveBeenCalled();
  });
});
