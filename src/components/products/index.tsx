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
      <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white'>
              <Package className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-slate-950 dark:text-white'>
                Products
              </h2>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
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
                'bg-gradient-to-r from-blue-500 to-blue-600',
                'hover:from-blue-600 hover:to-blue-700',
                'text-white font-semibold text-sm',
                'shadow-lg shadow-blue-500/30',
                'transition-all duration-200',
                'hover:shadow-xl hover:shadow-blue-500/40'
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
                    className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                  >
                    <TableCell>
                      <div className='relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800'>
                        <Image
                          src={`https://ucarecdn.com/${product.image}/`}
                          fill
                          className='object-cover'
                          alt={product.name}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='font-medium text-slate-950 dark:text-white'>
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold'>
                        ${product.price}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-600 dark:text-slate-300">
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
                      <div className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4'>
                        <Package className='h-8 w-8 text-slate-400' />
                      </div>
                      <p className='text-lg font-semibold text-slate-950 dark:text-white mb-1'>
                        No Products Yet
                      </p>
                      <p className='text-sm text-slate-600 dark:text-slate-300'>
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