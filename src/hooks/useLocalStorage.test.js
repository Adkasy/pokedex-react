import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import useLocalStorage from "./useLocalStorage"

describe("useLocalStorage", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it("uses the default value when localStorage is empty", () => {
		const defaultData = { name: "Pikachu", type: "Electric" }
		const { result } = renderHook(() =>
			useLocalStorage("Favorite Pokemon", defaultData),
		)
		const [value] = result.current

		expect(value).toEqual(defaultData)
	})

	it("uses the value already stored in localStorage instead of the default", () => {
		const oldData = { name: "Charmander", type: "Fire" }
		const defaultData = { name: "Pikachu", type: "Electric" }
		localStorage.setItem("Favorite Pokemon", JSON.stringify(oldData))

		const { result } = renderHook(() =>
			useLocalStorage("Favorite Pokemon", defaultData),
		)
		const [value] = result.current

		expect(value).toEqual(oldData)
	})

	it("updates the value when setValue is called", () => {
		const defaultData = { name: "Pikachu", type: "Electric" }
		const { result } = renderHook(() =>
			useLocalStorage("Favorite Pokemon", defaultData),
		)

		const newData = { name: "Bulbasaur", type: "Grass" }
		act(() => {
			const [, setValue] = result.current
			setValue(newData)
		})
		const [value] = result.current

		expect(value).toEqual(newData)
	})

	it("persists the latest value to localStorage whenever it changes", () => {
		const defaultData = { name: "Pikachu", type: "Electric" }
		const { result } = renderHook(() =>
			useLocalStorage("Favorite Pokemon", defaultData),
		)

		const newData = { name: "Bulbasaur", type: "Grass" }
		act(() => {
			const [, setValue] = result.current
			setValue(newData)
		})
		const stored = JSON.parse(localStorage.getItem("Favorite Pokemon"))

		expect(stored).toEqual(newData)
	})
})
