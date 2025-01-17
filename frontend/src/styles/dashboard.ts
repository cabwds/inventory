import { SystemStyleObject } from "@chakra-ui/react"

export const dashboardStyles = {
  container: {
    maxW: { base: "container.sm", md: "container.md", lg: "container.lg" },
    py: 8,
    px: { base: 4, md: 8 },
  },
  welcomeBox: {
    mb: 10,
  },
  welcomeText: {
    fontSize: { base: "2xl", md: "3xl" },
    fontWeight: "bold",
    mb: 2,
  },
  statsGrid: {
    columns: { base: 1, md: 2 },
    spacing: { base: 4, md: 6, lg: 8 },
    mx: "auto",
  },
} as const

export const getStatCardStyles = (
  bgColor: string,
  borderColor: string,
  iconBg: string,
  textColor: string,
) => ({
  stat: {
    px: 6,
    py: 5,
    bg: bgColor,
    shadow: "xl",
    border: "1px",
    borderColor: borderColor,
    rounded: "lg",
    position: "relative",
    transition: "transform 0.2s",
    _hover: { transform: "translateY(-2px)" },
  } as const,
  statContent: {
    justifyContent: "space-between",
  } as const,
  textContainer: {
    pl: 2,
  } as const,
  label: {
    fontSize: "xl",
    fontWeight: "medium",
    isTruncated: true,
    color: textColor,
  } as const,
  number: {
    fontSize: "3xl",
    fontWeight: "bold",
  } as const,
  helpText: {
    color: textColor,
  } as const,
  iconContainer: {
    my: "auto",
    color: "blue.500",
    alignContent: "center",
  } as const,
  iconWrapper: {
    w: 12,
    h: 12,
    align: "center",
    justify: "center",
    rounded: "full",
    bg: iconBg,
  } as const,
  icon: {
    w: 6,
    h: 6,
  } as const,
}) 