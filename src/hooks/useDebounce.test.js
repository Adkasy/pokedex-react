import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import useDebounce from "./useDebounce"

describe("useDebounce", () => {
	it("returns the initial value immediately", () => {
		const { result } = renderHook(() => useDebounce("a", 300))
		expect(result.current).toBe("a")
	})

	it("does not update the value before the delay finishes", () => {
		vi.useFakeTimers()

		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 300),
			{ initialProps: { value: "a" } },
		)
		rerender({ value: "ab" })

		act(() => {
			vi.advanceTimersByTime(100)
		})
		expect(result.current).toBe("a")

		vi.useRealTimers()
	})

	it("updates the value after the delay finishes", () => {
		vi.useFakeTimers()

		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 300),
			{ initialProps: { value: "a" } },
		)
		rerender({ value: "ab" })

		act(() => {
			vi.advanceTimersByTime(300)
		})
		expect(result.current).toBe("ab")

		vi.useRealTimers()
	})
})
