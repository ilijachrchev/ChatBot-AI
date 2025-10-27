import { useDomain } from '@/hooks/sidebar/use-domain'
import { cn } from '@/lib/utils'
import React from 'react'
import AppDrawer from '../drawer'
import { Plus } from 'lucide-react'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import UploadButton from '../upload-button'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  min?: boolean
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

const DomainMenu = ({ domains, min }: Props) => {
  const { register, onAddDomain, loading, errors, isDomain } = useDomain()

  return (
    <div className={cn('flex flex-col gap-3', min ? 'mt-6' : 'mt-3')}>
      <div className="flex justify-between w-full items-center">
        {!min && <p className="text-xs text-gray-500">DOMAINS</p>}
        <AppDrawer
          description="add in your domain address to integrate your chatbot"
          title="Add your business domain"
          onOpen={
            <div className="cursor-pointer text-gray-500 rounded-full border-2">
              <Plus />
            </div>
          }
        >
          <Loader loading={loading}>
            <form
              className="mt-3 w-6/12 flex flex-col gap-3"
              onSubmit={onAddDomain}
            >
              <FormGenerator
                inputType="input"
                register={register}
                label="Domain"
                name="domain"
                errors={errors}
                placeholder="mydomain.com"
                type="text"
              />
              <UploadButton
                register={register}
                label="Upload Icon"
                errors={errors}
              />
              <Button
                type="submit"
                className="w-full"
              >
                Add Domain
              </Button>
            </form>
          </Loader>
        </AppDrawer>
      </div>
      <div className="flex flex-col gap-1 text-ironside font-medium">
{domains &&
  domains.map((domain) => {
    const raw = (domain.icon ?? '').trim();
    const empty = !raw || raw === 'null' || raw === 'undefined';

    // Use full URL if stored; otherwise treat as Uploadcare UUID
    const ucUrl = empty
      ? ''
      : raw.startsWith('http')
        ? raw
        : `https://ucarecdn.com/${raw}/-/preview/`;

    const iconSrc = ucUrl || '/favicon.ico';

    return (
      <Link
        href={`/settings/${domain.name.split('.')[0]}`}
        key={domain.id}
        className={cn(
          'flex gap-3 items-center justify-center hover:bg-white rounded-full transition duration-100 ease-in-out cursor-pointer',
          !min ? 'p-2' : 'py-2',
          domain.name.split('.')[0] == isDomain && 'bg-white'
        )}
      >
        <img
          src={iconSrc}
          alt={`${domain.name} logo`}
          width={20}
          height={20}
          className="shrink-0 rounded"
          onError={(e) => { e.currentTarget.src = '/favicon.ico'; }}
        />
        {!min && <p className="text-sm">{domain.name}</p>}
      </Link>
    );
  })}



      </div>
    </div>
  )
}

export default DomainMenu