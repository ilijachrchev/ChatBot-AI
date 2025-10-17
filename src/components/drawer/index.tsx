import React, { JSX } from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '../ui/drawer'

type Props = {
    children: React.ReactNode
    onOpen: JSX.Element
    title: string
    description: string
}

const AppDrawer = ({ children, description, title, onOpen }: Props) => {
  return (
    <Drawer>
        <DrawerTrigger>
            {onOpen}
        </DrawerTrigger>
        <DrawerContent>
            <div className='container flex flex-col items-center gap-2 pb-10'>
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
                {children}
            </div>

        </DrawerContent>

    </Drawer>
  )
}

export default AppDrawer