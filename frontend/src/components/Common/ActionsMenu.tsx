import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash } from "react-icons/fi"

import type { ItemPublic, UserPublic, CustomerPublic, OrderPublic, ProductPublic} from "../../client"
import EditUser from "../Admin/EditUser"
import EditItem from "../Items/EditItem"
import EditCustomer from "../Customers/EditCustomer"
import EditOrder from "../Orders/EditOrder"
import EditProduct from "../Products/EditProduct"
import Delete from "./DeleteAlert"

interface ActionsMenuProps {
  type: string
  value: ItemPublic | UserPublic | CustomerPublic | OrderPublic | ProductPublic
  disabled?: boolean
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editModal = useDisclosure()
  const deleteModal = useDisclosure()

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem
            onClick={editModal.onOpen}
            icon={<FiEdit fontSize="16px" />}
          >
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        {type === "User" ? (
          <EditUser
            user={value as UserPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : type === "Item" ? (
          <EditItem
            item={value as ItemPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) :  type === "Customer" ?(
          <EditCustomer
            customer={value as CustomerPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) :  type === "Order" ?(
          <EditOrder
            order={value as OrderPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ): type === "Product" ? (
          <EditProduct
            product={value as ProductPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ): null }
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu
