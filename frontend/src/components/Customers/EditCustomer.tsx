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
  VStack,
  IconButton,
  Flex,
  Avatar,
  Spinner,
} from "@chakra-ui/react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiUpload, FiUser } from "react-icons/fi"

import {
  type ApiError,
  type CustomerPublic,
  type CustomerUpdate,
  CustomersService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { modalScrollbarStyles, editCustomerStyles } from "../../styles/customers.styles"
import CustomerFormFields, { getDefaultCustomerFormSections } from "./CustomerFormFields"

interface EditCustomerProps {
  customer: CustomerPublic
  isOpen: boolean
  onClose: () => void
}

interface ProfileImageUploadProps {
  customerId: string;
  onSuccess: () => void;
}

const ProfileImageUpload = ({ customerId, onSuccess }: ProfileImageUploadProps) => {
  const showToast = useCustomToast()
  const queryClient = useQueryClient()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const { data: profileImage, isLoading: isLoadingImage, isError } = useQuery({
    queryKey: ['customerProfileImage', customerId],
    queryFn: () => CustomersService.getProfileImage({ customerId }),
    enabled: !!customerId,
    retry: (failureCount, error: any) => {
      // Don't retry if we get a 404 error
      if (error?.status === 404) return false
      // Otherwise retry up to 3 times
      return failureCount < 3
    }
  })

  // Add default image URL
  const defaultImageUrl = "https://bit.ly/broken-link"

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showToast('Error', 'Only JPEG and PNG files are allowed.', 'error')
      return
    }

    setIsUploading(true)
    try {
      await CustomersService.uploadProfileImage({
        customerId: customerId,
        formData: {file: file}
      })
      showToast('Success', 'Profile image uploaded successfully.', 'success')
      queryClient.invalidateQueries({ queryKey: ['customerProfileImage', customerId] })
      onSuccess()
    } catch (error) {
      if (error instanceof Error) {
        handleError(error as ApiError, showToast)
      } else {
        showToast('Error', 'An unexpected error occurred', 'error')
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Box position="relative">
      {isLoadingImage ? (
        <Spinner size="xl" thickness="4px" />
      ) : (
        <>
          <Avatar
            size="2xl"
            src={!isError && profileImage ? `data:image/jpeg;base64,${profileImage}` : defaultImageUrl}
            bg="gray.200"
            icon={<FiUser size="60%" />}
          />
          <IconButton
            aria-label="Upload profile image"
            icon={<FiUpload />}
            position="absolute"
            bottom="2"
            right="2"
            size="sm"
            colorScheme="blue"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
          />
        </>
      )}
    </Box>
  )
}

const EditCustomer = ({ customer, isOpen, onClose }: EditCustomerProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<CustomerUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: customer,
  })

  const mutation = useMutation({
    mutationFn: (data: CustomerUpdate) =>
      CustomersService.updateCustomer({ id: customer.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Customer updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const onSubmit: SubmitHandler<CustomerUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  const handleImageUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["customers"] })
  }

  // Get form sections configuration (true for Edit mode)
  const formSections = getDefaultCustomerFormSections();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxH="85vh">
        <ModalHeader {...editCustomerStyles.modalHeader}>
          <Text fontSize="xl">Edit Customer</Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            ID: {customer.id}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          py={6} 
          px={8}
          overflowY="auto"
          css={modalScrollbarStyles}
        >
          <form id="edit-customer-form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={8} align="stretch">
              <Flex justify="center" pt={2} pb={6}>
                <Box>
                  <ProfileImageUpload 
                    customerId={customer.id} 
                    onSuccess={handleImageUploadSuccess}
                  />
                  <Text 
                    textAlign="center" 
                    mt={2} 
                    fontSize="lg" 
                    fontWeight="medium"
                  >
                    {customer.full_name}
                  </Text>
                </Box>
              </Flex>

              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                <CustomerFormFields
                  register={register}
                  errors={errors}
                  sections={formSections}
                />
              </SimpleGrid>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter {...editCustomerStyles.modalFooter}>
          <Button
            variant="primary"
            type="submit"
            form="edit-customer-form"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
            colorScheme="blue"
            px={6}
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

export default EditCustomer
