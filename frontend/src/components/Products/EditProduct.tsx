import React from "react"
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
  Box,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type ProductPublic,
  type ProductUpdate,
  ProductsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import ProductFormFields, { getDefaultProductFormSections } from "./ProductFormFields"

interface EditProductProps {
  product: ProductPublic
  isOpen: boolean
  onClose: () => void
}

const EditProduct = ({ product, isOpen, onClose }: EditProductProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<ProductUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: product,
  })

  const mutation = useMutation({
    mutationFn: (data: ProductUpdate) =>
      ProductsService.updateProduct({ id: product.id!, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Product updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const onSubmit: SubmitHandler<ProductUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  // Get form sections configuration (true for Edit mode)
  const formSections = getDefaultProductFormSections(true);

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
          <Text fontSize="xl">Edit Product</Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            ID: {product.id}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6} px={8} overflowY="auto">
          <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)}>
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
            form="edit-product-form"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
            colorScheme="blue"
          >
            Save Changes
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditProduct
