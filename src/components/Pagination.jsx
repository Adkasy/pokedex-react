import { useState } from "react"

const DELTA = 2

const getPageNumbers = (current, total) => {
	const pages = []

	for (let i = 1; i <= total; i++) {
		if (i === 1 || i === total || (i >= current - DELTA && i <= current + DELTA)) {
			pages.push(i)
		}
	}

	const withDots = []
	let prevPage = 0

	for (const page of pages) {
		if (prevPage && page - prevPage > 1) {
			withDots.push(`dots-${prevPage}`)
		}
		withDots.push(page)
		prevPage = page
	}

	return withDots
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const [jumpValue, setJumpValue] = useState(String(currentPage))
	// nyimpen currentPage yang "udah dilihat" render sebelumnya — dipake
	// buat nge-detect perubahan dari luar (klik nomor lain, tombol
	// Previous/Next, dll) TANPA effect, sesuai pattern "adjusting state
	// on a prop change" dari React docs
	const [prevPage, setPrevPage] = useState(currentPage)

	if (currentPage !== prevPage) {
		setPrevPage(currentPage)
		setJumpValue(String(currentPage))
	}

	if (totalPages <= 1) return null

	const pages = getPageNumbers(currentPage, totalPages)

	const handleJumpSubmit = (e) => {
		e.preventDefault()

		const page = Math.min(Math.max(Number(jumpValue) || 1, 1), totalPages)
		onPageChange(page)
		setJumpValue(String(page))
	}

	return (
		<div className="pagination">
			<button
				className="btn"
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
			>
				Previous
			</button>

			<div className="pagination-numbers">
				{pages.map((page) =>
					typeof page === "number" ? (
						<button
							key={page}
							className={`pagination-number${
								page === currentPage ? " is-active" : ""
							}`}
							aria-current={page === currentPage ? "page" : undefined}
							onClick={() => onPageChange(page)}
						>
							{page}
						</button>
					) : (
						<span key={page} className="pagination-dots">
							…
						</span>
					),
				)}
			</div>

			<button
				className="btn"
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(currentPage + 1)}
			>
				Next
			</button>

			<form className="pagination-jump" onSubmit={handleJumpSubmit}>
				<label className="pagination-jump-label" htmlFor="pagination-jump-input">
					Go to
				</label>
				<input
					id="pagination-jump-input"
					className="pagination-jump-input"
					type="number"
					inputMode="numeric"
					min={1}
					max={totalPages}
					value={jumpValue}
					onChange={(e) => setJumpValue(e.target.value)}
					onFocus={() => setJumpValue("")}
				/>
				<span className="pagination-jump-total">/ {totalPages}</span>
				<button className="btn pagination-jump-btn" type="submit">
					Go
				</button>
			</form>
		</div>
	)
}

export default Pagination
