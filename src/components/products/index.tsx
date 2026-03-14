import React from 'react'
import TabsMenu from '../tabs/intex'
import { Plus, Package } from 'lucide-react'
import { TabsContent } from '../ui/tabs'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import Image from 'next/image'
import { getMonthName, cn } from '@/lib/utils'
import { SideSheet } from '../sheet'
import { CreateProductForm } from './product-form'

type Props = {
  products: {
    id: string
    name: string
    price: number
    image: string
    createdAt: Date
    domainId: string | null
  }[]
  id: string
}

const ProductTable = ({ id, products }: Props) => {
  const safeProducts = products || []

  return (
    <div className='px-4 md:px-6 py-6'>
      <div className='rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)] text-white'>
              <Package className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-[var(--text-primary)]'>
                Products
              </h2>
              <p className='text-sm text-[var(--text-secondary)]'>
                Add products to your store and set them live to accept payments from customers.
              </p>
            </div>
          </div>

          <SideSheet
            description="Add products to your store and set them live to accept payments from customers."
            title="Add a Product"
            trigger={
              <div className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-4 py-2 rounded-lg cursor-pointer',
                'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]',
                'hover:from-[var(--primary)] hover:to-[var(--primary-light)]',
                'text-white font-semibold text-sm',
                'shadow-lg shadow-[var(--primary)]',
                'transition-all duration-200',
                'hover:shadow-xl hover:shadow-[var(--primary)]'
              )}>
                <Plus className='h-4 w-4' />
                Add Product
              </div>
            }
          >
            <CreateProductForm id={id} />
          </SideSheet>
        </div>

        <TabsMenu
          className="w-full flex justify-start"
          triggers={[
            { label: 'All products' },
            { label: 'Live' },
            { label: 'Deactivated' },
          ]}
        >
          <TabsContent value="All products">
            <DataTable headers={['Featured Image', 'Name', 'Pricing', 'Created']}>
              {safeProducts.length > 0 ? (
                safeProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className='hover:bg-[var(--bg-hover)] transition-colors'
                  >
                    <TableCell>
                      <div className='relative h-12 w-12 rounded-lg overflow-hidden border border-[var(--border-default)]'>
                        <Image
                          src={`https://ucarecdn.com/${product.image}/`}
                          fill
                          className='object-cover'
                          alt={product.name}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-[var(--text-primary)]'>
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)] text-sm font-semibold'>
                        ${product.price}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-[var(--text-secondary)]">
                      {product.createdAt.getDate()}{' '}
                      {getMonthName(product.createdAt.getMonth())}{' '}
                      {product.createdAt.getFullYear()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className='flex flex-col items-center'>
                      <div className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] mb-4'>
                        <Package className='h-8 w-8 text-[var(--text-muted)]' />
                      </div>
                      <p className='text-lg font-semibold text-[var(--text-primary)] mb-1'>
                        No Products Yet
                      </p>
                      <p className='text-sm text-[var(--text-secondary)]'>
                        Click "Add Product" to create your first product
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </DataTable>
          </TabsContent>
        </TabsMenu>
      </div>
    </div>
  )
}

export default ProductTable