import { HStack, Select, Text } from "@chakra-ui/react"

export function PageSizeSelector({ 
  pageSize, 
  onChange 
}: { 
  pageSize: number
  onChange: (newSize: number) => void 
}) {
  return (
    <HStack spacing={2} align="center">
      <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
        Rows per page:
      </Text>
      <Select
        size="sm"
        value={pageSize}
        onChange={(e) => onChange(Number(e.target.value))}
        width="70px"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </Select>
    </HStack>
  )
}