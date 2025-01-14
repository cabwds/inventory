import { Select } from "@chakra-ui/react"

interface PageSizeSelectorProps {
  pageSize: number
  onChange: (newSize: number) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

export function PageSizeSelector({ pageSize, onChange }: PageSizeSelectorProps) {
  return (
    <Select
      value={pageSize}
      onChange={(e) => onChange(Number(e.target.value))}
      width="100px"
      size="sm"
    >
      {PAGE_SIZE_OPTIONS.map((size) => (
        <option key={size} value={size}>
          {size} rows
        </option>
      ))}
    </Select>
  )
}