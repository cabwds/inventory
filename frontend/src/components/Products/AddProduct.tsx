import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type ProductCreate, ProductsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import ProductFormFields, { getDefaultProductFormSections } from "./ProductFormFields"

interface AddProductProps {
  isOpen: boolean
  onClose: () => void
}

const AddProduct = ({ isOpen, onClose }: AddProductProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      brand: "",
      type: "",
      price_currency: "SGD",
      cost_currency: "SGD",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProductCreate) =>
      ProductsService.createProduct({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Product created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const onSubmit: SubmitHandler<ProductCreate> = (data) => {
    mutation.mutate(data)
  }

  // Get form sections configuration
  const formSections = getDefaultProductFormSections(false); // false for Add mode

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "4xl" }}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader borderBottomWidth="1px">
          <Text fontSize="xl">Add Product</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6} px={8} overflowY="auto">
          <form id="add-product-form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              <ProductFormFields 
                register={register}
                errors={errors}
                sections={formSections}
              />
            </SimpleGrid>
          </form>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" gap={3}>
          <Button
            variant="primary"
            type="submit"
            form="add-product-form"
            isLoading={isSubmitting}
            colorScheme="blue"
          >
            Save
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddProduct
